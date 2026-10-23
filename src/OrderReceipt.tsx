import React from 'react';
import { 
  CheckCircle, 
  Download, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Hash, 
  Mail, 
  ShieldCheck, 
  ArrowLeft,
  Truck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { imageUrl } from './imageUrl';

interface OrderReceiptProps {
  onClose?: () => void;
  orderData?: {
    orderId: string;
    paymentMethod: string;
    date: string;
    estDelivery: string;
    shippingAddress: string;
    distanceKm: number;
    subtotal: number;
    shippingFee: number;
    total: number;
    customerEmail: string;
    status: 'Under Review' | 'Paid';
    items: Array<{
      id: string;
      name: string;
      specs: string;
      qty: number;
      price: number;
      image: string;
    }>;
  };
}

export default function OrderReceipt({ onClose, orderData }: OrderReceiptProps) {
  // Fallback data for testing/preview mode
  const data = orderData || {
    orderId: '#NT-84920F',
    paymentMethod: 'Debit Card / PayPal',
    date: 'Oct 23, 2026',
    estDelivery: '1–2 Business Days',
    shippingAddress: 'Juja Town, Kiambu County, Kenya',
    distanceKm: 35,
    subtotal: 34500,
    shippingFee: 250,
    total: 34750,
    customerEmail: 'wycliff@neuratech.co.ke',
    status: 'Paid' as const,
    items: [
      {
        id: '1',
        name: 'HP ProBook 640 G5/G4',
        specs: 'Core i5 - 8GB RAM - 256GB SSD',
        qty: 1,
        price: 30000,
        image: '/images/HP ProBook 640 G5G4.jpg',
      },
      {
        id: '2',
        name: 'Wireless Bluetooth Headphones',
        specs: 'Color: Black / Premium ANC',
        qty: 1,
        price: 4500,
        image: '/images/Bluedee BH200 Premium Active Noise Cancelling Wireless Headphones.jpg',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header with NeuraTech Branding */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 px-8 py-8 text-white text-center relative">
          <div className="flex justify-center items-center gap-2 mb-3">
            <span className="text-3xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400">
              NeuraTech.
            </span>
          </div>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full mb-3 border border-emerald-500/40 shadow-inner">
            <CheckCircle className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Order Confirmed!</h1>
          <p className="text-purple-200 mt-1 text-xs sm:text-sm">
            Payment verified. A confirmation receipt was emailed to <span className="text-white font-semibold underline">{data.customerEmail}</span>.
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Status:</span> 
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {data.status}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {onClose && (
              <button 
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition border border-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-purple-400" />
                Back to Shop
              </button>
            )}
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-emerald-900/30 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Order Details Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block mb-1 font-semibold tracking-wider">ORDER ID</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-purple-600" /> {data.orderId}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 font-semibold tracking-wider">PAYMENT</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" /> {data.paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 font-semibold tracking-wider">DATE</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-600" /> {data.date}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 font-semibold tracking-wider">EST. DELIVERY</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> {data.estDelivery}
            </span>
          </div>
        </div>

        {/* Shipping Location & Distance Info */}
        <div className="px-8 py-4 border-b border-slate-200 flex items-start justify-between bg-white">
          <div className="flex items-start gap-3 text-xs">
            <MapPin className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block uppercase tracking-wider">Shipping Address</span>
              <span className="text-slate-600">{data.shippingAddress}</span>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-400 block font-semibold">DISTANCE</span>
            <span className="font-bold text-slate-800">{data.distanceKm} km from Hub</span>
          </div>
        </div>

        {/* Product Items List */}
        <div className="px-8 py-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Ordered Items</h3>
          
          <div className="divide-y divide-slate-100">
            {data.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center p-1.5 shrink-0 border border-slate-200">
                    <img src={imageUrl(item.image)} alt={item.name} className="max-h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.specs} | Qty: {item.qty}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">KSh {item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Centered QR Code */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Dynamic Centered QR Code */}
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-inner">
              <QRCodeSVG 
                value={`https://neuratech.co.ke/verify-order/${data.orderId}`}
                size={95}
                level="H"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-wider">
              Scan to Verify Order Authenticity
            </span>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">KSh {data.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee ({data.distanceKm} km)</span>
              {data.shippingFee === 0 ? (
                <span className="font-semibold text-emerald-600">FREE</span>
              ) : (
                <span className="font-semibold text-slate-800">KSh {data.shippingFee.toLocaleString()}</span>
              )}
            </div>
            <div className="flex justify-between text-slate-600">
              <span>V.A.T (Included)</span>
              <span className="font-semibold text-slate-800">KSh 0.00</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Paid</span>
              <span className="text-purple-900">KSh {data.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-5 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-purple-600" /> Copy sent to {data.customerEmail}
          </p>
          <p>Support: <strong>support@neuratech.co.ke</strong></p>
        </div>

      </div>
    </div>
  );
}