import { describe, expect, it } from 'vitest';

import { formatCalories, formatMealType, formatWeight } from './format';

describe('format helpers', () => {
  it('formats calories', () => {
    expect(formatCalories(123.6)).toBe('124 ккал');
  });

  it('formats weight', () => {
    expect(formatWeight(87.2)).toBe('87 г');
  });

  it('formats meal type', () => {
    expect(formatMealType('snacks')).toBe('Снеки');
  });
});
