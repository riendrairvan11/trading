"use client";
import { useState } from 'react';

export default function TradeForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    pair: 'XAUUSD',
    direction: 'Long',
    lot: 0.1,
    accountType: 'USD',
    resultType: 'Profit',
    amount: 0,
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const finalPL = formData.resultType === 'Loss' ? -Math.abs(formData.amount) : Math.abs(formData.amount);

    onSubmit({
      pair: formData.pair,
      direction: formData.direction,
      lot: formData.lot,
      accountType: formData.accountType,
      pl: finalPL,
    });

    setFormData({ ...formData, amount: 0 });
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-2xl relative overflow-hidden group transition-all duration-300 hover:border-slate-700 hover:shadow-emerald-500/5">
      {/* Efek Glow Latar Belakang */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
      
      <h3 className="text-xl font-bold text-white tracking-tight mb-1 relative z-10">Catat Posisi Baru</h3>
      <p className="text-xs text-slate-400 mb-6 relative z-10">Pilih status profit/loss dan masukkan nominal dengan mudah</p>
      
      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Pair</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-all duration-200 text-xs font-mono uppercase"
              value={formData.pair}
              onChange={(e) => setFormData({...formData, pair: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Arah</label>
            <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-all duration-200 text-xs"
            value={formData.direction}
            onChange={(e) => setFormData({...formData, direction: e.target.value})}
            >
            <option value="Buy" className="bg-slate-900 text-emerald-400">Buy</option>
            <option value="Sell" className="bg-slate-900 text-rose-400">Sell</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Lot Size</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-all duration-200 text-xs font-mono"
              value={formData.lot}
              onChange={(e) => setFormData({...formData, lot: parseFloat(e.target.value) || 0})}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Tipe Akun</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-all duration-200 text-xs font-mono"
              value={formData.accountType}
              onChange={(e) => setFormData({...formData, accountType: e.target.value})}
            >
              <option value="USD">USD Account</option>
              <option value="USC">USC (Cent) Account</option>
            </select>
          </div>
        </div>

        {/* Toggle Profit / Loss dengan Transisi Halus */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Status Hasil</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({...formData, resultType: 'Profit'})}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 border active:scale-95 ${formData.resultType === 'Profit' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-lg shadow-emerald-900/30 scale-[1.02]' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}
            >
              PROFIT (+)
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, resultType: 'Loss'})}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 border active:scale-95 ${formData.resultType === 'Loss' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-lg shadow-rose-900/30 scale-[1.02]' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}
            >
              LOSS (-)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Nominal P&L ({formData.accountType})</label>
          <input 
            type="number" 
            step="any"
            placeholder="Contoh: 50 atau 150.5"
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 focus:outline-none transition-all duration-300 text-xs font-mono font-bold ${formData.resultType === 'Profit' ? 'border-emerald-500/40 text-emerald-400 focus:border-emerald-400' : 'border-rose-500/40 text-rose-400 focus:border-rose-400'}`}
            value={formData.amount || ''}
            onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
        >
          Simpan ke Jurnal
        </button>
      </form>
    </div>
  );
}