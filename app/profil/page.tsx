'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useUser, SignOutButton } from '@clerk/nextjs';
import {
  User, Mail, Camera,
  Bookmark, Settings, Calendar, Loader2,
  LogOut, AlertTriangle
} from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { useProfile } from '@/hooks/useProfile';

const ProfileTab = dynamic(() => import('@/components/profile/ProfileTab'), { ssr: false });
const SavedJobsTab = dynamic(() => import('@/components/profile/SavedJobsTab'), { ssr: false });
const SettingsTab = dynamic(() => import('@/components/profile/SettingsTab'), { ssr: false });

type Tab = 'profil' | 'lowongan-tersimpan' | 'pengaturan';

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const {
    profile, loading, error, fetchProfile,
    updateProfile, updatePreferences, updateSkills,
    addExperience, updateExperience, deleteExperience,
    addEducation, updateEducation, deleteEducation,
  } = useProfile();
  const [activeTab, setActiveTab] = useState<Tab>('profil');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profil', label: 'Profil Saya', icon: <User className="h-4 w-4" /> },
    { id: 'lowongan-tersimpan', label: 'Lowongan Tersimpan', icon: <Bookmark className="h-4 w-4" /> },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="h-4 w-4" /> },
  ];

  // Loading state
  if (!clerkLoaded || loading) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Memuat profil...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Error / not found
  if (error || !profile) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Profil Belum Tersedia</h2>
            <p className="text-sm text-gray-500 mb-4">
              {error === 'User not found'
                ? 'Akun Anda belum terdaftar di sistem. Silakan tunggu beberapa saat atau hubungi admin.'
                : `Terjadi kesalahan: ${error || 'Unknown error'}`}
            </p>
            <button
              onClick={() => fetchProfile()}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const displayName = profile.name || clerkUser?.fullName || 'User';
  const initials = displayName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const joinedDate = new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Compute profile completion
  const completionChecks = [
    !!profile.name,
    !!profile.bio,
    !!profile.phone,
    !!profile.avatar,
    profile.skills.length > 0,
    profile.experience.length > 0,
    profile.education.length > 0,
  ];
  const profileCompletion = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-64px)] bg-gray-50">
        {/* Profile Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-2xl object-cover border border-gray-100"
                    unoptimized
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                    {initials}
                  </div>
                )}
                <button
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors"
                  aria-label="Ubah foto profil"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">{displayName}</h1>
                {profile.bio && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{profile.bio}</p>}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                  {profile.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {profile.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Bergabung {joinedDate}
                  </span>
                </div>
              </div>

              {/* Sign out */}
              <SignOutButton>
                <button className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar */}
            <div className="w-full lg:w-60 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Profile completion */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Kelengkapan Profil</span>
                    <span className="text-xs font-semibold text-primary-600">{profileCompletion}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>

                {/* Nav tabs */}
                <nav className="p-1.5">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Right content */}
            <div className="flex-1 min-w-0 pb-8">
              {activeTab === 'profil' && (
                <ProfileTab
                  profile={profile}
                  onUpdateProfile={updateProfile}
                  onUpdateSkills={updateSkills}
                  onAddExperience={addExperience}
                  onUpdateExperience={updateExperience}
                  onDeleteExperience={deleteExperience}
                  onAddEducation={addEducation}
                  onUpdateEducation={updateEducation}
                  onDeleteEducation={deleteEducation}
                />
              )}
              {activeTab === 'lowongan-tersimpan' && <SavedJobsTab />}
              {activeTab === 'pengaturan' && (
                <SettingsTab
                  preferences={profile.preferences}
                  onUpdatePreferences={updatePreferences}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

