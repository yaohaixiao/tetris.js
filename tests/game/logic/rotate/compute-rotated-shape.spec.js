import computeRotatedShape from '@/lib/game/logic/rotate/compute-rotated-shape.js';
import rotateClockwise from '@/lib/game/logic/rotate/rotate-clockwise.js';
import rotateCounterClockwise from '@/lib/game/logic/rotate/rotate-counter-clockwise.js';

jest.mock('@/lib/game/logic/rotate/rotate-clockwise.js', () =>
  jest.fn(() => 'clockwise'),
);
jest.mock('@/lib/game/logic/rotate/rotate-counter-clockwise.js', () =>
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
