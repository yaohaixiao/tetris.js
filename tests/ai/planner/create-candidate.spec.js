import createCandidate from '@/lib/ai/planner/create-candidate.js';

jest.mock('@/lib/ai/simulator/simulate-drop.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/planner/build-action-sequence.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import simulateDrop from '@/lib/ai/simulator/simulate-drop.js';
import buildActionSequence from '@/lib/ai/planner/build-action-sequence.js';

describe('createCandidate', () => {
  const board = Array.from({ length: 20 }, () =>
    Array.from({ length: 10 }, () => 0),
  );
  const shape = [
    [0, 1, 0],
    [1, 1, 1],
  ];
  const piece = { position: { x: 3, y: 0 } };

  beforeEach(() => {
    jest.clearAllMocks();
    simulateDrop.mockReturnValue({
      y: 18,
      placeOn: jest.fn((targetBoard) => targetBoard),
    });
    buildActionSequence.mockReturnValue(['ROTATE', 'MOVE_RIGHT', 'DROP']);
  });

  it('应该调用 simulateDrop 模拟硬降', () => {
    createCandidate({
      board,
      currentShape: shape,
      targetX: 4,
      originalPiece: piece,
      rotationCount: 1,
    });

    expect(simulateDrop).toHaveBeenCalledWith(board, shape, 4);
  });

  it('应该调用 buildActionSequence 生成动作序列', () => {
    createCandidate({
      board,
      currentShape: shape,
      targetX: 5,
      originalPiece: piece,
      rotationCount: 2,
    });

    expect(buildActionSequence).toHaveBeenCalledWith({
      rotationCount: 2,
      targetX: 5,
      originalX: 3,
    });
  });

  it('应该返回包含 placeOn、actions 和 y 的对象', () => {
    const result = createCandidate({
      board,
      currentShape: shape,
      targetX: 4,
      originalPiece: piece,
      rotationCount: 0,
    });

    expect(result).toHaveProperty('placeOn');
    expect(result).toHaveProperty('actions');
    expect(result).toHaveProperty('y');
    expect(typeof result.placeOn).toBe('function');
    expect(result.actions).toEqual(['ROTATE', 'MOVE_RIGHT', 'DROP']);
    expect(result.y).toBe(18);
  });

  it('rotationCount 为 0 时应正确传递', () => {
    createCandidate({
      board,
      currentShape: shape,
      targetX: 3,
      originalPiece: piece,
      rotationCount: 0,
    });

    expect(buildActionSequence).toHaveBeenCalledWith({
      rotationCount: 0,
      targetX: 3,
      originalX: 3,
    });
  });
});
