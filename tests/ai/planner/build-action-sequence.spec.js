import buildActionSequence from '@/lib/ai/planner/build-action-sequence.js';

describe('buildActionSequence', () => {
  it('原地旋转后硬降', () => {
    const result = buildActionSequence({
      rotationCount: 1,
      targetX: 4,
      originalX: 4,
    });
    expect(result).toEqual(['ROTATE', 'DROP']);
  });

  it('右移后硬降', () => {
    const result = buildActionSequence({
      rotationCount: 0,
      targetX: 6,
      originalX: 4,
    });
    expect(result).toEqual(['MOVE_RIGHT', 'MOVE_RIGHT', 'DROP']);
  });

  it('左移后硬降', () => {
    const result = buildActionSequence({
      rotationCount: 0,
      targetX: 2,
      originalX: 4,
    });
    expect(result).toEqual(['MOVE_LEFT', 'MOVE_LEFT', 'DROP']);
  });

  it('旋转 + 右移 + 硬降', () => {
    const result = buildActionSequence({
      rotationCount: 2,
      targetX: 5,
      originalX: 3,
    });
    expect(result).toEqual(['ROTATE', 'ROTATE', 'MOVE_RIGHT', 'MOVE_RIGHT', 'DROP']);
  });

  it('不需要移动时只有旋转和硬降', () => {
    const result = buildActionSequence({
      rotationCount: 3,
      targetX: 3,
      originalX: 3,
    });
    expect(result).toEqual(['ROTATE', 'ROTATE', 'ROTATE', 'DROP']);
  });

  it('不需要旋转时只有移动和硬降', () => {
    const result = buildActionSequence({
      rotationCount: 0,
      targetX: 1,
      originalX: 4,
    });
    expect(result).toEqual(['MOVE_LEFT', 'MOVE_LEFT', 'MOVE_LEFT', 'DROP']);
  });

  it('硬降始终在最后', () => {
    const result = buildActionSequence({
      rotationCount: 1,
      targetX: 5,
      originalX: 4,
    });
    expect(result[result.length - 1]).toBe('DROP');
  });
});
