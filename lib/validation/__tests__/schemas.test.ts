import { validateInput, jobSearchSchema, paginationSchema } from '../schemas';

describe('jobSearchSchema', () => {
  it('accepts valid search params', () => {
    const result = validateInput(jobSearchSchema, {
      page: 1,
      limit: 10,
      search: 'developer',
      location: 'Jakarta',
    });
    expect(result.success).toBe(true);
  });

  it('applies defaults for missing page/limit', () => {
    const result = validateInput(jobSearchSchema, {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data!.page).toBe(1);
      expect(result.data!.limit).toBe(10);
    }
  });

  it('rejects negative page', () => {
    const result = validateInput(jobSearchSchema, { page: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects limit > 100', () => {
    const result = validateInput(jobSearchSchema, { limit: 200 });
    expect(result.success).toBe(false);
  });

  it('rejects salary_min > salary_max', () => {
    const result = validateInput(jobSearchSchema, {
      salary_min: 10000,
      salary_max: 5000,
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid salary range', () => {
    const result = validateInput(jobSearchSchema, {
      salary_min: 5000,
      salary_max: 10000,
    });
    expect(result.success).toBe(true);
  });
});

describe('paginationSchema', () => {
  it('applies defaults', () => {
    const result = validateInput(paginationSchema, {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data!.page).toBe(1);
      expect(result.data!.limit).toBe(10);
    }
  });

  it('rejects limit > 100', () => {
    const result = validateInput(paginationSchema, { limit: 150 });
    expect(result.success).toBe(false);
  });
});
