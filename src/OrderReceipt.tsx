import { CheckCircle, Download, Eye, MapPin, CreditCard, Calendar, Hash } from 'lucide-react';
import { imageUrl } from './imageUrl';

export default function OrderReceipt({ onClose }: { onClose?: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header with NeuraTech Branding */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-8 py-8 text-white text-center relative">
          <div className="flex justify-center items-center gap-2 mb-3">
            <span className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400">
              NeuraTech.
            </span>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full mb-4 border border-emerald-500/30">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Order Completed!</h1>
          <p className="text-purple-200 mt-1 text-sm">Thank you. Your order has been received and is being processed.</p>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-900 px-8 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="text-xs text-slate-300">
            Status: <span className="text-emerald-400 font-semibold">Confirmed & Processing</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition border border-slate-700 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-purple-400" />
              Back to Shop
            </button>
            <button 
              onClick={() => alert('Downloading receipt...')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-lg shadow-emerald-900/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-purple-50/50 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block mb-1 font-medium">ORDER ID</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-purple-600" /> #NT-84920F
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 font-medium">PAYMENT METHOD</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" /> M-Pesa / Card
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 font-medium">ORDER DATE</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-600" /> Oct 14, 2026
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 font-medium">EST. DELIVERY</span>
            <span className="font-bold text-emerald-600">Oct 16, 2026</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="px-8 py-4 border-b border-slate-100 flex items-start gap-3 bg-white">
          <MapPin className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block">Shipping Address</span>
            <span className="text-slate-600">Grand Plaza, A43, Nairobi, Kenya (PIN-803404)</span>
          </div>
        </div>

        {/* Product Items List */}
        <div className="px-8 py-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Order Details & Items</h3>
          
          <div className="divide-y divide-slate-100">
            {/* Product 1 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center p-1 shrink-0 border border-slate-200">
                  <img src={imageUrl('/images/HP ProBook 640 G5G4.jpg')} alt="HP ProBook" className="max-h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">HP ProBook 640 G5/G4</h4>
                  <p className="text-xs text-slate-500">Core i5 - 8GB RAM - 256GB SSD | Qty: 1</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800">KSh 30,000</span>
            </div>

            {/* Product 2 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center p-1 shrink-0 border border-slate-200">
                  <img src={imageUrl('/images/Bluedee BH200 Premium Active Noise Cancelling Wireless Headphones.jpg')} alt="Headphones" className="max-h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Wireless Bluetooth Headphones</h4>
                  <p className="text-xs text-slate-500">Color: Black / Premium ANC | Qty: 1</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800">KSh 4,500</span>
            </div>
          </div>
        </div>

        {/* Pricing Summary & Barcode */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-200">
            <div className="font-mono tracking-widest text-lg font-bold text-slate-800 select-none">
              ||| | |||| |||| || ||| |||||
            </div>
            <span className="text-[10px] text-slate-400 mt-1">(00) 0 0123456 000000001 8</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">KSh 34,500</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes (Included)</span>
              <span className="font-semibold text-slate-800">KSh 0.00</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
              <span>Total</span>
              <span className="text-purple-900">KSh 34,500</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-6 border-t border-slate-100 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Thank you for shopping with <strong>NeuraTech</strong>!</p>
          <p>Need help? support@neuratech.co.ke</p>
        </div>

      </div>
    </div>
  );
}
