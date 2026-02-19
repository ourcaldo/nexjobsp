'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@clerk/nextjs';
import { CheckCircle, Briefcase, Building2, Shield, Mail, ArrowLeft, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Submit email — create sign-up and send verification code
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError('');

    try {
      // Create a new sign-up with email
      await signUp.create({
        emailAddress: email,
      });

      // Send email verification code (OTP)
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      // Move to verification step
      setVerifying(true);
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
      const message =
        clerkErr.errors?.[0]?.longMessage ||
        clerkErr.errors?.[0]?.message ||
        'Terjadi kesalahan. Silakan coba lagi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Submit the OTP code — verify the email address
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === 'complete') {
        // Sign-up successful — set active session and redirect
        await setActive({ session: result.createdSessionId });
        router.push('/');
      } else {
        // Handle other statuses (e.g. missing fields)
        console.warn('Sign-up status:', result.status);
        setError('Pendaftaran belum selesai. Silakan hubungi support.');
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
      const message =
        clerkErr.errors?.[0]?.longMessage ||
        clerkErr.errors?.[0]?.message ||
        'Kode verifikasi salah. Silakan coba lagi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP code
  async function handleResendCode() {
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError('');

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      setCode('');
      setError('');
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
      setError(
        clerkErr.errors?.[0]?.longMessage ||
        'Gagal mengirim ulang kode. Coba lagi.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left — Dark panel with benefits */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary-800 text-white relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 flex flex-col justify-center px-14 py-16 w-full">
          <h2 className="text-3xl font-bold leading-tight mb-3">
            Mulai Perjalanan<br />Karirmu
          </h2>
          <p className="text-primary-200 mb-10 text-[15px] leading-relaxed max-w-sm">
            Buat akun gratis dan akses ribuan lowongan dari perusahaan terpercaya di Indonesia.
          </p>

          {/* Benefits checklist */}
          <div className="space-y-4 mb-12">
            {[
              { icon: CheckCircle, text: 'Akses ribuan lowongan kerja terbaru' },
              { icon: Briefcase, text: 'Simpan lowongan dan lamar dengan mudah' },
              { icon: Building2, text: 'Profil profesional untuk menarik recruiter' },
              { icon: Shield, text: 'Data aman & privasi terjaga' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[15px] text-primary-100">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-8 pt-6 border-t border-white/10">
            {[
              { value: '10K+', label: 'Lowongan' },
              { value: '5K+', label: 'Perusahaan' },
              { value: '50K+', label: 'Pengguna' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-primary-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Custom SignUp Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">Nexjob</span>
          </Link>

          {!verifying ? (
            /* ── Step 1: Email Input ── */
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Buat akun baru</h1>
              <p className="text-sm text-gray-500 mb-8">
                Masukkan email Anda untuk memulai pendaftaran.
              </p>

              <form onSubmit={handleSendCode} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none
                                 transition-colors placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {/* Clerk CAPTCHA widget — required for bot protection on sign-up */}
                <div id="clerk-captcha" />

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800
                             disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4
                             rounded-lg transition-colors text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Kirim Kode Verifikasi'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Sudah punya akun?{' '}
                <Link href="/signin" className="text-primary-600 hover:text-primary-700 font-medium">
                  Masuk
                </Link>
              </p>
            </div>
          ) : (
            /* ── Step 2: OTP Code Verification ── */
            <div>
              <button
                type="button"
                onClick={() => {
                  setVerifying(false);
                  setCode('');
                  setError('');
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">Cek email Anda</h1>
              <p className="text-sm text-gray-500 mb-8">
                Kami mengirim kode verifikasi ke{' '}
                <span className="font-medium text-gray-700">{email}</span>
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Kode Verifikasi
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Masukkan kode 6 digit"
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-center
                               tracking-[0.3em] font-mono text-lg
                               focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none
                               transition-colors placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !code}
                  className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800
                             disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4
                             rounded-lg transition-colors text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Verifikasi & Daftar'
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-500">
                Tidak menerima kode?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  Kirim ulang
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
