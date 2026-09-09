'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi, saveToken } from '@/lib/api';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, X } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Kirim login, terima token dari backend
      const res = await fetchApi<{ token: string }>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Simpan token ke cookie (untuk SSR/middleware) dan localStorage (untuk CSR)
      saveToken(res.token);

      // Redirect ke dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-16 bg-gradient-to-br from-[#4db8c3] via-[#227987] to-[#0e3b46] relative overflow-hidden selection:bg-cyan-300 selection:text-slate-900">
      {/* Floating Toast Notification on Login Error */}
      {error && (
        <div
          role="alert"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-gradient-to-r from-red-950/95 via-[#230b13]/95 to-red-950/95 border border-red-500/50 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-md rounded-xl p-4 flex items-start gap-3.5 text-white animate-in slide-in-from-top-4 fade-in duration-300 ring-1 ring-red-400/20"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5 text-red-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-200 tracking-wide">
              Login Gagal
            </p>
            <p className="text-xs text-red-300/90 mt-0.5 leading-relaxed">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-red-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Subtle atmospheric ambient glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-900/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[390px] relative z-10 pt-16">
        {/* Overlapping Circular Avatar Badge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#071f37] border-4 border-[#1b6b7a]/80 shadow-[0_12px_28px_rgba(0,0,0,0.35)] flex items-center justify-center z-20 transition-transform hover:scale-[1.02]">
          <svg
            className="w-14 h-14 sm:w-16 sm:h-16 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="7.5" r="4.5" />
            <path d="M4 20c0-4.2 3.6-7.5 8-7.5s8 3.3 8 7.5" />
          </svg>
        </div>

        {/* Frosted Teal Card */}
        <div className="bg-[#145b6b]/85 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_24px_50px_-10px_rgba(3,25,35,0.65)] px-7 sm:px-9 pt-20 pb-9">
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Error Message Inside Card */}
            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-950/50 border border-red-400/40 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 backdrop-blur-sm animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <div className="relative flex items-center border-b border-white/50 focus-within:border-white pb-2.5 transition-colors">
                <Mail
                  className="w-5 h-5 text-white/90 mr-3.5 shrink-0"
                  strokeWidth={1.8}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white placeholder:text-white/60 focus:outline-none text-sm sm:text-base font-normal"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative flex items-center border-b border-white/50 focus-within:border-white pb-2.5 transition-colors">
                <Lock
                  className="w-5 h-5 text-white/90 mr-3.5 shrink-0"
                  strokeWidth={1.8}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white placeholder:text-white/60 focus:outline-none text-sm sm:text-base font-normal pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0 text-white/60 hover:text-white transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-white/80 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/50 bg-black/20 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-600"
                />
                <span className="group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setError('Silakan hubungi administrator untuk mereset kata sandi.');
                }}
                className="italic text-white/80 hover:text-white transition-colors focus:outline-none cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#071f37] hover:bg-[#0c2c4c] active:bg-[#05172b] text-white font-bold tracking-[0.25em] text-sm uppercase rounded shadow-[0_8px_20px_rgba(7,31,55,0.45)] hover:shadow-[0_10px_25px_rgba(7,31,55,0.6)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>MEMVERIFIKASI...</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info / Branding */}
        <div className="mt-8 text-center text-xs text-white/60 tracking-wider">
          <p className="font-medium">CAKRA PRIMA KONSTRUKSI</p>
          <p className="text-[11px] text-white/40 mt-1">Sistem Informasi Manajemen Proyek</p>
        </div>
      </div>
    </div>
  );
}
