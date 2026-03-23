import { describe, it, expect, beforeEach } from 'vitest';
import { FormatDatePipe } from './format-date.pipe';

describe('FormatDatePipe', () => {
  let pipe: FormatDatePipe;

  beforeEach(() => {
    pipe = new FormatDatePipe();
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('formats a valid ISO date string', () => {
    const d = new Date(2024, 0, 15, 14, 30);
    expect(pipe.transform(d.toISOString())).toBe('15 ene 2024, 14:30');
  });

  it('formats december correctly', () => {
    const d = new Date(2023, 11, 31, 23, 59);
    expect(pipe.transform(d.toISOString())).toBe('31 dic 2023, 23:59');
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('returns empty string for an invalid date string', () => {
    expect(pipe.transform('not-a-date')).toBe('');
  });
});
