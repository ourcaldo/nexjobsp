'use client';

import React from 'react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { CheckCircle, Briefcase, Building2, Shield } from 'lucide-react';

export default function SignUpPage() {
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

      {/* Right — Clerk SignUp Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">Nexjob</span>
          </Link>

          {/* Clerk SignUp Component */}
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0 p-0 w-full',
                headerTitle: 'text-2xl font-bold text-gray-900',
                headerSubtitle: 'text-sm text-gray-400',
                socialButtonsBlockButton: 'border border-gray-200 hover:bg-gray-50 transition-colors',
                formButtonPrimary: 'bg-primary-700 hover:bg-primary-800 text-white transition-colors',
                formFieldInput: 'border-gray-200 focus:border-primary-500 focus:ring-primary-500',
                footerActionLink: 'text-primary-600 hover:text-primary-700',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
