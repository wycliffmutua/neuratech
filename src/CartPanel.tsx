import { useState, useEffect } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'
import { imageUrl } from './imageUrl'
import { calculateShippingQuote } from './utils/shipping'
import { findDeliveryLocations } from './utils/locations'
import { QRCodeSVG } from 'qrcode.react'
import { MapPin, CreditCard, Smartphone, Globe, Coins, ShieldCheck, Download, ArrowLeft, Mail, Truck, Hash, Calendar } from 'lucide-react'

function CartPanel({ onClose }: { onClose: () => void }) {
  const cart = useQuery(api.cart.getCart)
  const updateQuantity = useMutation(api.cart.updateQuantity)
  const removeFromCart = useMutation(api.cart.removeFromCart)
  const createOrder = useMutation(api.orders.createOrder)
  const confirmSimulatedPayment = useMutation(api.orders.confirmSimulatedPayment)
  const initiateSTKPush = useAction(api.mpesa.initiateSTKPush)

  // Expanded step flow: 'cart' | 'shipping' | 'payment' | 'phone' | 'waiting' | 'success' | 'failed'
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'phone' | 'waiting' | 'success' | 'failed'>('cart')
  
  // Shipping & Location states
  const [locationName, setLocationName] = useState('Nairobi CBD')
  const [locationSearch, setLocationSearch] = useState('Nairobi CBD')
  const [distanceKm, setDistanceKm] = useState(5)
  const [customerEmail, setCustomerEmail] = useState('wycliff@neuratech.co.ke')

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa' | 'paypal' | 'crypto'>('card')
  const [phone, setPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242')
  const [error, setError] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<Id<'orders'> | null>(null)
  const [paidAmount, setPaidAmount] = useState(0)

  const myOrders = useQuery(
    api.orders.getMyOrders,
    step === 'waiting' ? {} : 'skip'
  )

  const subtotal = cart?.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  ) ?? 0

  // Calculate dynamic shipping quote based on distance and Nairobi free rule (>= 10,000 KSh)
  const shippingQuote = calculateShippingQuote(locationName, distanceKm, subtotal)
  const total = subtotal + shippingQuote.fee

  useEffect(() => {
    if (step !== 'waiting' || !pendingOrderId || !myOrders) return
    const order = myOrders.find((o) => o._id === pendingOrderId)
    if (order?.status === 'paid') {
      setStep('success')
    } else if (order?.status === 'cancelled') {
      setStep('failed')
    }
  }, [myOrders, step, pendingOrderId])

  const handleProceedToShipping = () => {
    setError(null)
    setStep('shipping')
  }

  const handleExecutePayment = async () => {
    setError(null)
    const amountToPay = total
    setPaidAmount(amountToPay)

    if (paymentMethod === 'mpesa') {
      if (!/^(0|254|\+254)?[71]\d{8}$/.test(phone.replace(/\s/g, ''))) {
        setError('Enter a valid Safaricom number (e.g. 0712345678)')
        return
      }

      try {
        const orderId = await createOrder({ shippingAddress: locationName, distanceKm: shippingQuote.distanceKm, shippingFee: shippingQuote.fee, customerEmail, paymentMethod: paymentMethod.toUpperCase() })
        setPendingOrderId(orderId)
        setStep('waiting')
        await initiateSTKPush({ phoneNumber: phone, amount: amountToPay, orderId })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment failed to start')
        setStep('payment')
      }
    } else {
      // Simulate Card, PayPal, or Crypto verification & processing review
      try {
        const orderId = await createOrder({ shippingAddress: locationName, distanceKm: shippingQuote.distanceKm, shippingFee: shippingQuote.fee, customerEmail, paymentMethod: paymentMethod.toUpperCase() })
        setPendingOrderId(orderId)
        setStep('waiting')
        
        // Simulating gateway confirmation delay
        setTimeout(async () => {
          try {
            await confirmSimulatedPayment({ orderId })
            setStep('success')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment confirmation failed')
            setStep('failed')
          }
        }, 2500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transaction verification failed')
      }
    }
  }

  if (step === 'success') {
    return <Receipt orderId={pendingOrderId} onClose={onClose} shippingAddress={locationName} distanceKm={shippingQuote.distanceKm} estDelivery={shippingQuote.estDelivery} shippingFee={shippingQuote.fee} customerEmail={customerEmail} paymentMethod={paymentMethod.toUpperCase()} />
  }

  if (step === 'failed') {
    return (
      <div className="fixed inset-0 z-20 flex justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="text-xs font-bold tracking-[0.2em] text-red-500 uppercase mb-4">Payment paused</div>
          <h2 className="text-xl font-bold mb-2">Payment not completed</h2>
          <p className="text-slate-500 mb-6">
            The payment transaction was cancelled or failed. Your order is saved. You can retry from My Orders.
          </p>
          <button
            onClick={onClose}
            className="bg-purple-900 hover:bg-purple-800 text-white px-6 py-3 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (step === 'waiting') {
    return (
      <div className="fixed inset-0 z-20 flex justify-end">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="text-xs font-bold tracking-[0.2em] text-purple-600 uppercase mb-4 animate-pulse">Processing Payment & Review</div>
          <h2 className="text-xl font-bold mb-2">Verifying Transaction</h2>
          <p className="text-slate-500 text-xs">
            {paymentMethod === 'mpesa' 
              ? `Check your phone for the M-Pesa prompt sent to ${phone} to complete payment of` 
              : `Processing secure ${paymentMethod.toUpperCase()} transaction for`}
            <span className="font-semibold text-purple-900 block text-base mt-1">KSh {paidAmount.toLocaleString()}</span>
          </p>
        </div>
      </div>
    )
  }

  // STEP 2: SHIPPING LOCATION SELECTION
  if (step === 'shipping') {
    return (
      <div className="fixed inset-0 z-20 flex justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col p-6 overflow-y-auto">
          <button
            onClick={() => setStep('cart')}
            className="text-slate-400 hover:text-slate-700 text-sm mb-4 self-start flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
          
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" /> Shipping Destination
          </h2>
          <p className="text-slate-500 text-xs mb-6">
            Free shipping in Nairobi on orders over KSh 10,000. Distances over 50 km deliver in 1-2 business days.
          </p>

          <form onSubmit={(event) => { event.preventDefault(); setLocationSearch(locationName); setStep('payment') }} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email for Receipt & Tracking</label>
              <input 
                type="email" 
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="relative">
              <label className="block font-semibold text-slate-700 mb-1">Search / Select Delivery Location</label>
              <input 
                type="text" 
                required
                value={locationSearch}
                onChange={(e) => {
                  const val = e.target.value
                  setLocationSearch(val)
                  setLocationName(val)
                  const match = findDeliveryLocations(val)[0]
                  if (match) setDistanceKm(match.distance)
                  else if (val.toLowerCase().includes('nairobi') || val.toLowerCase().includes('cbd')) setDistanceKm(5)
                  else setDistanceKm(18)
                }}
                placeholder="Search Nairobi, Juja, Westlands..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
              />
              {findDeliveryLocations(locationSearch).length > 0 && locationSearch !== locationName && (
                <ul className="absolute z-30 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto mt-1">
                  {findDeliveryLocations(locationSearch).map((place) => (
                    <li key={place.name}>
                      <button type="button" onClick={() => { setLocationName(place.name); setLocationSearch(place.name); setDistanceKm(place.distance) }} className="w-full px-3 py-2.5 hover:bg-purple-50 text-left flex justify-between items-center text-slate-700 border-b border-slate-100 last:border-none">
                        <span className="font-medium text-slate-800">{place.name}</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">{place.distance} km away</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Calculated Distance:</span>
                <span className="font-bold text-slate-800">{distanceKm} km from Hub</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Est. Delivery Time:</span>
                <span className="font-bold text-emerald-600">{shippingQuote.estDelivery}</span>
              </div>
              <div className="pt-2 border-t border-purple-200 flex justify-between font-bold text-slate-900">
                <span>Shipping Fee:</span>
                <span className="text-purple-900">{shippingQuote.fee === 0 ? 'FREE' : `KSh ${shippingQuote.fee.toLocaleString()}`}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-900 hover:bg-purple-800 text-white py-3 rounded-lg font-bold transition shadow-lg cursor-pointer mt-4"
            >
              Continue to Payment →
            </button>
          </form>
        </div>
      </div>
    )
  }

  // STEP 3: PAYMENT METHOD SELECTION
  if (step === 'payment') {
    return (
      <div className="fixed inset-0 z-20 flex justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col p-6 overflow-y-auto">
          <button
            onClick={() => setStep('shipping')}
            className="text-slate-400 hover:text-slate-700 text-sm mb-4 self-start flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shipping
          </button>

          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" /> Select Payment Method
          </h2>
          <p className="text-slate-500 text-xs mb-6">Choose your preferred secure checkout option.</p>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold mb-6">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition ${paymentMethod === 'card' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-slate-200 text-slate-600'}`}
            >
              <CreditCard className="w-5 h-5" /> Debit/Credit Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('mpesa')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition ${paymentMethod === 'mpesa' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-slate-200 text-slate-600'}`}
            >
              <Smartphone className="w-5 h-5 text-emerald-600" /> M-Pesa STK
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('paypal')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-slate-200 text-slate-600'}`}
            >
              <Globe className="w-5 h-5 text-blue-600" /> PayPal
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('crypto')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition ${paymentMethod === 'crypto' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-slate-200 text-slate-600'}`}
            >
              <Coins className="w-5 h-5 text-amber-600" /> Crypto / USDT
            </button>
          </div>

          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3 mb-6">
            {paymentMethod === 'card' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                  <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM/YY" defaultValue="12/28" className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none" />
                  <input type="password" placeholder="CVV" defaultValue="389" className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none" />
                </div>
              </>
            )}
            {paymentMethod === 'mpesa' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">M-Pesa Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none" />
              </div>
            )}
            {paymentMethod === 'paypal' && (
              <p className="text-slate-600 py-2 text-center">You will authorize secure payment with PayPal upon confirmation.</p>
            )}
            {paymentMethod === 'crypto' && (
              <div className="text-center py-2 space-y-1">
                <p className="text-slate-600">Send USDT (TRC20) to treasury address:</p>
                <code className="bg-white px-2 py-1 rounded border text-purple-900 font-mono text-[10px]">0xNeuraTechSecureTreasuryWallet8492</code>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs mb-6 bg-purple-50/50 p-3 rounded-lg border border-purple-100">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>KSh {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span>{shippingQuote.fee === 0 ? 'FREE' : `KSh ${shippingQuote.fee.toLocaleString()}`}</span>
            </div>
            <div className="border-t border-purple-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
              <span>Total Payable</span>
              <span className="text-purple-900">KSh {total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleExecutePayment}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Pay KSh {total.toLocaleString()} & Submit
          </button>
        </div>
      </div>
    )
  }

  // STEP 1: CART VIEW
  return (
    <div className="fixed inset-0 z-20 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none cursor-pointer">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart?.length === 0 && (
            <p className="text-slate-400 text-center py-12">Your cart is empty.</p>
          )}
          {cart?.map((item) => (
            <div key={item._id} className="flex gap-4 items-center">
              <img
                src={imageUrl(item.product?.images[0])}
                alt={item.product?.name}
                className="w-16 h-16 object-contain bg-slate-100 rounded-lg p-1"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product?.name}</p>
                <p className="text-purple-900 font-semibold text-sm">
                  KSh {item.product?.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => updateQuantity({ cartItemId: item._id, quantity: item.quantity - 1 })}
                    className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 cursor-pointer"
                  >
                    −
                  </button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity({ cartItemId: item._id, quantity: item.quantity + 1 })}
                    className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeFromCart({ cartItemId: item._id })}
                className="text-slate-400 hover:text-red-500 text-sm cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {cart && cart.length > 0 && (
          <div className="p-6 border-t border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-slate-700">Subtotal</span>
              <span className="font-bold text-lg text-purple-900">
                KSh {subtotal.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleProceedToShipping}
              className="w-full bg-purple-900 hover:bg-purple-800 text-white py-3 rounded-xl font-bold transition shadow-lg cursor-pointer"
            >
              Proceed to Shipping & Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Receipt({ 
  orderId, 
  onClose, 
  shippingAddress, 
  distanceKm, 
  estDelivery, 
  shippingFee, 
  customerEmail, 
  paymentMethod 
}: { 
  orderId: Id<'orders'> | null; 
  onClose: () => void;
  shippingAddress: string;
  distanceKm: number;
  estDelivery: string;
  shippingFee: number;
  customerEmail: string;
  paymentMethod: string;
}) {
  const order = useQuery(
    api.orders.getOrderReceipt,
    orderId ? { orderId } : 'skip'
  )
  const orderDate = order ? new Date(order.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString('en-KE')

  return (
    <div className="fixed inset-0 z-30 bg-slate-900/80 backdrop-blur-sm overflow-y-auto py-8 px-4 flex items-center justify-center font-sans">
      <style>{`@media print { @page { size: A4 portrait; margin: 10mm; } body * { visibility: hidden !important; } #printable-receipt, #printable-receipt * { visibility: visible !important; } #printable-receipt { position: absolute !important; inset: 0 auto auto 0 !important; width: 100% !important; max-width: none !important; box-shadow: none !important; border: 0 !important; } .print-hidden { display:none !important; } }`}</style>
      <div id="printable-receipt" className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header with NeuraTech Branding */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 px-8 py-8 text-white text-center relative">
          <div className="flex justify-center items-center gap-2 mb-3">
            <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-purple-400 text-xl font-black text-purple-300">N</span>
            <span className="text-3xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400">
              NeuraTech.
            </span>
          </div>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full mb-3 border border-emerald-500/40 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Order Confirmed!</h1>
          <p className="text-purple-200 mt-1 text-xs sm:text-sm">
            Payment verified. Confirmation sent to <span className="text-white font-semibold underline">{customerEmail}</span>.
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 print-hidden">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Status:</span> 
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Paid & Confirmed
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition border border-slate-700 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              Back to Shop
            </button>
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-emerald-900/30 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block mb-1 font-semibold tracking-wider">ORDER ID</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-purple-600" /> #{orderId ? orderId.slice(-8) : 'NT-84920F'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 font-semibold tracking-wider">PAYMENT</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" /> {paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 font-semibold tracking-wider">DATE</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-600" /> {orderDate}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 font-semibold tracking-wider">EST. DELIVERY</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> {estDelivery}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="px-8 py-4 border-b border-slate-200 flex items-start justify-between bg-white">
          <div className="flex items-start gap-3 text-xs">
            <MapPin className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block uppercase tracking-wider">Shipping Address</span>
              <span className="text-slate-600">{shippingAddress}</span>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-400 block font-semibold">DISTANCE</span>
            <span className="font-bold text-slate-800">{distanceKm} km from Hub</span>
          </div>
        </div>

        {/* Product Items List */}
        <div className="px-8 py-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Ordered Items</h3>
          
          <div className="divide-y divide-slate-100">
            {order?.items.map((item) => (
              <div key={item._id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center p-1.5 shrink-0 border border-slate-200">
                    <img src={imageUrl(item.product?.images[0])} alt={item.product?.name ?? 'Product'} className="max-h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.product?.name ?? 'Product'}</h4>
                    <p className="text-xs text-slate-500">Qty: {item.quantity} | KSh {item.priceAtPurchase.toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">KSh {(item.quantity * item.priceAtPurchase).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Centered QR Code Section */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-inner">
              <QRCodeSVG 
                value={`https://neuratech.co.ke/verify-order/${orderId ?? 'NT-84920F'}`}
                size={95}
                level="H"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-wider">
              Scan to Verify Order Authenticity
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">KSh {order?.total ? (order.total - shippingFee).toLocaleString() : '0'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee ({distanceKm} km)</span>
              {shippingFee === 0 ? (
                <span className="font-semibold text-emerald-600">FREE</span>
              ) : (
                <span className="font-semibold text-slate-800">KSh {shippingFee.toLocaleString()}</span>
              )}
            </div>
            <div className="flex justify-between text-slate-600">
              <span>V.A.T (Included)</span>
              <span className="font-semibold text-slate-800">KSh 0.00</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Paid</span>
              <span className="text-purple-900">KSh {order?.total.toLocaleString() ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-5 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-purple-600" /> Confirmation sent to {customerEmail}
          </p>
          <p>Support: <strong>support@neuratech.co.ke</strong></p>
        </div>

      </div>
    </div>
  )
}

export default CartPanel
