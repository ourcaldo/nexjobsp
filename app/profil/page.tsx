'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  FileText, Settings, ChevronRight, Pencil, Camera,
  Bookmark, Bell, ExternalLink, Calendar
} from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

// Mock user data for prototype
const mockUser = {
  name: 'Ahmad Rizki Pratama',
  email: 'ahmad.rizki@email.com',
  phone: '+62 812-3456-7890',
  location: 'Jakarta Selatan, DKI Jakarta',
  avatar: null,
  headline: 'Frontend Developer | React & Next.js',
  joinedDate: 'Januari 2026',
  profileCompletion: 65,
};

const mockSkills = ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL'];

const mockExperience = [
  {
    title: 'Frontend Developer',
    company: 'PT Teknologi Nusantara',
    period: 'Jan 2024 - Sekarang',
    current: true,
  },
  {
    title: 'Junior Web Developer',
    company: 'PT Digital Kreasi',
    period: 'Mar 2022 - Des 2023',
    current: false,
  },
];

const mockEducation = [
  {
    degree: 'S1 Teknik Informatika',
    school: 'Universitas Indonesia',
    year: '2018 - 2022',
  },
];

const mockSavedJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'Gojek',
    location: 'Jakarta',
    type: 'Full-time',
    savedDate: '2 hari lalu',
  },
  {
    id: 2,
    title: 'React Developer',
    company: 'Tokopedia',
    location: 'Jakarta',
    type: 'Full-time',
    savedDate: '5 hari lalu',
  },
  {
    id: 3,
    title: 'Fullstack Engineer',
    company: 'Bukalapak',
    location: 'Remote',
    type: 'Full-time',
    savedDate: '1 minggu lalu',
  },
];

type Tab = 'profil' | 'lowongan-tersimpan' | 'pengaturan';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profil');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profil', label: 'Profil Saya', icon: <User className="h-4 w-4" /> },
    { id: 'lowongan-tersimpan', label: 'Lowongan Tersimpan', icon: <Bookmark className="h-4 w-4" /> },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-64px)] bg-gray-50">
        {/* Profile Header — flat, clean */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-20 w-20 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                  {mockUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <button
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors"
                  aria-label="Ubah foto profil"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">{mockUser.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{mockUser.headline}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {mockUser.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Bergabung {mockUser.joinedDate}
                  </span>
                </div>
              </div>

              {/* Edit button */}
              <button className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <Pencil className="h-3.5 w-3.5" />
                Edit Profil
              </button>
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
                    <span className="text-xs font-semibold text-primary-600">{mockUser.profileCompletion}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${mockUser.profileCompletion}%` }}
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
              {activeTab === 'profil' && <ProfileTab />}
              {activeTab === 'lowongan-tersimpan' && <SavedJobsTab />}
              {activeTab === 'pengaturan' && <SettingsTab />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── Profile Tab ─── */
function ProfileTab() {
  return (
    <div className="space-y-5">
      {/* About */}
      <Section title="Tentang Saya" action="Edit">
        <p className="text-sm text-gray-600 leading-relaxed">
          Frontend developer dengan 3+ tahun pengalaman membangun aplikasi web modern menggunakan React dan Next.js.
          Passionate tentang UI/UX yang bersih dan performa web yang optimal. Saat ini mencari peluang untuk
          berkontribusi di perusahaan teknologi yang inovatif.
        </p>
      </Section>

      {/* Contact Info */}
      <Section title="Informasi Kontak" action="Edit">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={mockUser.email} />
          <InfoItem icon={<Phone className="h-4 w-4" />} label="Telepon" value={mockUser.phone} />
          <InfoItem icon={<MapPin className="h-4 w-4" />} label="Lokasi" value={mockUser.location} />
        </div>
      </Section>

      {/* Skills */}
      <Section title="Keahlian" action="Edit">
        <div className="flex flex-wrap gap-2">
          {mockSkills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
            >
              {skill}
            </span>
          ))}
        </div>
      </Section>

      {/* Experience */}
      <Section title="Pengalaman Kerja" action="Tambah">
        <div className="space-y-4">
          {mockExperience.map((exp, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{exp.title}</h4>
                    <p className="text-sm text-gray-500">{exp.company}</p>
                  </div>
                  {exp.current && (
                    <span className="flex-shrink-0 px-2 py-0.5 bg-accent-50 text-accent-700 text-xs font-medium rounded">
                      Saat ini
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{exp.period}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Education */}
      <Section title="Pendidikan" action="Tambah">
        <div className="space-y-4">
          {mockEducation.map((edu, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{edu.degree}</h4>
                <p className="text-sm text-gray-500">{edu.school}</p>
                <p className="text-xs text-gray-400 mt-0.5">{edu.year}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Resume */}
      <Section title="Resume / CV" action="Upload">
        <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center">
          <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-0.5">Belum ada resume yang diupload</p>
          <p className="text-xs text-gray-400">PDF, DOC, atau DOCX (maks 5MB)</p>
          <button className="mt-3 px-3.5 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
            Upload Resume
          </button>
        </div>
      </Section>
    </div>
  );
}

/* ─── Saved Jobs Tab ─── */
function SavedJobsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900">Lowongan Tersimpan</h2>
        <span className="text-xs text-gray-400">{mockSavedJobs.length} lowongan</span>
      </div>

      {mockSavedJobs.map((job) => (
        <div
          key={job.id}
          className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3 min-w-0">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500">{job.company}</p>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{job.type}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="text-xs text-gray-400">{job.savedDate}</span>
              <Link
                href={`/lowongan-kerja/${job.id}`}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Lihat <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="text-center pt-2">
        <Link
          href="/lowongan-kerja/"
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Cari Lowongan Lainnya
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/* ─── Settings Tab ─── */
function SettingsTab() {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">Pengaturan</h2>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <Bell className="h-4 w-4 text-gray-400" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Notifikasi</h3>
            <p className="text-xs text-gray-400">Atur preferensi notifikasi</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <ToggleItem label="Email Lowongan Relevan" description="Rekomendasi lowongan setiap 2 hari" defaultChecked={true} />
          <ToggleItem label="Newsletter Karir" description="Tips karir dan tren industri mingguan" defaultChecked={false} />
          <ToggleItem label="Update Lowongan Tersimpan" description="Notifikasi perubahan status lowongan" defaultChecked={true} />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-red-100">
          <h3 className="text-sm font-medium text-red-600">Zona Berbahaya</h3>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 font-medium">Hapus Akun</p>
            <p className="text-xs text-gray-400">Semua data akan dihapus permanen</p>
          </div>
          <button className="px-3.5 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helper Components ─── */

function Section({ title, action, children }: { title: string; action: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
          {action} <Pencil className="h-3 w-3" />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
}

function ToggleItem({ label, description, defaultChecked }: { label: string; description: string; defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
