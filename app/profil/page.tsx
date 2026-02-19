'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, SignOutButton } from '@clerk/nextjs';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  FileText, Settings, ChevronRight, Pencil, Camera,
  Bookmark, Bell, ExternalLink, Calendar, Loader2,
  Plus, X, Trash2, LogOut, AlertTriangle
} from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { useProfile, useSavedJobs } from '@/hooks/useProfile';
import type {
  UserProfile,
  UserPreferences,
  ExperiencePayload,
  EducationPayload,
} from '@/types/profile';

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
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
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
                  <img
                    src={profile.avatar}
                    alt={displayName}
                    className="h-20 w-20 rounded-2xl object-cover border border-gray-100"
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

/* ═══════════════════════════════════════════════════════════════════
   Profile Tab
   ═══════════════════════════════════════════════════════════════════ */
interface ProfileTabProps {
  profile: UserProfile;
  onUpdateProfile: (data: any) => Promise<any>;
  onUpdateSkills: (data: any) => Promise<any>;
  onAddExperience: (data: ExperiencePayload) => Promise<any>;
  onUpdateExperience: (id: string, data: Partial<ExperiencePayload>) => Promise<any>;
  onDeleteExperience: (id: string) => Promise<any>;
  onAddEducation: (data: EducationPayload) => Promise<any>;
  onUpdateEducation: (id: string, data: Partial<EducationPayload>) => Promise<any>;
  onDeleteEducation: (id: string) => Promise<any>;
}

function ProfileTab({
  profile,
  onUpdateProfile,
  onUpdateSkills,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation,
}: ProfileTabProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* About */}
      <EditableAbout
        bio={profile.bio}
        onSave={async (bio) => { await onUpdateProfile({ bio }); }}
        editing={editingSection === 'about'}
        onEdit={() => setEditingSection('about')}
        onCancel={() => setEditingSection(null)}
      />

      {/* Contact Info */}
      <EditableContact
        profile={profile}
        onSave={onUpdateProfile}
        editing={editingSection === 'contact'}
        onEdit={() => setEditingSection('contact')}
        onCancel={() => setEditingSection(null)}
      />

      {/* Skills */}
      <EditableSkills
        skills={profile.skills.map((s) => s.name)}
        onSave={async (skills) => { await onUpdateSkills({ skills }); }}
        editing={editingSection === 'skills'}
        onEdit={() => setEditingSection('skills')}
        onCancel={() => setEditingSection(null)}
      />

      {/* Experience */}
      <ExperienceSection
        items={profile.experience}
        onAdd={onAddExperience}
        onUpdate={onUpdateExperience}
        onDelete={onDeleteExperience}
      />

      {/* Education */}
      <EducationSection
        items={profile.education}
        onAdd={onAddEducation}
        onUpdate={onUpdateEducation}
        onDelete={onDeleteEducation}
      />

      {/* Resume placeholder */}
      <Section title="Resume / CV" actionLabel="Upload" onAction={() => {}}>
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

/* ── Editable About ── */
function EditableAbout({ bio, onSave, editing, onEdit, onCancel }: {
  bio: string | null;
  onSave: (bio: string) => Promise<void>;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(bio || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValue(bio || ''); }, [bio]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(value);
    setSaving(false);
    onCancel();
  };

  return (
    <Section title="Tentang Saya" actionLabel={editing ? undefined : 'Edit'} onAction={onEdit}>
      {editing ? (
        <div>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
            placeholder="Ceritakan tentang diri Anda..."
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              Simpan
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 leading-relaxed">
          {bio || <span className="text-gray-400 italic">Belum ada deskripsi. Klik Edit untuk menambahkan.</span>}
        </p>
      )}
    </Section>
  );
}

/* ── Editable Contact ── */
function EditableContact({ profile, onSave, editing, onEdit, onCancel }: {
  profile: UserProfile;
  onSave: (data: any) => Promise<any>;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name || '');
    setPhone(profile.phone || '');
  }, [profile.name, profile.phone]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ name, phone });
    setSaving(false);
    onCancel();
  };

  return (
    <Section title="Informasi Kontak" actionLabel={editing ? undefined : 'Edit'} onAction={onEdit}>
      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nama Lengkap</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Telepon</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              placeholder="+62 812-3456-7890"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              Simpan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
          <InfoItem icon={<Phone className="h-4 w-4" />} label="Telepon" value={profile.phone || '-'} />
          <InfoItem icon={<User className="h-4 w-4" />} label="Nama" value={profile.name || '-'} />
        </div>
      )}
    </Section>
  );
}

/* ── Editable Skills ── */
function EditableSkills({ skills, onSave, editing, onEdit, onCancel }: {
  skills: string[];
  onSave: (skills: string[]) => Promise<void>;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const [items, setItems] = useState<string[]>(skills);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setItems(skills); }, [skills]);

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems([...items, trimmed]);
      setInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setItems(items.filter((s) => s !== skill));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(items);
    setSaving(false);
    onCancel();
  };

  return (
    <Section title="Keahlian" actionLabel={editing ? undefined : 'Edit'} onAction={onEdit}>
      {editing ? (
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {items.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-lg">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              placeholder="Ketik nama keahlian lalu Enter"
            />
            <button onClick={addSkill} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              Simpan
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? skills.map((skill) => (
            <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
              {skill}
            </span>
          )) : (
            <p className="text-sm text-gray-400 italic">Belum ada keahlian. Klik Edit untuk menambahkan.</p>
          )}
        </div>
      )}
    </Section>
  );
}

/* ── Experience Section ── */
function ExperienceSection({ items, onAdd, onUpdate, onDelete }: {
  items: UserProfile['experience'];
  onAdd: (data: ExperiencePayload) => Promise<any>;
  onUpdate: (id: string, data: Partial<ExperiencePayload>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Section title="Pengalaman Kerja" actionLabel="Tambah" onAction={() => setShowForm(true)}>
      {showForm && (
        <ExperienceForm
          onSave={async (data) => { await onAdd(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      <div className="space-y-4">
        {items.length === 0 && !showForm && (
          <p className="text-sm text-gray-400 italic">Belum ada pengalaman kerja.</p>
        )}
        {items.map((exp) => (
          <div key={exp.id}>
            {editingId === exp.id ? (
              <ExperienceForm
                initial={exp}
                onSave={async (data) => { await onUpdate(exp.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex gap-3 group">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{exp.job_title}</h4>
                      <p className="text-sm text-gray-500">{exp.company_name}</p>
                      {exp.location && <p className="text-xs text-gray-400">{exp.location}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {exp.is_current && (
                        <span className="px-2 py-0.5 bg-accent-50 text-accent-700 text-xs font-medium rounded">
                          Saat ini
                        </span>
                      )}
                      <button
                        onClick={() => setEditingId(exp.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary-600 transition-all"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDelete(exp.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(exp.start_date)} — {exp.is_current ? 'Sekarang' : formatDate(exp.end_date)}
                  </p>
                  {exp.description && <p className="text-xs text-gray-500 mt-1">{exp.description}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── Experience Form ── */
function ExperienceForm({ initial, onSave, onCancel }: {
  initial?: Partial<ExperiencePayload & { id: string }>;
  onSave: (data: ExperiencePayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [data, setData] = useState<ExperiencePayload>({
    company_name: initial?.company_name || '',
    job_title: initial?.job_title || '',
    location: initial?.location || '',
    start_date: initial?.start_date?.slice(0, 10) || '',
    end_date: initial?.end_date?.slice(0, 10) || '',
    is_current: initial?.is_current ?? false,
    description: initial?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.company_name || !data.job_title || !data.start_date) return;
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-3 mb-4 border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Jabatan *" value={data.job_title} onChange={(v) => setData({ ...data, job_title: v })} />
        <FormField label="Perusahaan *" value={data.company_name} onChange={(v) => setData({ ...data, company_name: v })} />
        <FormField label="Lokasi" value={data.location || ''} onChange={(v) => setData({ ...data, location: v })} />
        <FormField label="Tanggal Mulai *" type="date" value={data.start_date} onChange={(v) => setData({ ...data, start_date: v })} />
        {!data.is_current && (
          <FormField label="Tanggal Selesai" type="date" value={data.end_date || ''} onChange={(v) => setData({ ...data, end_date: v })} />
        )}
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={data.is_current}
          onChange={(e) => setData({ ...data, is_current: e.target.checked, end_date: e.target.checked ? '' : data.end_date })}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Saya masih bekerja di sini
      </label>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Deskripsi</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
          Batal
        </button>
        <button
          type="submit"
          disabled={saving || !data.company_name || !data.job_title || !data.start_date}
          className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
        >
          {saving && <Loader2 className="h-3 w-3 animate-spin" />}
          Simpan
        </button>
      </div>
    </form>
  );
}

/* ── Education Section ── */
function EducationSection({ items, onAdd, onUpdate, onDelete }: {
  items: UserProfile['education'];
  onAdd: (data: EducationPayload) => Promise<any>;
  onUpdate: (id: string, data: Partial<EducationPayload>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Section title="Pendidikan" actionLabel="Tambah" onAction={() => setShowForm(true)}>
      {showForm && (
        <EducationForm
          onSave={async (data) => { await onAdd(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      <div className="space-y-4">
        {items.length === 0 && !showForm && (
          <p className="text-sm text-gray-400 italic">Belum ada riwayat pendidikan.</p>
        )}
        {items.map((edu) => (
          <div key={edu.id}>
            {editingId === edu.id ? (
              <EducationForm
                initial={edu}
                onSave={async (data) => { await onUpdate(edu.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex gap-3 group">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{edu.degree}</h4>
                      <p className="text-sm text-gray-500">{edu.institution}</p>
                      {edu.field_of_study && <p className="text-xs text-gray-400">{edu.field_of_study}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {edu.is_current && (
                        <span className="px-2 py-0.5 bg-accent-50 text-accent-700 text-xs font-medium rounded">
                          Saat ini
                        </span>
                      )}
                      <button
                        onClick={() => setEditingId(edu.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary-600 transition-all"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDelete(edu.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(edu.start_date)} — {edu.is_current ? 'Sekarang' : formatDate(edu.end_date)}
                  </p>
                  {edu.description && <p className="text-xs text-gray-500 mt-1">{edu.description}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── Education Form ── */
function EducationForm({ initial, onSave, onCancel }: {
  initial?: Partial<EducationPayload & { id: string }>;
  onSave: (data: EducationPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [data, setData] = useState<EducationPayload>({
    institution: initial?.institution || '',
    degree: initial?.degree || '',
    field_of_study: initial?.field_of_study || '',
    start_date: initial?.start_date?.slice(0, 10) || '',
    end_date: initial?.end_date?.slice(0, 10) || '',
    is_current: initial?.is_current ?? false,
    description: initial?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.institution || !data.degree) return;
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-3 mb-4 border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Institusi *" value={data.institution} onChange={(v) => setData({ ...data, institution: v })} />
        <FormField label="Gelar *" value={data.degree} onChange={(v) => setData({ ...data, degree: v })} />
        <FormField label="Bidang Studi" value={data.field_of_study || ''} onChange={(v) => setData({ ...data, field_of_study: v })} />
        <FormField label="Tanggal Mulai" type="date" value={data.start_date || ''} onChange={(v) => setData({ ...data, start_date: v })} />
        {!data.is_current && (
          <FormField label="Tanggal Selesai" type="date" value={data.end_date || ''} onChange={(v) => setData({ ...data, end_date: v })} />
        )}
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={data.is_current}
          onChange={(e) => setData({ ...data, is_current: e.target.checked, end_date: e.target.checked ? '' : data.end_date })}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Masih menempuh pendidikan
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
          Batal
        </button>
        <button
          type="submit"
          disabled={saving || !data.institution || !data.degree}
          className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
        >
          {saving && <Loader2 className="h-3 w-3 animate-spin" />}
          Simpan
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Saved Jobs Tab
   ═══════════════════════════════════════════════════════════════════ */
function SavedJobsTab() {
  const { savedJobs, loading, unsaveJob } = useSavedJobs();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  const items = savedJobs?.items || [];
  const total = savedJobs?.pagination?.total || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900">Lowongan Tersimpan</h2>
        <span className="text-xs text-gray-400">{total} lowongan</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-1">Belum ada lowongan tersimpan</p>
          <p className="text-xs text-gray-400">Simpan lowongan yang menarik untuk dilihat nanti</p>
        </div>
      ) : (
        items.map((job) => {
          const location = [job.regency_name, job.province_name].filter(Boolean).join(', ') || (job.job_is_remote ? 'Remote' : '-');
          const savedDate = formatRelativeDate(job.saved_at);
          const slug = job.slug || job.id;

          return (
            <div
              key={job.saved_id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center overflow-hidden">
                    {job.job_company_logo ? (
                      <img src={job.job_company_logo} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <Briefcase className="h-4 w-4 text-primary-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500">{job.job_company_name}</p>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" /> {location}
                      </span>
                      {job.employment_type_name && (
                        <>
                          <span className="text-xs text-gray-300">&middot;</span>
                          <span className="text-xs text-gray-400">{job.employment_type_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-xs text-gray-400">{savedDate}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/lowongan-kerja/${slug}`}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Lihat <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button
                      onClick={() => unsaveJob(job.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      title="Hapus dari tersimpan"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

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

/* ═══════════════════════════════════════════════════════════════════
   Settings Tab
   ═══════════════════════════════════════════════════════════════════ */
function SettingsTab({ preferences, onUpdatePreferences }: {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => Promise<any>;
}) {
  const handleToggle = async (key: keyof UserPreferences, value: boolean) => {
    await onUpdatePreferences({ [key]: value });
  };

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
          <ToggleItem
            label="Email Lowongan Relevan"
            description="Rekomendasi lowongan setiap 2 hari"
            checked={preferences.newsletter_jobs}
            onChange={(v) => handleToggle('newsletter_jobs', v)}
          />
          <ToggleItem
            label="Newsletter Karir"
            description="Tips karir dan tren industri mingguan"
            checked={preferences.newsletter_career}
            onChange={(v) => handleToggle('newsletter_career', v)}
          />
          <ToggleItem
            label="Update Lowongan Tersimpan"
            description="Notifikasi perubahan status lowongan"
            checked={preferences.notify_saved_job_updates}
            onChange={(v) => handleToggle('notify_saved_job_updates', v)}
          />
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

/* ═══════════════════════════════════════════════════════════════════
   Shared Helpers
   ═══════════════════════════════════════════════════════════════════ */

function Section({ title, actionLabel, onAction, children }: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            {actionLabel} {actionLabel === 'Tambah' ? <Plus className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
          </button>
        )}
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

function ToggleItem({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
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
        onClick={() => onChange(!checked)}
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

function FormField({ label, value, onChange, type = 'text' }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
      />
    </div>
  );
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  } catch {
    return date;
  }
}

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
    return `${Math.floor(diffDays / 365)} tahun lalu`;
  } catch {
    return dateStr;
  }
}
