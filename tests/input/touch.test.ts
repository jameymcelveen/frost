import { describe, expect, it } from 'vitest';
import { directionFromSwipe } from '../../src/input/TouchInput.ts';

describe('TouchInput', () => {
  it('maps horizontal swipes', () => {
    expect(directionFromSwipe(40, 2)).toBe('east');
    expect(directionFromSwipe(-40, 2)).toBe('west');
  });

  it('maps vertical swipes', () => {
    expect(directionFromSwipe(2, -40)).toBe('north');
    expect(directionFromSwipe(2, 40)).toBe('south');
  });

  it('ignores small movement', () => {
    expect(directionFromSwipe(10, 10)).toBeNull();
  });
});
