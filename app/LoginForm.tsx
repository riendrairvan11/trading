"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, Mail, Eye, EyeOff, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";

// Impor client Supabase di bagian paling atas file:
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reference Canvas untuk Animasi Poligon
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ANIMASI POLIGON / CONSTELLATION PARTICLES
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Inisialisasi Titik Particle
    const particleCount = Math.min(Math.floor(window.innerWidth / 15), 65);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 1.8 + 1,
      });
    }

    // Loop Animasi Canvas
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update Posisi & Gambar Titik
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Pantulan Dinding Canvas
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw Particle (Warna Emerald Soft)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.7)";
        ctx.fill();

        // Hubungkan Garis Poligon Antar Titik yang Dekat
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Batas Jarak Penghubung Garis (120px)
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.35 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        setIsLoading(false);
        onLoginSuccess();
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "Email atau kata sandi tidak valid!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* CANVAS ANIMASI POLIGON BACKGROUND */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* BACKGROUND GLOW NEON */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* KARTU UTAMA LOGIN */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* HEADER BRANDING */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-inner mb-2 group">
            <TrendingUp className="w-7 h-7 text-emerald-400 transition-transform group-hover:scale-110" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Trading Journal <span className="text-emerald-400">Pro</span>
          </h1>
          <p className="text-xs text-slate-400">
            Sebagai catatan sajaaaaaa
          </p>
        </div>

        {/* PESAN ERROR */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl text-center font-semibold animate-shake">
            {error}
          </div>
        )}

        {/* FORM INPUT */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-10 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* TOMBOL SUBMIT GRADASI NEON */}
          <button
            type="submit"
            disabled={isLoading}
            className="group w-full bg-gradient-to-r w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer active:scale-[0.98] disabled:opacity-50 mt-2 hover:shadow-emerald-500/40"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Masuk Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"/>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Riendra Miftachul Irvan</span>
          </div>
          <span>v2.0.0 Pro</span>
        </div>

      </div>
    </div>
  );
}