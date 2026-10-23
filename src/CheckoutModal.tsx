import React, { useState } from 'react';
import { 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft, 
  Truck, 
  Lock, 
  Loader2, 
  CheckCircle,
  Smartphone,
  Globe,
  Coins,
  Mail
} from 'lucide-react';
import { calculateShippingQuote } from './utils/shipping';

interface CheckoutModalProps {
  cartItems: Array<{ _id: string; product: { name: string; price: number; images?: string[] }; quantity: number }>;
  subtotal: number;
  onClose: () => void;
  onCompleteOrder: (orderData: any) => void;
}

export default function CheckoutModal({ cartItems, subtotal, onClose, onCompleteOrder }: CheckoutModalProps) {
  // Navigation Steps: 'shipping' | 'payment' | 'review'
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');

  // Shipping & Location State
  const [locationName, setLocationName] = useState('Nairobi CBD');
  const [distanceKm, setDistanceKm] = useState(5);
  const [customerEmail, setCustomerEmail] = useState('wycliff@neuratech.co.ke');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa' | 'paypal' | 'crypto'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [mpesaPhone, setMpesaPhone] = useState('254712345678');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Shipping Rate Calculation
  const shippingQuote = calculateShippingQuote(locationName, distanceKm, subtotal);
  const total = subtotal + shippingQuote.fee;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('payment');
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (paymentMethod === 'mpesa' && !/^(0|254|\+254)?[71]\d{8}$/.test(mpesaPhone.replace(/\s/g, ''))) {
      setError('Enter a valid Safaricom number (e.g. 0712345678)');
      return;
    }

    setIsProcessing(true);
    setStep('review');

    // Simulate verification delay (gateway / STK push confirmation)
    setTimeout(() => {
      setIsProcessing(false);
      const finalOrder = {
        orderId: `#NT-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentMethod: paymentMethod.toUpperCase(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        estDelivery: shippingQuote.estDelivery,
        shippingAddress: locationName,
        distanceKm: shippingQuote.distanceKm,
        subtotal,
        shippingFee: shippingQuote.fee,
        total,
        customerEmail,
        status: 'Paid' as const,
        items: cartItems.map((item, idx) => ({
          id: item._id || String(idx),
          name: item.product.name,
          specs: 'Standard Edition / Quality Checked',
          qty: item.quantity,
          price: item.product.price,
          image: item.product.images?.[0] || '/images/HP ProBook 640 G5G4.jpg',
        })),
      };
      onCompleteOrder(finalOrder);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto py-8 px-4 flex items-center justify-center font-sans">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Step Progress Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <span className="text-sm font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400">
            NeuraTech Checkout
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className={step === 'shipping' ? 'text-emerald-400 font-bold underline' : 'text-slate-400'}>1. Shipping</span>
            <span className="text-slate-600">→</span>
            <span className={step === 'payment' ? 'text-emerald-400 font-bold underline' : 'text-slate-400'}>2. Payment</span>
            <span className="text-slate-600">→</span>
            <span className={step === 'review' ? 'text-emerald-400 font-bold underline' : 'text-slate-400'}>3. Review</span>
          </div>
        </div>

        {/* STEP 1: SHIPPING LOCATION */}
        {step === 'shipping' && (
          <form onSubmit={handleProceedToPayment} className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" /> Delivery Destination & Rates
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Nairobi orders over KSh 10,000 enjoy <strong>FREE shipping</strong>. Places beyond 50 km deliver in 1–2 business days.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-purple-600" /> Customer Email (For Receipt Dispatch)
                </label>
                <input 
                  type="email" 
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Search Delivery Location (Google Maps Enabled)</label>
                <input 
                  type="text" 
                  required
                  value={locationName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocationName(val);
                    // Simulated Google Distance matrix lookup
                    if (val.toLowerCase().includes('cbd') || val.toLowerCase().includes('nairobi')) setDistanceKm(5);
                    else if (val.toLowerCase().includes('westlands')) setDistanceKm(8);
                    else if (val.toLowerCase().includes('juja')) setDistanceKm(35);
                    else if (val.toLowerCase().includes('mombasa') || val.toLowerCase().includes('nakuru')) setDistanceKm(480);
                    else setDistanceKm(20);
                  }}
                  placeholder="e.g. Westlands, Juja, Nakuru, Karen..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-purple-50/70 p-4 rounded-xl border border-purple-100">
                <div>
                  <span className="text-slate-500 block">Calculated Distance:</span>
                  <span className="font-bold text-slate-900">{shippingQuote.distanceKm} km from Hub</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Est. Delivery:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> {shippingQuote.estDelivery}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-purple-200 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Calculated Shipping Fee:</span>
                  <span className="font-extrabold text-purple-900 text-sm">
                    {shippingQuote.fee === 0 ? 'FREE' : `KSh ${shippingQuote.fee.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Cart
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition shadow-lg cursor-pointer"
              >
                Continue to Payment →
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT METHOD SELECTION */}
        {step === 'payment' && (
          <form onSubmit={handleExecutePayment} className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" /> Payment Method
              </h2>
              <p className="text-xs text-slate-500 mt-1">Select your gateway below.</p>
            </div>

            {/* Gateway Selector Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition ${paymentMethod === 'card' ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold' : 'border-slate-200 text-slate-600'}`}
              >
                <CreditCard className="w-5 h-5" /> Debit/Credit
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition ${paymentMethod === 'mpesa' ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold' : 'border-slate-200 text-slate-600'}`}
              >
                <Smartphone className="w-5 h-5 text-emerald-600" /> M-Pesa STK
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold' : 'border-slate-200 text-slate-600'}`}
              >
                <Globe className="w-5 h-5 text-blue-600" /> PayPal
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition ${paymentMethod === 'crypto' ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold' : 'border-slate-200 text-slate-600'}`}
              >
                <Coins className="w-5 h-5 text-amber-600" /> Crypto / USDT
              </button>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            {/* Input Details Container */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
              {paymentMethod === 'card' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM/YY" defaultValue="12/28" className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none" required />
                    <input type="password" placeholder="CVV" defaultValue="389" className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none" required />
                  </div>
                </>
              )}
              {paymentMethod === 'mpesa' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">M-Pesa Phone Number</label>
                  <input type="text" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="0712345678" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none" required />
                  <p className="text-[10px] text-slate-400 mt-1">An STK push prompt will arrive on your handset upon submitting.</p>
                </div>
              )}
              {paymentMethod === 'paypal' && (
                <p className="text-center py-2 text-slate-600">You will authorize secure checkout with PayPal upon clicking submit.</p>
              )}
              {paymentMethod === 'crypto' && (
                <div className="text-center py-2 space-y-1">
                  <p className="text-slate-600">Send USDT (TRC20) to NeuraTech wallet:</p>
                  <code className="bg-white px-2 py-1 rounded border text-purple-900 font-mono text-[10px]">0xNeuraTechSecureTreasuryWallet8492</code>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setStep('shipping')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Shipping
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-lg cursor-pointer flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" /> Pay KSh {total.toLocaleString()} & Submit
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: UNDER REVIEW / VERIFICATION */}
        {step === 'review' && (
          <div className="p-12 text-center space-y-6">
            {isProcessing ? (
              <>
                <div className="w-16 h-16 bg-purple-100 text-purple-900 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Order Under Review</h2>
                  <p className="text-xs text-slate-500 mt-1">Verifying transaction authorization with payment network...</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Payment Confirmed!</h2>
                  <p className="text-xs text-slate-500 mt-1">Opening official digital receipt...</p>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}