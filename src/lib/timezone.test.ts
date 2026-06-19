import { describe, expect, it } from 'vitest';

import { fromDatetimeLocalValue, toDatetimeLocalValue } from './timezone';

describe('datetime-local helpers', () => {
  it('converts date to local input string', () => {
    const value = toDatetimeLocalValue(new Date('2026-06-19T09:05:00.000Z'));
    expect(value).toMatch(/^2026-06-19T/);
  });

  it('converts local input string to ISO', () => {
    expect(fromDatetimeLocalValue('2026-06-19T12:30')).toContain('2026-06-19T');
  });
});
