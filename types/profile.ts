// User profile types — matches CMS database schema

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  phone: string | null;
  preferences: UserPreferences;
  role: 'super_admin' | 'admin' | 'user';
  created_at: string;
  updated_at: string;
  skills: UserSkill[];
  experience: UserExperience[];
  education: UserEducation[];
}

export interface UserPreferences {
  newsletter_jobs: boolean;
  newsletter_career: boolean;
  notify_saved_job_updates: boolean;
}

export interface UserSkill {
  id: string;
  name: string;
  created_at: string;
}

export interface UserExperience {
  id: string;
  company_name: string;
  company_logo: string | null;
  job_title: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedJob {
  saved_id: string;
  saved_at: string;
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  status: string;
  publish_date: string;
  job_company_name: string;
  job_company_logo: string | null;
  job_salary_min: number | null;
  job_salary_max: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_is_remote: boolean;
  job_is_hybrid: boolean;
  job_deadline: string | null;
  job_province_id: string | null;
  job_regency_id: string | null;
  province_name: string | null;
  regency_name: string | null;
  employment_type_name: string | null;
  experience_level_name: string | null;
}

export interface SavedJobsResponse {
  items: SavedJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Update payloads
export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
}

export interface UpdateSkillsPayload {
  skills: string[];
}

export interface ExperiencePayload {
  company_name: string;
  company_logo?: string | null;
  job_title: string;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
}

export interface EducationPayload {
  institution: string;
  degree: string;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
}
