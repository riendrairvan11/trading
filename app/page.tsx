"use client";

import { useState, useEffect } from 'react';
import DashboardChart from './DashboardChart';
import TradeForm from './TradeForm';
import { Trophy, Activity, TrendingUp, TrendingDown, Layers, Wallet, Calendar, Percent, Scale, Coins, PieChart } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Pastikan baris ini di bagian atas app/page.tsx
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterDirection, setFilterDirection] = useState('All');
  const [filterAccount, setFilterAccount] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [tradeToDeleteId, setTradeToDeleteId] = useState<number | null>(null);


  // 1. AMBIL DATA DARI SUPABASE
  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) {
        // Mapping account_type dari database ke accountType untuk frontend
        const formatted = data.map((item) => ({
          ...item,
          accountType: item.account_type || item.accountType || 'USD',
        }));
        setTrades(formatted);
      }
    } catch (error) {
      console.error('Gagal mengambil data dari Supabase:', error);
      setTrades([
        { id: 1, date: '2026-08-10', pair: 'XAUUSD', direction: 'Sell', lot: 0.5, accountType: 'USD', pl: 150.00 },
        { id: 2, date: '2026-08-12', pair: 'EURUSD', direction: 'Buy', lot: 1.0, accountType: 'USC', pl: 50000.00 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 2. TAMBAH TRADE KE SUPABASE
  const handleAddTrade = async (newTradeData: any) => {
    const today = new Date().toISOString().split('T')[0];
    
    const newEntry = {
      date: today,
      pair: newTradeData.pair,
      direction: newTradeData.direction,
      lot: newTradeData.lot,
      account_type: newTradeData.accountType,
      pl: newTradeData.pl,
    };

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert([newEntry])
        .select();

      if (error) throw error;
      if (data) {
        const formattedData = {
          ...data[0],
          accountType: data[0].account_type
        };
        setTrades([formattedData, ...trades]);
      }
    } catch (error) {
      console.error('Gagal menyimpan ke Supabase:', error);
      const fallbackEntry = { id: Date.now(), date: today, ...newTradeData };
      setTrades([fallbackEntry, ...trades]);
    }
    setCurrentPage(1);
  };

  // 3. HAPUS TRADE DARI SUPABASE
  // Membuka modal konfirmasi di tengah
  const confirmDeleteTrade = (id: number) => {
    setTradeToDeleteId(id);
    setDeleteModalOpen(true);
  };

  // Eksekusi hapus setelah pengguna menekan "Ya, Hapus"
  const executeDelete = async () => {
    if (!tradeToDeleteId) return;

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeToDeleteId);

      if (error) throw error;
      setTrades(trades.filter((t) => t.id !== tradeToDeleteId));
      toast.success("Riwayat transaksi berhasil dihapus!");
    } catch (error) {
      console.error('Gagal menghapus dari Supabase:', error);
      setTrades(trades.filter((t) => t.id !== tradeToDeleteId));
      toast.success("Transaksi dihapus (Lokal)!");
    } finally {
      setDeleteModalOpen(false);
      setTradeToDeleteId(null);
    }
  };

  // Helper Normalisasi P/L (USC dibagi 100 menjadi USD)
  function currPLNormal(t: any) {
    const val = Number(t.pl) || 0;
    const accType = t.accountType || t.account_type || 'USD';
    return accType === 'USC' ? val / 100 : val;
  }

  const filteredTrades = trades.filter((t) => {
    const accType = t.accountType || t.account_type || 'USD';
    const matchDirection = filterDirection === 'All' || t.direction === filterDirection;
    const matchAccount = filterAccount === 'All' || accType === filterAccount;
    const matchSearch = t.pair.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchDate = true;
    if (startDate && t.date < startDate) matchDate = false;
    if (endDate && t.date > endDate) matchDate = false;

    return matchDirection && matchAccount && matchSearch && matchDate;
  });

  // PENGHITUNGAN P/L UTAMA (Header Atas)
  const totalPLUSD = trades.reduce((acc, curr) => {
    return acc + currPLNormal(curr);
  }, 0);

  const winningTrades = trades.filter((t) => currPLNormal(t) > 0).length;
  const losingTrades = trades.filter((t) => currPLNormal(t) < 0).length;
  const winRate = trades.length > 0 ? ((winningTrades / trades.length) * 100).toFixed(1) : '0';

  const totalProfit = trades.map(currPLNormal).filter(val => val > 0).reduce((acc, curr) => acc + curr, 0);
  const totalLoss = Math.abs(trades.map(currPLNormal).filter(val => val < 0).reduce((acc, curr) => acc + curr, 0));
  const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : totalProfit > 0 ? 'Infinite' : '0.00';
  const avgPL = trades.length > 0 ? (totalPLUSD / trades.length).toFixed(2) : '0';
  const totalLotSize = trades.reduce((acc, curr) => acc + (Number(curr.lot) || 0), 0).toFixed(2);
  const winLossRatio = `${winningTrades}W : ${losingTrades}L`;

  // Total P/L khusus tabel (berdasarkan filter)
  const filteredTotalPLUSD = filteredTrades.reduce((acc, curr) => {
    return acc + currPLNormal(curr);
  }, 0);

  const chartData = trades.slice().reverse().map((t) => ({
    date: t.date,
    pl: currPLNormal(t),
  }));

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrades = filteredTrades.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/80 transition-all">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                <Activity className="w-3 h-3" />Database Connected
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mt-1">
              Trading Journal Pro
            </h1>
            <p className="text-xs text-slate-400 mt-1">Sinkronisasi otomatis database dan konversi akun USC (1:100) ke USD.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-5 py-3 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-[1.02]">
            <div className={`w-3 h-3 rounded-full ${totalPLUSD >= 0 ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-rose-500 shadow-lg shadow-rose-500/50'} animate-ping`}></div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Net P&L (USD Standard)</span>
              <span className={`text-lg font-extrabold font-mono transition-colors duration-300 ${totalPLUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPLUSD >= 0 ? `+$${totalPLUSD.toFixed(2)}` : `-$${Math.abs(totalPLUSD).toFixed(2)}`}
              </span>
            </div>
          </div>
        </header>

        {/* 6 KARTU STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Win Rate Akurasi</span>
              <div className="text-xl font-bold text-white mt-1 font-mono">{winRate}%</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400"><Trophy className="w-5 h-5" /></div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Total Posisi</span>
              <div className="text-xl font-bold text-white mt-1 font-mono">{trades.length} Trades</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400"><Layers className="w-5 h-5" /></div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Akumulasi Lot</span>
              <div className="text-xl font-bold text-cyan-400 mt-1 font-mono">{totalLotSize} Lot</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400"><Coins className="w-5 h-5" /></div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Profit Factor</span>
              <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{profitFactor}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400"><Percent className="w-5 h-5" /></div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Win / Loss Ratio</span>
              <div className="text-xl font-bold text-purple-400 mt-1 font-mono">{winLossRatio}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400"><PieChart className="w-5 h-5" /></div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Rata-rata P/L (USD)</span>
              <div className={`text-xl font-bold mt-1 font-mono ${Number(avgPL) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Number(avgPL) >= 0 ? `+$${avgPL}` : `-$${Math.abs(Number(avgPL))}`}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"><Scale className="w-5 h-5" /></div>
          </div>
        </div>

        {/* Grafik & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DashboardChart data={chartData} />
          </div>
          <div className="lg:col-span-1">
            <TradeForm onSubmit={handleAddTrade} />
          </div>
        </div>

        {/* Riwayat Transaksi */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" /> Riwayat Transaksi Database
              </h3>
              <p className="text-xs text-slate-400">Data tersimpan di Supabase dengan konversi otomatis akun Cent (USC)</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] text-slate-500">Dari:</span>
                <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="bg-transparent text-white focus:outline-none font-mono text-xs" />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] text-slate-500">Sampai:</span>
                <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="bg-transparent text-white focus:outline-none font-mono text-xs" />
              </div>

              <input type="text" placeholder="Cari pair..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 w-32 font-mono" />

              <select value={filterAccount} onChange={(e) => { setFilterAccount(e.target.value); setCurrentPage(1); }} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                <option value="All">Semua Akun</option>
                <option value="USD">USD</option>
                <option value="USC">USC (Cent)</option>
              </select>

              <select value={filterDirection} onChange={(e) => { setFilterDirection(e.target.value); setCurrentPage(1); }} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                <option value="All">Semua Arah</option>
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
              </select>

              {(startDate || endDate) && (
                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl transition-colors cursor-pointer">
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Pair</th>
                  <th className="py-3 px-4">Arah</th>
                  <th className="py-3 px-4">Lot</th>
                  <th className="py-3 px-4">Tipe Akun</th>
                  <th className="py-3 px-4">Profit / Loss (Input / USD)</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs font-mono">
                {currentTrades.length > 0 ? (
                  currentTrades.map((t) => {
                    const rawPL = Number(t.pl) || 0;
                    const normalPL = currPLNormal(t);
                    const accType = t.accountType || t.account_type || 'USD';
                    return (
                      <tr key={t.id || t.date + t.pair} className="hover:bg-slate-800/40 transition-all duration-200 group">
                        <td className="py-3.5 px-4 text-slate-400">{t.date}</td>
                        <td className="py-3.5 px-4 font-bold text-white text-sm">{t.pair}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-bold ${t.direction === 'Buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {t.direction}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{t.lot}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">
                            {accType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-sm">
                          <span className={normalPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {normalPL >= 0 ? `+$${normalPL.toFixed(2)}` : `-$${Math.abs(normalPL).toFixed(2)}`}
                          </span>
                          {accType === 'USC' && (
                            <span className="block text-[10px] text-slate-500 font-normal">
                              ({rawPL >= 0 ? `+${rawPL} cent` : `${rawPL} cent`} / 100)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button 
                            onClick={() => confirmDeleteTrade(t.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 px-3 py-1 rounded-lg border border-rose-500/20 transition-all text-[11px] cursor-pointer"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">Tidak ada riwayat transaksi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Total P/L Setara USD (Berdasarkan Filter):</span>
            <span className={`text-base font-extrabold font-mono ${filteredTotalPLUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {filteredTotalPLUSD >= 0 ? `+$${filteredTotalPLUSD.toFixed(2)}` : `-$${Math.abs(filteredTotalPLUSD).toFixed(2)}`}
            </span>
          </div>

          {filteredTrades.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-800/80 gap-4 text-xs text-slate-400">
              <div>
                Menampilkan <span className="text-white font-medium">{indexOfFirstItem + 1}</span> - <span className="text-white font-medium">{Math.min(indexOfLastItem, filteredTrades.length)}</span> dari <span className="text-white font-medium">{filteredTrades.length}</span> data
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-700 transition-all cursor-pointer"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg font-medium transition-all cursor-pointer ${currentPage === page ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-700 transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
      {/* MODAL KONFIRMASI HAPUS DI TENGAH */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center space-y-4 animate-in zoom-in-95 duration-200">
            
            {/* Ikon Peringatan */}
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto shadow-inner">
              <TrendingDown className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Hapus Transaksi?</h3>
              <p className="text-xs text-slate-400 mt-1">Data yang dihapus tidak dapat dikembalikan lagi dari database.</p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}