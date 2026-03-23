import { describe, it, expect } from 'vitest';
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
    expect(pipe.transform('2024-01-15T10:00:00.000Z')).toBe('15 ene 2024');
  });

  it('formats december correctly', () => {
    // Use noon UTC to avoid timezone boundary issues
    expect(pipe.transform('2023-12-31T12:00:00.000Z')).toBe('31 dic 2023');
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
