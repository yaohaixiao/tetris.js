import hold from '@/lib/game/logic/hold';
import spawn from '@/lib/game/logic/spawn';

jest.mock('@/lib/game/logic/spawn', () => jest.fn());

jest.mock('@/lib/events/event-catalog.js', () => ({
  UIEvents: (uuid) => ({
    RENDER_HOLD_PIECE: `ui:${uuid}:render:hold:piece`,
  }),
}));

describe('hold', () => {
  let mockRuntime;
  let mockStore;
  let mockState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      curr: {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#ffa500',
        colorIndex: 2,
        type: 'O',
        rotation: 0,
      },
      hold: null,
    };

    mockStore = {
      getState: jest.fn(() => mockState),
      setState: jest.fn(),
    };

    mockRuntime = {
      Store: mockStore,
      Elements: {
        Canvas: {
          cols: 10,
        },
      },
      id: 'test-uuid',
      emit: jest.fn(),
    };
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('curr 为 null 时不执行', () => {
      mockState.curr = null;

      hold(mockRuntime);

      expect(mockStore.setState).not.toHaveBeenCalled();
      expect(spawn).not.toHaveBeenCalled();
    });

    it('curr._held 为 true 时不执行', () => {
      mockState.curr._held = true;

      hold(mockRuntime);

      expect(mockStore.setState).not.toHaveBeenCalled();
      expect(spawn).not.toHaveBeenCalled();
    });
  });

  // ==================== 首次 hold ====================
  describe('首次 hold（hold 为 null）', () => {
    it('暂存当前方块到 hold', () => {
      hold(mockRuntime);

      expect(mockStore.setState).toHaveBeenCalledWith({
        hold: { ...mockState.curr, _held: true },
      });
    });

    it('调用 spawn 生成新方块', () => {
      hold(mockRuntime);

      expect(spawn).toHaveBeenCalledWith(mockRuntime);
    });

    it('发射 RENDER_HOLD_PIECE 事件', () => {
      hold(mockRuntime);

      expect(mockRuntime.emit).toHaveBeenCalledWith(
        'ui:test-uuid:render:hold:piece',
      );
    });
  });

  // ==================== 交换 hold ====================
  describe('交换 hold', () => {
    beforeEach(() => {
      mockState.hold = {
        shape: [[1, 1, 1, 1]],
        color: '#00c8ff',
        colorIndex: 0,
        type: 'I',
        rotation: 0,
      };
    });

    it('curr 和 hold 互换', () => {
      const originalCurr = { ...mockState.curr };
      const originalHold = { ...mockState.hold };

      hold(mockRuntime);

      expect(mockStore.setState).toHaveBeenCalledWith({
        curr: { ...originalHold, _held: true },
        hold: { ...originalCurr, _held: true },
        cx: expect.any(Number),
        cy: 0,
      });
    });

    it('交换后两个方块都标记 _held: true', () => {
      hold(mockRuntime);

      const call = mockStore.setState.mock.calls[0][0];
      expect(call.curr._held).toBe(true);
      expect(call.hold._held).toBe(true);
    });

    it('居中计算：4 列宽方块 cx = 3', () => {
      hold(mockRuntime);

      const call = mockStore.setState.mock.calls[0][0];
      // floor(10/2) - floor(4/2) = 5 - 2 = 3
      expect(call.cx).toBe(3);
    });

    it('cy 重置为 0', () => {
      hold(mockRuntime);

      const call = mockStore.setState.mock.calls[0][0];
      expect(call.cy).toBe(0);
    });

    it('发射 RENDER_HOLD_PIECE 事件', () => {
      hold(mockRuntime);

      expect(mockRuntime.emit).toHaveBeenCalledWith(
        'ui:test-uuid:render:hold:piece',
      );
    });

    it('交换时不调用 spawn', () => {
      hold(mockRuntime);

      expect(spawn).not.toHaveBeenCalled();
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('curr 为 I5 型（5 列）居中 cx = 2', () => {
      mockState.curr = {
        shape: [[1, 1, 1, 1, 1]],
        color: '#0afa04',
        colorIndex: 1,
        type: 'I5',
        rotation: 0,
      };
      mockState.hold = {
        shape: [[1, 1, 1, 1]],
        color: '#00c8ff',
        colorIndex: 0,
        type: 'I',
        rotation: 0,
      };

      hold(mockRuntime);

      const call = mockStore.setState.mock.calls[0][0];
      // floor(10/2) - floor(4/2) = 5 - 2 = 3
      expect(call.cx).toBe(3);
    });
  });
});
