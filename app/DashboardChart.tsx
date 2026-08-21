"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardChart({ data }: { data: any[] }) {
  const minWidth = Math.max(data.length * 60, 500);

  // Perhitungan Ringkasan (Peak & Drawdown)
  const plValues = data.map((d) => Number(d.pl) || 0);
  const peakProfit = plValues.length > 0 ? Math.max(...plValues, 0) : 0;
  const maxDrawdown = plValues.length > 0 ? Math.min(...plValues, 0) : 0;

  // Hitung Titik Potong Gradient Warna (0 Offset)
  const gradientOffset = () => {
    if (plValues.length === 0) return 0.5;
    const max = Math.max(...plValues);
    const min = Math.min(...plValues);

    if (max <= 0) return 0;
    if (min >= 0) return 1;

    return max / (max - min);
  };

  const off = gradientOffset();

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
      
      {/* HEADER GRAFIK & METRIK RINGKAS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-lg font-extrabold text-white tracking-tight">Analisis Performa P&L</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Kurva pertumbuhan modal dan ekuitas trading secara visual</p>
        </div>

        {/* METRIK KECIL PEAK & DRAWDOWN */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Profit Tertinggi</span>
              <span className="text-xs font-bold font-mono text-emerald-400">+${peakProfit.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Drawdown Terdalam</span>
              <span className="text-xs font-bold font-mono text-rose-400">-${Math.abs(maxDrawdown).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* WADAH SCROLLABLE GRAFIK */}
      <div className="w-full overflow-x-auto custom-scrollbar pt-2">
        <div style={{ minWidth: `${minWidth}px`, height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
              
              {/* DEFINISI GRADIENT SEPARASI PRESISI DI ANGKA 0 */}
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={0} stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset={off} stopColor="#10b981" stopOpacity={0.05} />
                  <stop offset={off} stopColor="#f43f5e" stopOpacity={0.05} />
                  <stop offset={1} stopColor="#f43f5e" stopOpacity={0.4} />
                </linearGradient>

                <linearGradient id="strokeColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="#10b981" />
                  <stop offset={off} stopColor="#f43f5e" />
                </linearGradient>
              </defs>

              {/* GARIS GRID TIPIS MEMBENTANG DI SETIAP SKALA ANGKA */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#1e293b" 
                vertical={false} 
              />

              <XAxis 
                dataKey="date" 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={5}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />

              {/* TOOLTIP FUTURISTIK */}
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const val = Number(payload[0].value) || 0;
                    return (
                      <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl shadow-2xl backdrop-blur-md space-y-1">
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{label}</p>
                        <p className={`text-sm font-extrabold font-mono ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {val >= 0 ? `+$${val.toFixed(2)}` : `-$${Math.abs(val).toFixed(2)}`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* GARIS BATAS NETRAL DI ANGKA 0 (LEBIH TEGAS DARI GRID) */}
              <ReferenceLine 
                y={0} 
                stroke="#475569" 
                strokeWidth={1.5} 
                strokeDasharray="4 4" 
              />

              {/* AREA GRAFIK TUNGGAL */}
              <Area 
                type="monotone" 
                dataKey="pl" 
                stroke="url(#strokeColor)" 
                strokeWidth={2}
                fill="url(#splitColor)" 
                dot={{ r: 3, fill: '#0f172a', strokeWidth: 1.5, stroke: '#10b981' }}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}