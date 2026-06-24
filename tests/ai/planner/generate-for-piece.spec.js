import generateForPiece from '@/lib/ai/planner/generate-for-piece.js';

jest.mock('@/lib/ai/simulator/rotate-matrix.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/planner/utils/get-valid-x-positions.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/ai/planner/create-candidate.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import rotateMatrix from '@/lib/ai/simulator/rotate-matrix.js';
import getValidXPositions from '../../../lib/ai/planner/utils/get-valid-x-positions.js';
import createCandidate from '@/lib/ai/planner/create-candidate.js';

describe('generateForPiece', () => {
  const board = Array.from({ length: 20 }, () =>
    Array.from({ length: 10 }, () => 0),
  );
  const shape = [
    [0, 1, 0],
    [1, 1, 1],
  ];
  const piece = { shape, position: { x: 3, y: 0 } };

  beforeEach(() => {
    jest.clearAllMocks();
    getValidXPositions.mockReturnValue([3, 4, 5]);
    createCandidate.mockImplementation(({ targetX, rotationCount }) => ({
      board,
      actions: [`ROTATE_${rotationCount}`, `MOVE_${targetX}`, 'DROP'],
    }));
    rotateMatrix.mockReturnValue([[1]]);
  });

  it('应该遍历 4 个旋转状态', () => {
    generateForPiece(board, piece);
    // 每个旋转调一次 getValidXPositions，总共 4 次
    expect(getValidXPositions).toHaveBeenCalledTimes(4);
  });

  it('应该为每个合法 X 位置创建候选', () => {
    generateForPiece(board, piece);
    // 4 旋转 × 3 合法位置 = 12 个候选
    expect(createCandidate).toHaveBeenCalledTimes(12);
  });

  it('isHold=true 时应在动作序列前加 HOLD', () => {
    const result = generateForPiece(board, piece, true);
    result.forEach((candidate) => {
      expect(candidate.actions[0]).toBe('HOLD');
    });
  });

  it('isHold=false 时动作序列不应包含 HOLD', () => {
    const result = generateForPiece(board, piece, false);
    result.forEach((candidate) => {
      expect(candidate.actions[0]).not.toBe('HOLD');
    });
  });

  it('每次旋转后应调用 rotateMatrix', () => {
    generateForPiece(board, piece);
    // 初始形状不旋转，之后 4 次旋转调用 rotateMatrix
    expect(rotateMatrix).toHaveBeenCalledTimes(4);
  });

  it('应返回所有候选的数组', () => {
    const result = generateForPiece(board, piece);
    expect(result).toHaveLength(12);
    expect(result[0]).toHaveProperty('board');
    expect(result[0]).toHaveProperty('actions');
  });
});
