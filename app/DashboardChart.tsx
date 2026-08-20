"use client";
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardChart({ data }: { data: any[] }) {
  const [timeframe, setTimeframe] = useState('ALL');

  const maxProfit = data.length > 0 ? Math.max(...data.map(d => d.pl), 0) : 0;
  const maxLoss = data.length > 0 ? Math.min(...data.map(d => d.pl), 0) : 0;

  // Custom Tooltip yang interaktif dan halus saat di-hover
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentPL = payload[0].value;
      const isProfit = currentPL >= 0;

      return (
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl shadow-2xl transition-all duration-200">
          <p className="text-[11px] text-slate-400 font-medium mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isProfit ? 'bg-emerald-400 animate-ping' : 'bg-rose-400 animate-ping'}`}></span>
            <span className="text-xs text-slate-300 font-sans">Profit / Loss:</span>
            <span className={`text-sm font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfit ? `+$${currentPL.toFixed(2)}` : `-$${Math.abs(currentPL).toFixed(2)}`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-2xl transition-all duration-300 hover:border-slate-700">
      
      {/* Header Grafik & Tombol Timeframe */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-xl font-bold text-white tracking-tight">Analisis Performa P&L</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Kurva pertumbuhan modal dan ekuitas trading secara visual</p>
        </div>

        {/* Tombol Filter Timeframe */}
        <div className="flex items-center bg-slate-950 border border-slate-800/80 p-1 rounded-xl">
          {['ALL', '1W', '1M'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all duration-200 cursor-pointer ${timeframe === tf ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Mini Statistik Grafik */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-950/60 border border-slate-800/50 p-3 rounded-xl flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Profit Tertinggi (Peak)</span>
          <span className="text-xs font-bold font-mono text-emerald-400">+${maxProfit.toFixed(2)}</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/50 p-3 rounded-xl flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Drawdown Terdalam</span>
          <span className="text-xs font-bold font-mono text-rose-400">-${Math.abs(maxLoss).toFixed(2)}</span>
        </div>
      </div>

      {/* Grafik Area dengan Gradien & Tooltip Halus */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            
            <Tooltip content={<CustomTooltip />} />

            <Area 
              type="monotone" 
              dataKey="pl" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPl)" 
              activeDot={{ r: 8, fill: '#34d399', stroke: '#020617', strokeWidth: 3 }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}