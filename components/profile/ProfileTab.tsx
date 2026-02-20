'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Briefcase, GraduationCap,
  FileText, Loader2, Plus, X, Pencil, Trash2,
} from 'lucide-react';
import type {
  UserProfile,
  ExperiencePayload,
  EducationPayload,
} from '@/types/profile';
import { Section, InfoItem, FormField, formatDate } from './shared';

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

export default function ProfileTab({
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
      <EditableAbout
        bio={profile.bio}
        onSave={async (bio) => { await onUpdateProfile({ bio }); }}
        editing={editingSection === 'about'}
        onEdit={() => setEditingSection('about')}
        onCancel={() => setEditingSection(null)}
      />
      <EditableContact
        profile={profile}
        onSave={onUpdateProfile}
        editing={editingSection === 'contact'}
        onEdit={() => setEditingSection('contact')}
        onCancel={() => setEditingSection(null)}
      />
      <EditableSkills
        skills={profile.skills.map((s) => s.name)}
        onSave={async (skills) => { await onUpdateSkills({ skills }); }}
        editing={editingSection === 'skills'}
        onEdit={() => setEditingSection('skills')}
        onCancel={() => setEditingSection(null)}
      />
      <ExperienceSection
        items={profile.experience}
        onAdd={onAddExperience}
        onUpdate={onUpdateExperience}
        onDelete={onDeleteExperience}
      />
      <EducationSection
        items={profile.education}
        onAdd={onAddEducation}
        onUpdate={onUpdateEducation}
        onDelete={onDeleteEducation}
      />
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
