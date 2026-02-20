/**
 * Pure utility functions extracted from useJobSearch hook.
 * These have no React dependencies and are independently testable.
 */

import type { FilterData } from '@/lib/cms/interface';

export interface SidebarFilters {
  cities: string[];
  jobTypes: string[];
  experiences: string[];
  educations: string[];
  industries: string[];
  workPolicies: string[];
  categories: string[];
  salaries: string[];
}

export const EMPTY_SIDEBAR_FILTERS: SidebarFilters = {
  cities: [],
  jobTypes: [],
  experiences: [],
  educations: [],
  industries: [],
  workPolicies: [],
  categories: [],
  salaries: [],
};

const SALARY_RANGE_MAP: Record<string, { min: number; max: number | null }> = {
  '1-3': { min: 1_000_000, max: 3_000_000 },
  '4-6': { min: 4_000_000, max: 6_000_000 },
  '7-9': { min: 7_000_000, max: 9_000_000 },
  '10+': { min: 10_000_000, max: null },
};

/**
 * Convert selected salary range keys into min/max strings for API.
 */
export function calculateSalaryRange(selectedRanges: string[]): { min: string | null; max: string | null } {
  if (!selectedRanges || selectedRanges.length === 0) return { min: null, max: null };
  if (selectedRanges.length === 4) return { min: '1000000', max: null };

  let minSalary = Number.MAX_SAFE_INTEGER;
  let maxSalary: number | null = null;
  let hasOpenRange = false;

  for (const range of selectedRanges) {
    const mapping = SALARY_RANGE_MAP[range];
    if (mapping) {
      minSalary = Math.min(minSalary, mapping.min);
      if (mapping.max === null) {
        hasOpenRange = true;
      } else if (!hasOpenRange) {
        maxSalary = maxSalary === null ? mapping.max : Math.max(maxSalary, mapping.max);
      }
    }
  }

  return {
    min: minSalary === Number.MAX_SAFE_INTEGER ? null : String(minSalary),
    max: hasOpenRange ? null : maxSalary !== null ? String(maxSalary) : null,
  };
}

/**
 * Build URLSearchParams for the /api/job-posts endpoint.
 */
export function buildSearchParams(filters: any, page: number): URLSearchParams {
  const salaryRange = calculateSalaryRange(filters.salaries);
  return new URLSearchParams({
    page: String(page),
    limit: '24',
    ...(filters.search && { search: filters.search }),
    ...(filters.location && { location: filters.location }),
    ...(filters.cities?.length > 0 && { city: filters.cities[0] }),
    ...(filters.categories?.length > 0 && { job_category: filters.categories[0] }),
    ...(filters.jobTypes?.length > 0 && { employment_type: filters.jobTypes[0] }),
    ...(filters.experiences?.length > 0 && { experience_level: filters.experiences[0] }),
    ...(filters.educations?.length > 0 && { education_level: filters.educations[0] }),
    ...(filters.workPolicies?.length > 0 && { work_policy: filters.workPolicies[0] }),
    ...(salaryRange.min && { job_salary_min: salaryRange.min }),
    ...(salaryRange.max && { job_salary_max: salaryRange.max }),
  });
}

/**
 * Get a human-readable label for a filter value.
 */
export function getFilterLabel(filterData: FilterData | null, filterType: string, value: string): string {
  if (!filterData) return value;
  switch (filterType) {
    case 'cities':
      return filterData.regencies.find((r) => r.id === value)?.name ?? value;
    case 'jobTypes':
      return filterData.employment_types.find((t) => t.id === value)?.name ?? value;
    case 'experiences': {
      const exp = filterData.experience_levels.find((e) => e.id === value);
      if (!exp) return value;
      return exp.years_max != null ? `${exp.years_min}-${exp.years_max} tahun` : `${exp.years_min}+ tahun`;
    }
    case 'educations':
      return filterData.education_levels.find((e) => e.id === value)?.name ?? value;
    case 'categories':
      return filterData.categories.find((c) => c.id === value)?.name ?? value;
    case 'workPolicies':
      return filterData.work_policy.find((w) => w.value === value)?.name ?? value;
    case 'salaries':
      return ({ '1-3': '1-3 Juta', '4-6': '4-6 Juta', '7-9': '7-9 Juta', '10+': '10+ Juta' })[value] ?? value;
    default:
      return value;
  }
}

/**
 * Get a province name from its id.
 */
export function getProvinceName(filterData: FilterData | null, provinceId: string): string {
  if (!filterData) return provinceId;
  return filterData.provinces.find((p) => p.id === provinceId)?.name ?? provinceId;
}

/**
 * Map province data to select options.
 */
export function getProvinceOptions(filterData: FilterData | null): { value: string; label: string }[] {
  if (!filterData) return [];
  return filterData.provinces.map((p) => ({ value: p.id, label: p.name }));
}

/**
 * Get filter type label for UI display.
 */
export function getFilterTypeLabel(filterType: string): string {
  const labels: Record<string, string> = {
    cities: 'Kota',
    jobTypes: 'Tipe Pekerjaan',
    experiences: 'Pengalaman',
    educations: 'Pendidikan',
    categories: 'Kategori',
    workPolicies: 'Kebijakan Kerja',
    salaries: 'Gaji',
    industries: 'Industri',
  };
  return labels[filterType] || filterType;
}

/**
 * Count active filters for badge display.
 */
export function countActiveFilters(
  keyword: string,
  selectedProvince: string,
  sidebarFilters: SidebarFilters,
  initialLocation?: string,
  locationType?: string,
  initialCategory?: string,
): number {
  let count = 0;
  if (keyword) count++;
  if ((initialLocation && locationType === 'province') || selectedProvince) count++;
  Object.entries(sidebarFilters).forEach(([key, arr]) => {
    if (key === 'categories' && initialCategory) {
      count += arr.filter((v: string) => v !== initialCategory).length;
    } else if (key === 'cities' && initialLocation && locationType === 'city') {
      count += arr.filter((v: string) => v !== initialLocation).length;
    } else {
      count += arr.length;
    }
  });
  return count;
}
