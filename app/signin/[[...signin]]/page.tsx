'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';
import type { EmailCodeFactor } from '@clerk/types';
import { Briefcase, TrendingUp, Users, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Submit email + password
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError('');

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        // Sign-in successful — set the active session and redirect
        await setActive({ session: signInAttempt.createdSessionId });
        router.push('/');
      } else if (signInAttempt.status === 'needs_second_factor') {
        // Client Trust or 2FA requires email_code verification
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        } else {
          setError('Metode verifikasi tidak tersedia. Hubungi administrator.');
        }
      } else if (signInAttempt.status === 'needs_first_factor') {
        // Password was not sufficient, needs first factor verification
        const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
        );

        if (emailCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        } else {
          setError('Metode verifikasi tidak tersedia. Hubungi administrator.');
        }
      } else {
        console.error('Sign-in status:', signInAttempt.status);
        setError('Login memerlukan langkah tambahan. Silakan hubungi support.');
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string; code?: string }> };
      const message =
        clerkErr.errors?.[0]?.longMessage ||
        clerkErr.errors?.[0]?.message ||
        'Terjadi kesalahan. Silakan coba lagi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Submit email verification code (second factor)
  async function handleEmailCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError('');

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push('/');
      } else {
        console.error('Sign-in status after 2FA:', signInAttempt.status);
        setError('Verifikasi gagal. Silakan coba lagi.');
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

  // Resend verification code
  async function handleResendCode() {
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError('');

    try {
      // Re-create sign-in and prepare second factor again
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'needs_second_factor') {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setCode('');
        }
      }
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
      {/* Left — Custom SignIn Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">Nexjob</span>
          </Link>

          {!showEmailCode ? (
            /* ── Step 1: Email + Password Input ── */
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Masuk ke akun Anda</h1>
              <p className="text-sm text-gray-500 mb-8">
                Masukkan email dan password Anda untuk masuk.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      required
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

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800
                             disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4
                             rounded-lg transition-colors text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Masuk'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Belum punya akun?{' '}
                <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                  Daftar
                </Link>
              </p>
            </div>
          ) : (
            /* ── Step 2: Email Code Verification (2FA / Client Trust) ── */
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowEmailCode(false);
                  setCode('');
                  setError('');
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">Verifikasi email Anda</h1>
              <p className="text-sm text-gray-500 mb-8">
                Kode verifikasi telah dikirim ke{' '}
                <span className="font-medium text-gray-700">{email}</span>
              </p>

              <form onSubmit={handleEmailCode} className="space-y-5">
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
                    'Verifikasi & Masuk'
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

      {/* Right — Dark info panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary-800 text-white relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 flex flex-col justify-center px-14 py-16 w-full">
          <h2 className="text-3xl font-bold leading-tight mb-3">
            Temukan Karir<br />Impianmu
          </h2>
          <p className="text-primary-200 mb-12 text-[15px] leading-relaxed max-w-sm">
            Ribuan perusahaan terpercaya di Indonesia mencari talenta seperti Anda.
          </p>

          {/* Stats cards */}
          <div className="space-y-4">
            {[
              { icon: Briefcase, label: 'Lowongan Tersedia', value: '10,000+' },
              { icon: TrendingUp, label: 'Perusahaan Terdaftar', value: '5,000+' },
              { icon: Users, label: 'Pencari Kerja Aktif', value: '50,000+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 bg-white/[0.06] backdrop-blur rounded-lg px-5 py-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-white/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-200" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{value}</p>
                  <p className="text-xs text-primary-300">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
