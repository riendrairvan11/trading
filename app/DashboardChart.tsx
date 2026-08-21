"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardChart({ data }: { data: any[] }) {
  const isDataMany = data.length > 7;
  const chartWidth = isDataMany ? Math.max(data.length * 45, 320) : '100%';

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

  // Custom Dot (Merah jika < 0, Hijau jika >= 0)
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    const val = Number(payload?.pl) || 0;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill="#0f172a"
        stroke={val >= 0 ? '#10b981' : '#f43f5e'}
        strokeWidth={1.5}
      />
    );
  };

  const CustomActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    const val = Number(payload?.pl) || 0;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={val >= 0 ? '#10b981' : '#f43f5e'}
        stroke="#ffffff"
        strokeWidth={1.5}
      />
    );
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-4 sm:p-6 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden">
      
      {/* HEADER GRAFIK */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Analisis Performa P&L</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Kurva pertumbuhan modal dan ekuitas trading secara visual</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Profit Peak</span>
              <span className="text-xs font-bold font-mono text-emerald-400">+${peakProfit.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex-1 sm:flex-none bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Drawdown</span>
              <span className="text-xs font-bold font-mono text-rose-400">-${Math.abs(maxDrawdown).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* GRAFIK DENGAN ANGKA Y-AXIS TERANG & PASTI MUNCUL */}
      <div className="w-full overflow-x-auto custom-scrollbar pt-1">
        <div style={{ width: typeof chartWidth === 'number' ? `${chartWidth}px` : chartWidth, height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 15, right: 15, left: 10, bottom: 0 }}>
              
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={0} stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset={off} stopColor="#10b981" stopOpacity={0.02} />
                  <stop offset={off} stopColor="#f43f5e" stopOpacity={0.02} />
                  <stop offset={1} stopColor="#f43f5e" stopOpacity={0.35} />
                </linearGradient>

                <linearGradient id="strokeColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="#10b981" />
                  <stop offset={off} stopColor="#f43f5e" />
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#1e293b" 
                vertical={false} 
              />

              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                dy={5}
              />

              {/* Y-AXIS TERANG & AMAN LEBAR (width 45) */}
              <YAxis 
                stroke="#cbd5e1" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                width={45}
                tickFormatter={(val) => `$${val}`}
              />

              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const val = Number(payload[0].value) || 0;
                    return (
                      <div className="bg-slate-950/95 border border-slate-800 p-2.5 rounded-xl shadow-2xl backdrop-blur-md space-y-0.5 z-50">
                        <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">{label}</p>
                        <p className={`text-xs font-extrabold font-mono ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {val >= 0 ? `+$${val.toFixed(2)}` : `-$${Math.abs(val).toFixed(2)}`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <ReferenceLine 
                y={0} 
                stroke="#475569" 
                strokeWidth={1} 
                strokeDasharray="3 3" 
              />

              <Area 
                type="monotone" 
                dataKey="pl" 
                stroke="url(#strokeColor)" 
                strokeWidth={2}
                fill="url(#splitColor)" 
                dot={<CustomDot />}
                activeDot={<CustomActiveDot />}
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}