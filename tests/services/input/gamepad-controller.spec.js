/** @jest-environment jsdom */

import GamepadController from '@/lib/services/input/gamepad-controller';
import EventBus from '@/lib/core/event-bus';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

// Mock navigator.getGamepads
const createMockGamepad = (overrides = {}) => ({
  id: 'Standard Gamepad (STANDARD GAMEPAD Vendor: 054c Product: 09cc)',
  index: 0,
  connected: true,
  buttons: Array.from({ length: 16 }, () => ({
    pressed: false,
    touched: false,
    value: 0,
  })),
  axes: Array.from({ length: 10 }, () => 0),
  ...overrides,
});

describe('GamepadController', () => {
  let gp;

  beforeEach(() => {
    jest.clearAllMocks();
    gp = new GamepadController();
    gp.activeGamepad = null;
    gp.activeGamepadIndex = null;
  });

  // ========== 构造函数 ==========
  describe('constructor', () => {
    test('初始状态正确', () => {
      expect(gp.activeGamepadIndex).toBeNull();
      expect(gp.DEAD_ZONE).toBe(0.15);
      expect(gp.DPAD_THRESHOLD).toBe(0.5);
      expect(gp._eventsBound).toBe(false);
    });
  });

  // ========== _isBetop ==========
  describe('_isBetop', () => {
    test('识别北通手柄', () => {
      expect(gp._isBetop('BETOP 20bc:1263')).toBe(true);
    });

    test('标准手柄返回 false', () => {
      expect(gp._isBetop('Standard Gamepad')).toBe(false);
    });
  });

  // ========== _getAxis ==========
  describe('_getAxis', () => {
    test('无 activeGamepad 返回 0', () => {
      gp.activeGamepad = null;
      expect(gp._getAxis(0)).toBe(0);
    });

    test('轴值在死区内返回 0', () => {
      gp.activeGamepad = createMockGamepad({ axes: [0.1] });
      expect(gp._getAxis(0)).toBe(0);
    });

    test('轴值超过死区返回原值', () => {
      gp.activeGamepad = createMockGamepad({ axes: [-0.8] });
      expect(gp._getAxis(0)).toBe(-0.8);
    });
  });

  // ========== _isPressed ==========
  describe('_isPressed', () => {
    test('无 activeGamepad 返回 false', () => {
      gp.activeGamepad = null;
      expect(gp._isPressed('A')).toBe(false);
    });

    test('按钮未在映射中返回 false', () => {
      gp.activeGamepad = createMockGamepad();
      expect(gp._isPressed('NONEXISTENT')).toBe(false);
    });

    test('按钮按下但 value ≤ 0.5 时返回 false', () => {
      gp.activeGamepad = createMockGamepad();
      gp.activeGamepad.buttons[0] = { pressed: true, value: 0.3 };
      expect(gp._isPressed('A')).toBe(false);
    });

    test('按钮按下且 value > 0.5', () => {
      gp.activeGamepad = createMockGamepad();
      gp.activeGamepad.buttons[0] = { pressed: true, value: 1 };
      expect(gp._isPressed('A')).toBe(true);
    });

    test('防抖：连续两次只触发一次 true', () => {
      gp.activeGamepad = createMockGamepad();
      gp.activeGamepad.buttons[0] = { pressed: true, value: 1 };
      expect(gp._isPressed('A')).toBe(true);
      expect(gp._isPressed('A')).toBe(false);
    });

    test('松开后重置', () => {
      gp.activeGamepad = createMockGamepad();
      gp.activeGamepad.buttons[0] = { pressed: true, value: 1 };
      gp._isPressed('A');
      // 模拟松开
      gp.activeGamepad.buttons[0] = { pressed: false, value: 0 };
      gp._isPressed('A');
      // 再次按下
      gp.activeGamepad.buttons[0] = { pressed: true, value: 1 };
      expect(gp._isPressed('A')).toBe(true);
    });
  });

  // ========== _refreshGamepadState ==========
  describe('_refreshGamepadState', () => {
    test('没有手柄时保持 null', () => {
      navigator.getGamepads = jest.fn(() => []);
      gp._refreshGamepadState();
      expect(gp.activeGamepad).toBeNull();
    });

    test('自动选择第一个手柄', () => {
      const pad = createMockGamepad();
      navigator.getGamepads = jest.fn(() => [pad]);
      gp._refreshGamepadState();
      expect(gp.activeGamepadIndex).toBe(0);
      expect(gp.activeGamepad).not.toBeNull();
    });

    test('自动识别北通手柄', () => {
      const pad = createMockGamepad({ id: 'BETOP 20bc:1263' });
      navigator.getGamepads = jest.fn(() => [pad]);
      gp._refreshGamepadState();
      expect(gp.activeGamepadIndex).toBe(0);
    });
  });

  // ========== _onConnect ==========
  describe('_onConnect', () => {
    test('设置 activeGamepadIndex', () => {
      const pad = createMockGamepad();
      gp._onConnect({ gamepad: pad });
      expect(gp.activeGamepadIndex).toBe(0);
    });

    test('已连接时不重复设置', () => {
      const pad1 = createMockGamepad({ index: 0 });
      const pad2 = createMockGamepad({ index: 1 });
      gp._onConnect({ gamepad: pad1 });
      gp._onConnect({ gamepad: pad2 });
      expect(gp.activeGamepadIndex).toBe(0);
    });

    test('发射 game:update:gamepad:connected', () => {
      const pad = createMockGamepad();
      gp._onConnect({ gamepad: pad });
      expect(EventBus.emit).toHaveBeenCalledWith(
        'game:update:gamepad:connected',
        { connected: true },
      );
    });
  });

  // ========== _onDisconnect ==========
  describe('_onDisconnect', () => {
    test('断开当前手柄时清空状态', () => {
      gp.activeGamepadIndex = 0;
      gp._onDisconnect({ gamepad: { index: 0 } });
      expect(gp.activeGamepadIndex).toBeNull();
    });

    test('非当前手柄断开不影响', () => {
      gp.activeGamepadIndex = 0;
      gp._onDisconnect({ gamepad: { index: 1 } });
      expect(gp.activeGamepadIndex).toBe(0);
    });

    test('发射 game:update:gamepad:connected false', () => {
      gp.activeGamepadIndex = 0;
      gp._onDisconnect({ gamepad: { index: 0 } });
      expect(EventBus.emit).toHaveBeenCalledWith(
        'game:update:gamepad:connected',
        { connected: false },
      );
    });
  });

  // ========== _startAxisAction / _stopAxisAction ==========
  describe('摇杆动作', () => {
    test('_startAxisAction 只触发一次', () => {
      gp._startAxisAction('MOVE_LEFT');
      gp._startAxisAction('MOVE_LEFT');
      expect(EventBus.emit).toHaveBeenCalledTimes(1);
    });

    test('_stopAxisAction 后可以重新触发', () => {
      gp._startAxisAction('MOVE_LEFT');
      gp._stopAxisAction('MOVE_LEFT');
      gp._startAxisAction('MOVE_LEFT');
      expect(EventBus.emit).toHaveBeenCalledTimes(2);
    });
  });

  // ========== _handleStickMove ==========
  describe('_handleStickMove', () => {
    test('左摇杆向左触发 MOVE_LEFT', () => {
      gp.activeGamepad = createMockGamepad();
      gp._handleStickMove(-0.9, 0);
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_LEFT',
        payload: {},
      });
    });

    test('左摇杆向右触发 MOVE_RIGHT', () => {
      gp.activeGamepad = createMockGamepad();
      gp._handleStickMove(0.9, 0);
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_RIGHT',
        payload: {},
      });
    });

    test('左摇杆向上触发 ROTATE', () => {
      gp.activeGamepad = createMockGamepad();
      gp._handleStickMove(0, -0.9);
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'ROTATE',
        payload: {},
      });
    });

    test('左摇杆向下触发 MOVE_DOWN', () => {
      gp.activeGamepad = createMockGamepad();
      gp._handleStickMove(0, 0.9);
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_DOWN',
        payload: {},
      });
    });
  });

  // ========== _resolveAction ==========
  describe('_resolveAction', () => {
    test('非 DPad 直接返回原 action', () => {
      const result = gp._resolveAction('DROP', 'B', false, 'playing', 1, 0);
      expect(result).toBe('DROP');
    });

    test('非 main-menu 模式直接返回', () => {
      const result = gp._resolveAction(
        'ROTATE',
        'DPAD_UP',
        true,
        'playing',
        1,
        Date.now(),
      );
      expect(result).toBe('ROTATE');
    });

    test('main-menu DPAD_UP 返回 LEVEL 动作', () => {
      const result = gp._resolveAction(
        'ROTATE',
        'DPAD_UP',
        true,
        'main-menu',
        1,
        Date.now(),
      );
      expect(result).toBe('LEVEL_TWO');
    });

    test('main-menu DPAD_DOWN 降低等级', () => {
      const result = gp._resolveAction(
        'MOVE_DOWN',
        'DPAD_DOWN',
        true,
        'main-menu',
        3,
        Date.now(),
      );
      expect(result).toBe('LEVEL_TWO');
    });

    test('冷却期内返回空字符串', () => {
      const now = Date.now();
      gp._resolveAction('ROTATE', 'DPAD_UP', true, 'main-menu', 1, now);
      const result = gp._resolveAction(
        'ROTATE',
        'DPAD_UP',
        true,
        'main-menu',
        1,
        now + 50,
      );
      expect(result).toBe('');
    });
  });

  // ========== _handleStandardButtons ==========
  describe('_handleStandardButtons', () => {
    test('replay 模式只允许 START', () => {
      const pad = createMockGamepad();
      gp.activeGamepad = pad;

      // Mock _isPressed 让 B 返回 true
      jest.spyOn(gp, '_isPressed').mockImplementation((name) => name === 'B');

      gp._handleStandardButtons(pad, 'replay', 1, Date.now());
      expect(EventBus.emit).not.toHaveBeenCalled();
    });

    test('game-over 模式只允许 START', () => {
      const pad = createMockGamepad();
      gp.activeGamepad = pad;

      jest
        .spyOn(gp, '_isPressed')
        .mockImplementation((name) => name === 'START');

      gp._handleStandardButtons(pad, 'game-over', 1, Date.now());
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'CONFIRM',
        payload: {},
      });
    });
  });

  // ========== addEventListeners / removeEventListeners ==========
  describe('事件绑定', () => {
    test('addEventListeners 绑定事件', () => {
      const spy = jest.spyOn(globalThis, 'addEventListener');
      gp.addEventListeners();
      expect(spy).toHaveBeenCalledWith('gamepadconnected', gp._onConnect);
      expect(spy).toHaveBeenCalledWith('gamepaddisconnected', gp._onDisconnect);
    });

    test('重复绑定只执行一次', () => {
      const spy = jest.spyOn(globalThis, 'addEventListener');
      gp.addEventListeners();
      gp.addEventListeners();
      expect(spy).toHaveBeenCalledTimes(2); // 每次绑两个事件，但第二次直接 return
    });

    test('removeEventListeners 解绑', () => {
      const spy = jest.spyOn(globalThis, 'removeEventListener');
      gp.removeEventListeners();
      expect(spy).toHaveBeenCalledWith('gamepadconnected', gp._onConnect);
      expect(spy).toHaveBeenCalledWith('gamepaddisconnected', gp._onDisconnect);
    });

    test('链式调用', () => {
      expect(gp.addEventListeners()).toBe(gp);
      expect(gp.removeEventListeners()).toBe(gp);
    });
  });

  // ========== update ==========
  describe('update', () => {
    test('无 activeGamepad 时直接返回', () => {
      gp.activeGamepad = null;
      const result = gp.update({ mode: 'playing', level: 1 });
      expect(result).toBe(gp);
    });

    test('playing 模式下处理输入', () => {
      const pad = createMockGamepad();
      gp.activeGamepad = pad;
      gp.activeGamepadIndex = 0;
      navigator.getGamepads = jest.fn(() => [pad]);

      jest.spyOn(gp, '_isPressed').mockImplementation((name) => name === 'A');
      jest.spyOn(gp, '_getAxis').mockReturnValue(0);

      gp.update({ mode: 'playing', level: 1 });

      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'TOGGLE_MUSIC',
        payload: {},
      });
    });

    test('replay 模式不处理摇杆和 DPAD', () => {
      const pad = createMockGamepad({ axes: [-0.9, 0] });
      gp.activeGamepad = pad;
      gp.activeGamepadIndex = 0;
      navigator.getGamepads = jest.fn(() => [pad]);

      jest.spyOn(gp, '_isPressed').mockReturnValue(false);
      jest.spyOn(gp, '_getAxis').mockReturnValue(0);

      gp.update({ mode: 'replay', level: 1 });
      expect(EventBus.emit).not.toHaveBeenCalled();
    });
  });

  // ========== BETOP DPAD（axis9） ==========
  describe('_handleBetopDpad', () => {
    let pad;

    beforeEach(() => {
      pad = createMockGamepad({
        id: 'BETOP 20bc:1263',
      });
      gp.activeGamepad = pad;
      gp.activeGamepadIndex = 0;
    });

    test('上方向 (-1.00000)', () => {
      gp._handleBetopDpad(-1, { mode: 'playing', level: 1 });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'ROTATE',
        payload: {},
      });
    });

    test('下方向 (0.14286)', () => {
      gp._handleBetopDpad(0.14286, { mode: 'playing', level: 1 });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_DOWN',
        payload: {},
      });
    });

    test('左方向 (0.71429)', () => {
      gp._handleBetopDpad(0.71429, { mode: 'playing', level: 1 });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_LEFT',
        payload: {},
      });
    });

    test('右方向 (-0.42857)', () => {
      gp._handleBetopDpad(-0.42857, { mode: 'playing', level: 1 });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_RIGHT',
        payload: {},
      });
    });

    test('main-menu 上方向触发等级变化', () => {
      gp._handleBetopDpad(-1, { mode: 'main-menu', level: 1 });
      expect(EventBus.emit).toHaveBeenCalledWith('game:update:level', {
        level: 2,
      });
      expect(EventBus.emit).toHaveBeenLastCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'LEVEL_TWO',
        payload: {},
      });
    });

    test('main-menu 下方向触发等级变化', () => {
      gp._handleBetopDpad(0.14286, { mode: 'main-menu', level: 5 });
      expect(EventBus.emit).toHaveBeenCalledWith('game:update:level', {
        level: 4,
      });
      expect(EventBus.emit).toHaveBeenLastCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'LEVEL_FOUR',
        payload: {},
      });
    });

    test('main-menu 等级上限为 10', () => {
      gp._handleBetopDpad(-1, { mode: 'main-menu', level: 10 });
      expect(EventBus.emit).toHaveBeenCalledWith('game:update:level', {
        level: 10,
      });
      expect(EventBus.emit).toHaveBeenLastCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'LEVEL_TEN',
        payload: {},
      });
    });

    test('main-menu 等级下限为 1', () => {
      gp._handleBetopDpad(0.14286, { mode: 'main-menu', level: 1 });
      expect(EventBus.emit).toHaveBeenCalledWith('game:update:level', {
        level: 1,
      });
      expect(EventBus.emit).toHaveBeenLastCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'LEVEL_ONE',
        payload: {},
      });
    });

    test('main-menu 冷却期内不触发', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      gp._handleBetopDpad(-1, { mode: 'main-menu', level: 1 });
      const callCount = EventBus.emit.mock.calls.length;

      // 100ms 后再次触发（冷却期 180ms 内）
      jest.spyOn(Date, 'now').mockReturnValue(now + 100);
      gp._handleBetopDpad(-1, { mode: 'main-menu', level: 2 });

      expect(EventBus.emit).toHaveBeenCalledTimes(callCount);
      Date.now.mockRestore();
    });

    test('松开时（非标准值）重置所有方向状态', () => {
      // 先触发一个方向
      gp._handleBetopDpad(-1, { mode: 'playing', level: 1 });
      expect(gp.dpadAxisState.up).toBe(true);

      // 松手
      gp._handleBetopDpad(0.5, { mode: 'playing', level: 1 });
      expect(gp.dpadAxisState.up).toBe(false);
      expect(gp.dpadAxisState.down).toBe(false);
      expect(gp.dpadAxisState.left).toBe(false);
      expect(gp.dpadAxisState.right).toBe(false);
    });

    test('方向切换时重置其他方向', () => {
      // 先按上
      gp._handleBetopDpad(-1, { mode: 'playing', level: 1 });
      expect(gp.dpadAxisState.up).toBe(true);

      // 再按左
      gp._handleBetopDpad(0.71429, { mode: 'playing', level: 1 });
      expect(gp.dpadAxisState.up).toBe(false);
      expect(gp.dpadAxisState.down).toBe(false);
      expect(gp.dpadAxisState.right).toBe(false);
      expect(gp.dpadAxisState.left).toBe(true);
    });

    test('按住不放不会重复触发', () => {
      gp._handleBetopDpad(-1, { mode: 'playing', level: 1 });
      const callCount = EventBus.emit.mock.calls.length;

      // 再次相同方向
      gp._handleBetopDpad(-1, { mode: 'playing', level: 1 });
      expect(EventBus.emit).toHaveBeenCalledTimes(callCount);
    });
  });

  // ========== _getMoveUpAction / _getMoveDownAction ==========
  describe('等级切换', () => {
    test('_getMoveUpAction 在非 main-menu 返回 ROTATE', () => {
      const result = gp._getMoveUpAction('playing', 1);
      expect(result).toBe('ROTATE');
    });

    test('_getMoveDownAction 在非 main-menu 返回 MOVE_DOWN', () => {
      const result = gp._getMoveDownAction('playing', 1);
      expect(result).toBe('MOVE_DOWN');
    });

    test('_getMoveUpAction 在 main-menu 返回 LEVEL_TWO', () => {
      const result = gp._getMoveUpAction('main-menu', 1);
      expect(result).toBe('LEVEL_TWO');
    });

    test('_getMoveUpAction level 10 上限', () => {
      const result = gp._getMoveUpAction('main-menu', 10);
      expect(result).toBe('LEVEL_TEN');
      expect(EventBus.emit).toHaveBeenCalledWith('game:update:level', {
        level: 10,
      });
    });

    test('_getMoveDownAction level 1 下限', () => {
      const result = gp._getMoveDownAction('main-menu', 1);
      expect(result).toBe('LEVEL_ONE');
      expect(EventBus.emit).toHaveBeenCalledWith('game:update:level', {
        level: 1,
      });
    });
  });
});
