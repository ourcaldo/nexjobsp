'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import type { UserPreferences } from '@/types/profile';
import { ToggleItem } from './shared';

export default function SettingsTab({ preferences, onUpdatePreferences }: {
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
