import { ShieldCheck, Download, ArrowLeft, MapPin, Truck, Hash, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { imageUrl } from './imageUrl';

interface OrderReceiptProps {
  onClose: () => void;
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
    status: 'Paid' | 'Pending';
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
  const order = orderData || {
    orderId: '#NT-84920F',
    paymentMethod: 'CARD',
    date: 'Oct 23, 2026',
    estDelivery: '1 Day',
    shippingAddress: 'Juja Town, Kiambu',
    distanceKm: 35,
    subtotal: 16749,
    shippingFee: 250,
    total: 16999,
    customerEmail: 'wycliffemutua8463@gmail.com',
    status: 'Paid',
    items: [
      {
        id: '1',
        name: 'HP ProBook 640 G5/G4',
        specs: 'Standard Edition / Quality Checked',
        qty: 1,
        price: 16999,
        image: '/images/laptop.jpg',
      }
    ]
  };

  const handleDownloadPDF = () => {
    const primaryItemName = order.items[0]?.name.replace(/[^a-zA-Z0-9]/g, '_') || 'NeuraTech_Order';
    const customFileName = `${primaryItemName}_Receipt`;
    
    const originalTitle = document.title;
    document.title = customFileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* FOOLPROOF SINGLE-PAGE PRINT HACK: Hides entire app body except #printable-receipt */}
      <style>{`
        @media print {
          @page {
            size: portrait;
            margin: 10mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible !important;
          }
          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Printable Receipt Container ID */}
      <div id="printable-receipt" className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 px-8 py-6 text-white text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400">
              NeuraTech.
            </span>
          </div>
          
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full mb-2 border border-emerald-500/40 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Order Confirmed!</h1>
          <p className="text-purple-200 mt-1 text-xs">
            Payment verified. Official digital receipt dispatched to <span className="text-white font-semibold underline">{order.customerEmail}</span>.
          </p>
        </div>

        <div className="bg-slate-900 px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 print-hidden">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Status:</span> 
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {order.status} & Confirmed
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
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-emerald-900/30 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 font-semibold tracking-wider">ORDER ID</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-purple-600" /> {order.orderId}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-semibold tracking-wider">PAYMENT</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" /> {order.paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-semibold tracking-wider">DATE</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-600" /> {order.date}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-semibold tracking-wider">EST. DELIVERY</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> {order.estDelivery}
            </span>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-slate-200 flex items-start justify-between bg-white text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block uppercase tracking-wider">Shipping Destination</span>
              <span className="text-slate-600">{order.shippingAddress}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block font-semibold">DISTANCE</span>
            <span className="font-bold text-slate-800">{order.distanceKm} km from Hub</span>
          </div>
        </div>

        <div className="px-6 py-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ordered Items</h3>
          
          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-slate-50 flex items-center justify-center p-1 shrink-0 border border-slate-200">
                    <img src={imageUrl(item.image)} alt={item.name} className="max-h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                    <p className="text-[11px] text-slate-500">Qty: {item.qty} | KSh {item.price.toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900">KSh {(item.qty * item.price).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="p-1 bg-white rounded-lg border border-slate-100 shrink-0">
              <QRCodeSVG 
                value={`https://neuratech.co.ke/verify-order/${order.orderId}`}
                size={75}
                level="H"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Verified Authenticity</span>
              <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">Scan QR code to inspect transaction ledger on NeuraTech secure network.</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">KSh {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee ({order.distanceKm} km)</span>
              {order.shippingFee === 0 ? (
                <span className="font-semibold text-emerald-600">FREE</span>
              ) : (
                <span className="font-semibold text-slate-800">KSh {order.shippingFee.toLocaleString()}</span>
              )}
            </div>
            <div className="flex justify-between text-slate-600">
              <span>V.A.T (Included)</span>
              <span className="font-semibold text-slate-800">KSh 0.00</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Paid</span>
              <span className="text-purple-900">KSh {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Digital receipt successfully emailed to {order.customerEmail}
          </p>
          <p className="text-slate-400">Support: <strong className="text-slate-600">support@neuratech.co.ke</strong></p>
        </div>

      </div>
    </div>
  );
}