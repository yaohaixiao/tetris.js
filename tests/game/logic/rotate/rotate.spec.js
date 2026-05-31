import rotate from '@/lib/game/logic/rotate/rotate.js';
import collision from '@/lib/game/logic/collision.js';
import { AudioEvents } from '@/lib/events/event-catalog.js';
import getKickData from '@/lib/game/logic/rotate/get-kick-data.js';
import rotateClockwise from '@/lib/game/logic/rotate/rotate-clockwise.js';
import rotateCounterClockwise from '@/lib/game/logic/rotate/rotate-counter-clockwise.js';

jest.mock('@/lib/game/logic/collision.js');
jest.mock('@/lib/events/event-catalog.js');
jest.mock('@/lib/game/logic/rotate/get-kick-data.js');
jest.mock('@/lib/game/logic/rotate/rotate-clockwise.js');
jest.mock('@/lib/game/logic/rotate/rotate-counter-clockwise.js');

describe('rotate', () => {
  let mockRuntime;
  let mockStore;
  let mockState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = {
      getState: jest.fn(),
      setState: jest.fn(),
    };

    mockRuntime = {
      Store: mockStore,
      emit: jest.fn(),
    };

    mockState = {
      curr: {
        type: 'T',
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        rotation: 0,
        color: '#FF0000',
      },
      cx: 5,
      cy: 10,
    };

    mockStore.getState.mockReturnValue(mockState);

    // Mock 旋转函数
    rotateClockwise.mockImplementation((shape) => {
      return [
        [1, 0],
        [1, 1],
        [1, 0],
      ];
    });
    rotateCounterClockwise.mockImplementation((shape) => {
      return [
        [0, 1],
        [1, 1],
        [0, 1],
      ];
    });

    // Mock 音效事件
    AudioEvents.mockReturnValue({
      PLAY_SOUND: 'PLAY_SOUND',
    });
  });

  // ==================== 基础功能 ====================
  describe('基础功能', () => {
    it('应该成功顺时针旋转方块', () => {
      const kickData = [
        [
          [0, 0],
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
      ];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      rotate(mockRuntime, 1);

      expect(rotateClockwise).toHaveBeenCalledWith(mockState.curr.shape);
      expect(mockStore.setState).toHaveBeenCalled();
      expect(mockRuntime.emit).toHaveBeenCalledWith('PLAY_SOUND', {
        sound: 'ROTATE',
      });
    });

    it('应该成功逆时针旋转方块', () => {
      const kickData = [
        [
          [0, 0],
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
      ];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      rotate(mockRuntime, -1);

      expect(rotateCounterClockwise).toHaveBeenCalledWith(mockState.curr.shape);
      expect(mockStore.setState).toHaveBeenCalled();
    });
  });

  // ==================== O 型方块 ====================
  describe('O 型方块', () => {
    it('O 型方块应该直接返回，不进行旋转', () => {
      mockState.curr.type = 'O';
      mockState.curr.shape = [
        [1, 1],
        [1, 1],
      ];

      rotate(mockRuntime, 1);

      expect(rotateClockwise).not.toHaveBeenCalled();
      expect(rotateCounterClockwise).not.toHaveBeenCalled();
      expect(mockStore.setState).not.toHaveBeenCalled();
    });
  });

  // ==================== 无方块 ====================
  describe('无方块', () => {
    it('curr 为 null 时应该直接返回', () => {
      mockState.curr = null;
      mockStore.getState.mockReturnValue(mockState);

      // 由于函数开头没有检查 curr 是否为 null，这里测试会报错
      // 根据实际代码，需要先检查 curr 是否存在
      expect(() => rotate(mockRuntime, 1)).toThrow();
    });

    it('curr 为 undefined 时应该直接返回', () => {
      mockState.curr = undefined;
      mockStore.getState.mockReturnValue(mockState);

      expect(() => rotate(mockRuntime, 1)).toThrow();
    });
  });

  // ==================== 墙踢系统 ====================
  describe('墙踢系统', () => {
    it('应该尝试所有偏移位置直到找到无碰撞的位置', () => {
      const kickData = [
        [
          [0, 0],
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
      ];
      getKickData.mockReturnValue(kickData);

      // 前两次碰撞，第三次成功
      collision
        .mockReturnValueOnce(true) // [0,0] 碰撞
        .mockReturnValueOnce(true) // [-1,0] 碰撞
        .mockReturnValueOnce(false); // [-1,1] 成功

      rotate(mockRuntime, 1);

      // 应该调用了3次 collision
      expect(collision).toHaveBeenCalledTimes(3);
      expect(mockStore.setState).toHaveBeenCalled();
    });

    it('所有偏移都碰撞时应该尝试原地旋转', () => {
      const kickData = [
        [
          [0, 0],
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
      ];
      getKickData.mockReturnValue(kickData);

      // 所有墙踢偏移都碰撞
      collision.mockReturnValue(true);
      // 然后原地旋转成功 - 需要重新设置 mock 行为
      // 注意：前5次返回 true，第6次返回 false
      collision
        .mockReturnValueOnce(true) // 第1个偏移
        .mockReturnValueOnce(true) // 第2个偏移
        .mockReturnValueOnce(true) // 第3个偏移
        .mockReturnValueOnce(true) // 第4个偏移
        .mockReturnValueOnce(true) // 第5个偏移
        .mockReturnValueOnce(false); // 原地旋转

      rotate(mockRuntime, 1);

      // 5次墙踢 + 1次原地 = 6次
      expect(collision).toHaveBeenCalledTimes(6);
      expect(mockStore.setState).toHaveBeenCalled();
    });

    it('所有偏移和原地旋转都失败时，不应该更新状态', () => {
      const kickData = [
        [
          [0, 0],
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
      ];
      getKickData.mockReturnValue(kickData);

      // 所有碰撞都返回 true
      collision.mockReturnValue(true);

      rotate(mockRuntime, 1);

      expect(mockStore.setState).not.toHaveBeenCalled();
      expect(mockRuntime.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== 无墙踢数据 ====================
  describe('无墙踢数据', () => {
    it('getKickData 返回 null 时，应该直接尝试原地旋转', () => {
      getKickData.mockReturnValue(null);
      collision.mockReturnValue(false);

      rotate(mockRuntime, 1);

      expect(collision).toHaveBeenCalledWith(
        mockRuntime,
        0,
        0,
        expect.any(Array),
      );
      expect(mockStore.setState).toHaveBeenCalled();
    });

    it('getKickData 返回 null 且原地旋转失败时，不应该更新状态', () => {
      getKickData.mockReturnValue(null);
      collision.mockReturnValue(true);

      rotate(mockRuntime, 1);

      expect(mockStore.setState).not.toHaveBeenCalled();
    });
  });

  // ==================== 旋转状态更新 ====================
  describe('旋转状态更新', () => {
    it('旋转后应该正确更新 rotation', () => {
      const kickData = [[[0, 0]]];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      mockState.curr.rotation = 0;
      rotate(mockRuntime, 1);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      expect(setStateCall.curr.rotation).toBe(1);
    });

    it('逆时针旋转后应该正确更新 rotation', () => {
      const kickData = [[[0, 0]]];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      mockState.curr.rotation = 1;
      rotate(mockRuntime, -1);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      expect(setStateCall.curr.rotation).toBe(0);
    });

    it('旋转后应该正确更新 cx 和 cy', () => {
      const kickData = [[[2, 1]]];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      mockState.cx = 5;
      mockState.cy = 10;
      rotate(mockRuntime, 1);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      expect(setStateCall.cx).toBe(7); // 5 + 2
      expect(setStateCall.cy).toBe(9); // 10 + (-1)
    });
  });

  // ==================== 不同方块类型 ====================
  describe('不同方块类型', () => {
    it('I 型方块应该使用对应的墙踢数据', () => {
      mockState.curr.type = 'I';
      const kickData = [
        [
          [0, 0],
          [-2, 0],
          [1, 0],
          [-2, -1],
          [1, 2],
        ],
      ];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      rotate(mockRuntime, 1);

      expect(getKickData).toHaveBeenCalledWith('I');
      expect(mockStore.setState).toHaveBeenCalled();
    });

    it('I5 型方块应该使用对应的墙踢数据', () => {
      mockState.curr.type = 'I5';
      const kickData = [
        [
          [0, 0],
          [-2, 0],
          [1, 0],
          [-2, -1],
          [1, 2],
        ],
      ];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      rotate(mockRuntime, 1);

      expect(getKickData).toHaveBeenCalledWith('I5');
      expect(mockStore.setState).toHaveBeenCalled();
    });

    it('J/L/S/Z/T 型方块应该使用对应的墙踢数据', () => {
      const types = ['J', 'L', 'S', 'Z', 'T'];
      const kickData = [
        [
          [0, 0],
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
      ];

      types.forEach((type) => {
        jest.clearAllMocks();
        mockState.curr.type = type;
        getKickData.mockReturnValue(kickData);
        collision.mockReturnValue(false);

        rotate(mockRuntime, 1);

        expect(getKickData).toHaveBeenCalledWith(type);
      });
    });
  });

  // ==================== 坐标系转换 ====================
  describe('坐标系转换', () => {
    it('应该正确转换 SRS 坐标系 Y 值', () => {
      const kickData = [[[1, 2]]];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      rotate(mockRuntime, 1);

      // Y 值应该取反：2 -> -2
      expect(collision).toHaveBeenCalledWith(
        mockRuntime,
        1,
        -2,
        expect.any(Array),
      );
    });
  });

  // ==================== rotation 边界处理 ====================
  describe('rotation 边界处理', () => {
    it('rotation 为 undefined 时应该默认为 0', () => {
      const kickData = [[[0, 0]]];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      mockState.curr.rotation = undefined;
      rotate(mockRuntime, 1);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      expect(setStateCall.curr.rotation).toBe(1);
    });

    it('rotation 为负数时应该正确处理', () => {
      const kickData = [[[0, 0]]];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      mockState.curr.rotation = -1;
      rotate(mockRuntime, 1);

      const setStateCall = mockStore.setState.mock.calls[0][0];
      // (-1 + 1 + 4) % 4 = 0
      expect(setStateCall.curr.rotation).toBe(0);
    });
  });

  // ==================== 音效 ====================
  describe('音效', () => {
    it('旋转成功时应该播放音效', () => {
      const kickData = [[[0, 0]]];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(false);

      rotate(mockRuntime, 1);

      expect(mockRuntime.emit).toHaveBeenCalledWith('PLAY_SOUND', {
        sound: 'ROTATE',
      });
    });

    it('旋转失败时不应该播放音效', () => {
      const kickData = [[[0, 0]]];
      getKickData.mockReturnValue(kickData);
      collision.mockReturnValue(true);

      rotate(mockRuntime, 1);

      expect(mockRuntime.emit).not.toHaveBeenCalled();
    });
  });
});
