import { formatRelativeDate, formatJobDate, formatArticleDate, formatFullDate, isHotJob, getHoursAgo } from '../date';

describe('formatRelativeDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "Baru saja" for undefined input', () => {
    expect(formatRelativeDate()).toBe('Baru saja');
    expect(formatRelativeDate(undefined)).toBe('Baru saja');
  });

  it('returns hours ago for <24h', () => {
    const threeHoursAgo = new Date('2024-06-15T09:00:00Z').toISOString();
    expect(formatRelativeDate(threeHoursAgo)).toBe('3 jam lalu');
  });

  it('returns "1 jam lalu" for 1 hour', () => {
    const oneHourAgo = new Date('2024-06-15T11:00:00Z').toISOString();
    expect(formatRelativeDate(oneHourAgo)).toBe('1 jam lalu');
  });

  it('returns days ago for 1-6 days', () => {
    const threeDaysAgo = new Date('2024-06-12T12:00:00Z').toISOString();
    expect(formatRelativeDate(threeDaysAgo)).toMatch(/\d+ hari lalu/);
  });

  it('returns "1 hari lalu" for exactly 1 day', () => {
    const oneDayAgo = new Date('2024-06-14T12:00:00Z').toISOString();
    expect(formatRelativeDate(oneDayAgo)).toBe('1 hari lalu');
  });

  it('returns weeks ago for 7-29 days', () => {
    const twoWeeksAgo = new Date('2024-06-01T12:00:00Z').toISOString();
    expect(formatRelativeDate(twoWeeksAgo)).toMatch(/\d+ minggu lalu/);
  });

  it('returns months ago for 30+ days', () => {
    const twoMonthsAgo = new Date('2024-04-15T12:00:00Z').toISOString();
    expect(formatRelativeDate(twoMonthsAgo)).toMatch(/\d+ bulan lalu/);
  });
});

describe('formatJobDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "Baru dipublikasikan" for undefined', () => {
    expect(formatJobDate()).toBe('Baru dipublikasikan');
  });

  it('prefixes relative date with "Dipublikasikan"', () => {
    const threeHoursAgo = new Date('2024-06-15T09:00:00Z').toISOString();
    expect(formatJobDate(threeHoursAgo)).toBe('Dipublikasikan 3 jam lalu');
  });
});

describe('formatArticleDate', () => {
  it('formats as Indonesian locale date', () => {
    const result = formatArticleDate('2024-01-15T00:00:00Z');
    // Should contain year 2024 and day 15
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });
});

describe('formatFullDate', () => {
  it('formats with time', () => {
    const result = formatFullDate('2024-01-15T14:30:00Z');
    expect(result).toContain('2024');
  });
});

describe('isHotJob', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns false for undefined', () => {
    expect(isHotJob()).toBe(false);
  });

  it('returns true for jobs posted within 12 hours', () => {
    const sixHoursAgo = new Date('2024-06-15T06:00:00Z').toISOString();
    expect(isHotJob(sixHoursAgo)).toBe(true);
  });

  it('returns false for jobs posted more than 12 hours ago', () => {
    const oneDayAgo = new Date('2024-06-14T12:00:00Z').toISOString();
    expect(isHotJob(oneDayAgo)).toBe(false);
  });
});

describe('getHoursAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns 0 for undefined', () => {
    expect(getHoursAgo()).toBe(0);
  });

  it('returns correct hours difference', () => {
    const fiveHoursAgo = new Date('2024-06-15T07:00:00Z').toISOString();
    expect(getHoursAgo(fiveHoursAgo)).toBe(5);
  });
});
