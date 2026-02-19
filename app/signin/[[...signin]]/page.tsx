'use client';

import React from 'react';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { Briefcase, TrendingUp, Users } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left — Clerk SignIn Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">Nexjob</span>
          </Link>

          {/* Clerk SignIn Component */}
          <SignIn
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
