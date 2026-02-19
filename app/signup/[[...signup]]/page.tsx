'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle2, Briefcase, TrendingUp, Users } from 'lucide-react';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    agree: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Prototype: Clerk <SignUp /> akan menggantikan form ini');
  };

  // Password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { level: 1, label: 'Lemah', color: 'bg-red-400' };
    if (score === 2) return { level: 2, label: 'Cukup', color: 'bg-yellow-400' };
    if (score === 3) return { level: 3, label: 'Kuat', color: 'bg-accent-400' };
    return { level: 4, label: 'Sangat Kuat', color: 'bg-accent-600' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left — Visual panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%"><defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
        </div>

        <div className="relative flex flex-col justify-between p-12 w-full">
          {/* Top */}
          <div>
            <Link href="/" className="inline-block mb-10">
              <span className="text-2xl font-extrabold tracking-tight text-white">Nexjob</span>
            </Link>
            <h2 className="text-3xl font-bold text-white leading-snug mb-4">
              Mulai perjalanan <br />karirmu sekarang.
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Bergabung dengan ribuan pencari kerja yang sudah menemukan peluang terbaik mereka.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              'Simpan lowongan favorit',
              'Notifikasi lowongan relevan',
              'Buat profil pencari kerja',
              'Gratis selamanya',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-accent-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent-400" />
                </div>
                <span className="text-sm text-white/60">{item}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-xl font-bold text-white">10K+</p>
              <p className="text-xs text-white/30">Lowongan</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">5K+</p>
              <p className="text-xs text-white/30">Perusahaan</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">50K+</p>
              <p className="text-xs text-white/30">Pengguna</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo (mobile only) */}
          <Link href="/" className="inline-block mb-12 lg:hidden">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">Nexjob</span>
          </Link>

          {/* Heading */}
          <p className="text-xs font-medium text-primary-600 mb-1">Gratis selamanya</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Buat Akun Baru</h1>
          <p className="text-sm text-gray-400 mb-8">Daftar dan temukan lowongan terbaik untukmu</p>

          {/* Social buttons */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 px-3 text-gray-400">Atau</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-xs font-medium text-gray-500 mb-1.5">Nama Depan</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Ahmad"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-xs font-medium text-gray-500 mb-1.5">Nama Belakang</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Rizki"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-gray-500 mb-1.5">Nomor Telepon</label>
              <input
                id="phone"
                type="tel"
                placeholder="+62 812-3456-7890"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{passwordStrength.label}</p>
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agree}
                onChange={(e) => handleChange('agree', e.target.checked)}
                className="h-3.5 w-3.5 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                Saya setuju dengan{' '}
                <Link href="/syarat-ketentuan" className="text-primary-600 underline">Syarat & Ketentuan</Link>
                {' '}dan{' '}
                <Link href="/kebijakan-privasi" className="text-primary-600 underline">Kebijakan Privasi</Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Buat Akun
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-sm text-gray-400 mt-8">
            Sudah punya akun?{' '}
            <Link href="/signin" className="text-primary-600 hover:text-primary-700 font-medium">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
