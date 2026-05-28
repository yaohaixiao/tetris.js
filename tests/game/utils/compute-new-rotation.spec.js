import computeNewRotation from '@/lib/game/utils/compute-new-rotation';

describe('computeNewRotation', () => {
  it('顺时针：0 → 1', () => {
    expect(computeNewRotation(0, 1)).toBe(1);
  });

  it('顺时针：1 → 2', () => {
    expect(computeNewRotation(1, 1)).toBe(2);
  });

  it('顺时针：2 → 3', () => {
    expect(computeNewRotation(2, 1)).toBe(3);
  });

  it('顺时针：3 → 0', () => {
    expect(computeNewRotation(3, 1)).toBe(0);
  });

  it('逆时针：0 → 3', () => {
    expect(computeNewRotation(0, -1)).toBe(3);
  });

  it('逆时针：3 → 2', () => {
    expect(computeNewRotation(3, -1)).toBe(2);
  });

  it('逆时针：1 → 0', () => {
    expect(computeNewRotation(1, -1)).toBe(0);
  });

  it('current 为 undefined 时视为 0', () => {
    expect(computeNewRotation(undefined, 1)).toBe(1);
  });
});
