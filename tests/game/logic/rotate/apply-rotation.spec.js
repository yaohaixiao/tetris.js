import applyRotation from '@/lib/game/logic/rotate/apply-rotation.js';

describe('applyRotation', () => {
  let mockStore;
  let curr;

  beforeEach(() => {
    curr = {
      shape: [[1]],
      rotation: 0,
      colorIndex: 3,
      _lockTimer: 100,
    };

    mockStore = {
      setState: jest.fn(),
    };
  });

  // ==================== 原地旋转（无墙踢） ====================
  describe('原地旋转（无墙踢）', () => {
    it('应该更新 curr 的 shape 和 rotation', () => {
      applyRotation(
        mockStore,
        curr,
        [
          [0, 1],
          [1, 0],
        ],
        1,
      );

      expect(mockStore.setState).toHaveBeenCalledWith({
        curr: {
          shape: [
            [0, 1],
            [1, 0],
          ],
          rotation: 1,
          colorIndex: 3,
          _lockTimer: 100,
        },
      });
    });

    it('不传 cx/cy 时不应该更新坐标', () => {
      applyRotation(mockStore, curr, [[1, 0]], 1);

      const call = mockStore.setState.mock.calls[0][0];
      expect(call).not.toHaveProperty('cx');
      expect(call).not.toHaveProperty('cy');
    });

    it('不应该重置 _lockTimer（已分离到 resetLockDelay）', () => {
      applyRotation(mockStore, curr, [[1]], 1);

      // _lockTimer 保持不变，由调用方手动调用 resetLockDelay
      expect(curr._lockTimer).toBe(100);
    });
  });

  // ==================== 墙踢偏移 ====================
  describe('墙踢偏移', () => {
    it('应该同步更新 cx 和 cy', () => {
      applyRotation(
        mockStore,
        curr,
        [
          [0, 1],
          [1, 0],
        ],
        1,
        5,
        10,
      );

      expect(mockStore.setState).toHaveBeenCalledWith({
        curr: {
          shape: [
            [0, 1],
            [1, 0],
          ],
          rotation: 1,
          colorIndex: 3,
          _lockTimer: 100,
        },
        cx: 5,
        cy: 10,
      });
    });

    it('只传 cx 时应该只更新 cx', () => {
      applyRotation(mockStore, curr, [[1]], 1, 3);

      const call = mockStore.setState.mock.calls[0][0];
      expect(call.cx).toBe(3);
      expect(call).not.toHaveProperty('cy');
    });

    it('只传 cy 时应该只更新 cy', () => {
      applyRotation(mockStore, curr, [[1]], 1, undefined, 7);

      const call = mockStore.setState.mock.calls[0][0];
      expect(call.cy).toBe(7);
      expect(call).not.toHaveProperty('cx');
    });
  });

  // ==================== 旋转状态 ====================
  describe('旋转状态', () => {
    it('应该正确传递 newRotation = 0', () => {
      applyRotation(mockStore, curr, [[1]], 0);

      expect(mockStore.setState).toHaveBeenCalledWith({
        curr: expect.objectContaining({ rotation: 0 }),
      });
    });

    it('应该正确传递 newRotation = 3', () => {
      applyRotation(mockStore, curr, [[1]], 3);

      expect(mockStore.setState).toHaveBeenCalledWith({
        curr: expect.objectContaining({ rotation: 3 }),
      });
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('curr 无 _lockTimer 时不应崩溃', () => {
      delete curr._lockTimer;

      expect(() => applyRotation(mockStore, curr, [[1]], 1)).not.toThrow();
    });

    it('空形状矩阵应该正常处理', () => {
      applyRotation(mockStore, curr, [], 0);

      expect(mockStore.setState).toHaveBeenCalledWith({
        curr: expect.objectContaining({ shape: [] }),
      });
    });

    it('cx 为 0 时应该正常更新（0 不是 undefined）', () => {
      applyRotation(mockStore, curr, [[1]], 1, 0, 5);

      expect(mockStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({ cx: 0 }),
      );
    });

    it('cy 为 0 时应该正常更新', () => {
      applyRotation(mockStore, curr, [[1]], 1, 5, 0);

      expect(mockStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({ cy: 0 }),
      );
    });
  });
});
