'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  UserProfile,
  UserPreferences,
  UpdateProfilePayload,
  UpdateSkillsPayload,
  ExperiencePayload,
  EducationPayload,
  SavedJobsResponse,
} from '@/types/profile';

async function apiFetch<T = any>(url: string, options?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await apiFetch<UserProfile>('/api/profile');
    if (result.success && result.data) {
      setProfile(result.data);
    } else {
      setError(result.error || 'Failed to load profile');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ─── Basic Profile ───
  const updateProfile = useCallback(async (data: UpdateProfilePayload) => {
    const result = await apiFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (result.success && result.data) {
      setProfile((prev) => prev ? { ...prev, ...result.data } : prev);
    }
    return result;
  }, []);

  // ─── Preferences ───
  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    const result = await apiFetch('/api/profile/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
    if (result.success && result.data) {
      setProfile((prev) => prev ? { ...prev, preferences: result.data.preferences } : prev);
    }
    return result;
  }, []);

  // ─── Skills ───
  const updateSkills = useCallback(async (data: UpdateSkillsPayload) => {
    // Delete all then batch-insert (simplest approach)
    await apiFetch('/api/profile/skills', { method: 'DELETE' });
    const result = await apiFetch('/api/profile/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.success) {
      // Refetch skills
      const skillsResult = await apiFetch('/api/profile/skills');
      if (skillsResult.success && skillsResult.data) {
        setProfile((prev) => prev ? { ...prev, skills: skillsResult.data } : prev);
      }
    }
    return result;
  }, []);

  // ─── Experience ───
  const addExperience = useCallback(async (data: ExperiencePayload) => {
    const result = await apiFetch('/api/profile/experience', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.success) {
      await fetchProfile(); // Refresh full profile
    }
    return result;
  }, [fetchProfile]);

  const updateExperience = useCallback(async (id: string, data: Partial<ExperiencePayload>) => {
    const result = await apiFetch(`/api/profile/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (result.success) {
      await fetchProfile();
    }
    return result;
  }, [fetchProfile]);

  const deleteExperience = useCallback(async (id: string) => {
    const result = await apiFetch(`/api/profile/experience/${id}`, { method: 'DELETE' });
    if (result.success) {
      setProfile((prev) => prev ? {
        ...prev,
        experience: prev.experience.filter((e) => e.id !== id),
      } : prev);
    }
    return result;
  }, []);

  // ─── Education ───
  const addEducation = useCallback(async (data: EducationPayload) => {
    const result = await apiFetch('/api/profile/education', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.success) {
      await fetchProfile();
    }
    return result;
  }, [fetchProfile]);

  const updateEducation = useCallback(async (id: string, data: Partial<EducationPayload>) => {
    const result = await apiFetch(`/api/profile/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (result.success) {
      await fetchProfile();
    }
    return result;
  }, [fetchProfile]);

  const deleteEducation = useCallback(async (id: string) => {
    const result = await apiFetch(`/api/profile/education/${id}`, { method: 'DELETE' });
    if (result.success) {
      setProfile((prev) => prev ? {
        ...prev,
        education: prev.education.filter((e) => e.id !== id),
      } : prev);
    }
    return result;
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updatePreferences,
    updateSkills,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
  };
}

// ─── Saved Jobs Hook ───
export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJobsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    const result = await apiFetch<SavedJobsResponse>(`/api/profile/saved-jobs?page=${page}&limit=${limit}`);
    if (result.success && result.data) {
      setSavedJobs(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const unsaveJob = useCallback(async (jobPostId: string) => {
    const result = await apiFetch(`/api/profile/saved-jobs/${jobPostId}`, { method: 'DELETE' });
    if (result.success) {
      setSavedJobs((prev) => prev ? {
        ...prev,
        items: prev.items.filter((j) => j.id !== jobPostId),
        pagination: { ...prev.pagination, total: prev.pagination.total - 1 },
      } : prev);
    }
    return result;
  }, []);

  return { savedJobs, loading, fetchSavedJobs, unsaveJob };
}
