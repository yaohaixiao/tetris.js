import computeRotatedShape from '@/lib/game/utils/compute-rotated-shape';
import rotateClockwise from '@/lib/game/utils/rotate-clockwise';
import rotateCounterClockwise from '@/lib/game/utils/rotate-counter-clockwise';

jest.mock('@/lib/game/utils/rotate-clockwise', () =>
  jest.fn(() => 'clockwise'),
);
jest.mock('@/lib/game/utils/rotate-counter-clockwise', () =>
  jest.fn(() => 'counterclockwise'),
);

describe('computeRotatedShape', () => {
  it('direction=1 调用 rotateClockwise', () => {
    const shape = [[1]];
    expect(computeRotatedShape(shape, 1)).toBe('clockwise');
    expect(rotateClockwise).toHaveBeenCalledWith(shape);
  });

  it('direction=-1 调用 rotateCounterClockwise', () => {
    const shape = [[1]];
    expect(computeRotatedShape(shape, -1)).toBe('counterclockwise');
    expect(rotateCounterClockwise).toHaveBeenCalledWith(shape);
  });
});
