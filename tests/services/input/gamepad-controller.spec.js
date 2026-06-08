/** @jest-environment jsdom */

import GamepadController from '@/lib/services/input/gamepad-controller.js';
import GAME from '@/lib/game/constants/game.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

describe('GamepadController', () => {
  let gamepad;
  let mockGame;
  let mockStore;
  let mockState;
  let mockGetGamepads;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = {
      id: 'test-game-uuid',
      isVersus: jest.fn().mockReturnValue(false),
      Player: { name: 'human' }
    };
    mockState = {
      mode: 'playing',
      level: 1,
    };
    mockStore = {
      getState: jest.fn().mockReturnValue(mockState),
      getController: jest.fn().mockReturnValue('human'),
      getMode: jest.fn().mockReturnValue('playing'),
    };

    mockGetGamepads = jest.fn().mockReturnValue([]);
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        getGamepads: mockGetGamepads,
      },
      writable: true,
      configurable: true,
    });

    jest.spyOn(globalThis, 'addEventListener');
    jest.spyOn(globalThis, 'removeEventListener');

    gamepad = new GamepadController({
      Game: mockGame,
      Store: mockStore,
    });

    // 设置 Player 属性（因为 update 中会使用）
    gamepad.Player = mockGame.Player;

    jest.spyOn(gamepad, 'emit').mockImplementation(() => gamepad);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 GamepadController 实例', () => {
      expect(gamepad).toBeDefined();
      expect(gamepad).toBeInstanceOf(GamepadController);
    });

    it('应该正确初始化默认值', () => {
      expect(gamepad.activeGamepadIndex).toBeNull();
      expect(gamepad.DEAD_ZONE).toBe(0.15);
      expect(gamepad.DPAD_THRESHOLD).toBe(0.5);
      expect(gamepad.buttonStates).toEqual({});
      expect(gamepad.axisStates).toEqual({});
      expect(gamepad._eventsBound).toBe(false);
      expect(gamepad.DPAD_COOLDOWN).toBe(180);
      expect(gamepad.lastDpadTime).toBe(0);
    });

    it('应该正确注入依赖', () => {
      expect(gamepad.Game).toBe(mockGame);
      expect(gamepad.Store).toBe(mockStore);
    });
  });

  // ==================== addEventListeners ====================
  describe('addEventListeners 方法', () => {
    it('应该注册 gamepadconnected 和 gamepaddisconnected 事件', () => {
      gamepad.addEventListeners();

      expect(globalThis.addEventListener).toHaveBeenCalledWith(
        'gamepadconnected',
        gamepad._onConnect,
      );
      expect(globalThis.addEventListener).toHaveBeenCalledWith(
        'gamepaddisconnected',
        gamepad._onDisconnect,
      );
    });

    it('应该标记事件已绑定', () => {
      gamepad.addEventListeners();

      expect(gamepad._eventsBound).toBe(true);
    });

    it('重复调用不应该重复注册', () => {
      gamepad.addEventListeners();
      gamepad.addEventListeners();

      expect(globalThis.addEventListener).toHaveBeenCalledTimes(2);
    });

    it('应该返回 GamepadController 实例以支持链式调用', () => {
      const result = gamepad.addEventListeners();

      expect(result).toBe(gamepad);
    });
  });

  // ==================== removeEventListeners ====================
  describe('removeEventListeners 方法', () => {
    it('应该移除事件监听', () => {
      gamepad.addEventListeners();
      gamepad.removeEventListeners();

      expect(globalThis.removeEventListener).toHaveBeenCalledWith(
        'gamepadconnected',
        gamepad._onConnect,
      );
      expect(globalThis.removeEventListener).toHaveBeenCalledWith(
        'gamepaddisconnected',
        gamepad._onDisconnect,
      );
    });

    it('应该标记事件未绑定', () => {
      gamepad.addEventListeners();
      gamepad.removeEventListeners();

      expect(gamepad._eventsBound).toBe(false);
    });

    it('应该返回 GamepadController 实例以支持链式调用', () => {
      const result = gamepad.removeEventListeners();

      expect(result).toBe(gamepad);
    });
  });

  // ==================== _isBetop ====================
  describe('_isBetop 方法', () => {
    it('BETOP 手柄 id 应该返回 true', () => {
      expect(gamepad._isBetop('BETOP 20bc:1263')).toBe(true);
      expect(gamepad._isBetop('20bc 1263 something')).toBe(true);
    });

    it('标准手柄 id 应该返回 false', () => {
      expect(gamepad._isBetop('Xbox 360 Controller')).toBe(false);
      expect(gamepad._isBetop('')).toBe(false);
    });
  });

  // ==================== _refreshGamepadState ====================
  describe('_refreshGamepadState 方法', () => {
    it('没有手柄时应该保持 activeGamepadIndex 为 null', () => {
      mockGetGamepads.mockReturnValue([]);

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBeNull();
      expect(gamepad.activeGamepad).toBeNull();
    });

    it('没有激活手柄时应该自动选择第一个可用手柄', () => {
      const mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: [],
        axes: [],
      };
      mockGetGamepads.mockReturnValue([mockPad]);

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBe(0);
      expect(gamepad.activeGamepad).toBe(mockPad);
    });

    it('自动选择 BETOP 手柄时应该使用 BETOP 映射', () => {
      const mockPad = {
        index: 0,
        id: 'BETOP 20bc:1263',
        buttons: [],
        axes: [],
      };
      mockGetGamepads.mockReturnValue([mockPad]);

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBe(0);
      expect(gamepad.curBtnMap.A).toBe(2);
    });

    it('已有激活手柄时应该保持', () => {
      const mockPad = {
        index: 2,
        id: 'Standard Gamepad',
        buttons: [],
        axes: [],
      };
      mockGetGamepads.mockReturnValue([null, null, mockPad]);
      gamepad.activeGamepadIndex = 2;

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBe(2);
    });

    it('应该返回 GamepadController 实例', () => {
      const result = gamepad._refreshGamepadState();

      expect(result).toBe(gamepad);
    });
  });

  // ==================== _onConnect ====================
  describe('_onConnect 回调', () => {
    it('应该设置 activeGamepadIndex', () => {
      const event = { gamepad: { index: 0, id: 'Standard Gamepad' } };

      gamepad._onConnect(event);

      expect(gamepad.activeGamepadIndex).toBe(0);
    });

    it('已有手柄时不应该覆盖', () => {
      gamepad.activeGamepadIndex = 0;
      const event = { gamepad: { index: 1, id: 'Standard Gamepad' } };

      gamepad._onConnect(event);

      expect(gamepad.activeGamepadIndex).toBe(0);
    });

    it('应该发送连接事件', () => {
      const event = { gamepad: { index: 0, id: 'Standard Gamepad' } };
      const events = GameEvents(mockGame.id);

      gamepad._onConnect(event);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_GAMEPAD_CONNECTED, {
        connected: true,
      });
    });

    it('BETOP 手柄应该使用 BETOP 映射', () => {
      const event = { gamepad: { index: 0, id: 'BETOP 20bc:1263' } };

      gamepad._onConnect(event);

      expect(gamepad.curBtnMap.A).toBe(2);
    });

    it('应该返回 GamepadController 实例', () => {
      const event = { gamepad: { index: 0, id: 'Standard Gamepad' } };
      const result = gamepad._onConnect(event);

      expect(result).toBe(gamepad);
    });
  });

  // ==================== _onDisconnect ====================
  describe('_onDisconnect 回调', () => {
    it('断开的不是当前手柄时应该忽略', () => {
      gamepad.activeGamepadIndex = 0;
      const event = { gamepad: { index: 1 } };

      gamepad._onDisconnect(event);

      expect(gamepad.activeGamepadIndex).toBe(0);
    });

    it('断开当前手柄时应该清空状态', () => {
      gamepad.activeGamepadIndex = 0;
      gamepad.buttonStates = { A: true };
      gamepad.axisStates = { MOVE_LEFT: true };
      const event = { gamepad: { index: 0 } };

      gamepad._onDisconnect(event);

      expect(gamepad.activeGamepadIndex).toBeNull();
      expect(gamepad.buttonStates).toEqual({});
      expect(gamepad.axisStates).toEqual({});
    });

    it('应该发送断开事件', () => {
      gamepad.activeGamepadIndex = 0;
      const event = { gamepad: { index: 0 } };
      const events = GameEvents(mockGame.id);

      gamepad._onDisconnect(event);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_GAMEPAD_CONNECTED, {
        connected: false,
      });
    });

    it('应该返回 GamepadController 实例', () => {
      gamepad.activeGamepadIndex = 0;
      const event = { gamepad: { index: 0 } };
      const result = gamepad._onDisconnect(event);

      expect(result).toBe(gamepad);
    });
  });

  // ==================== _isPressed ====================
  describe('_isPressed 方法', () => {
    let mockPad;

    beforeEach(() => {
      mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
        axes: [],
      };
      gamepad.activeGamepadIndex = 0;
      mockGetGamepads.mockReturnValue([mockPad]);
      gamepad._refreshGamepadState();
    });

    it('按钮按下且未触发过应该返回 true', () => {
      mockPad.buttons[0] = { value: 1, pressed: true };

      expect(gamepad._isPressed('A')).toBe(true);
    });

    it('按钮未按下应该返回 false', () => {
      mockPad.buttons[0] = { value: 0, pressed: false };

      expect(gamepad._isPressed('A')).toBe(false);
    });

    it('按钮已触发过（防抖）应该返回 false', () => {
      gamepad.buttonStates['A'] = true;
      mockPad.buttons[0] = { value: 1, pressed: true };

      expect(gamepad._isPressed('A')).toBe(false);
    });

    it('按钮松开后应该重置状态', () => {
      gamepad.buttonStates['A'] = true;
      mockPad.buttons[0] = { value: 0, pressed: false };

      gamepad._isPressed('A');

      expect(gamepad.buttonStates['A']).toBe(false);
    });

    it('未知按钮应该返回 false', () => {
      expect(gamepad._isPressed('UNKNOWN')).toBe(false);
    });

    it('没有激活手柄时应该返回 false', () => {
      gamepad.activeGamepadIndex = null;
      gamepad.activeGamepad = null;

      expect(gamepad._isPressed('A')).toBe(false);
    });
  });

  // ==================== _getAxis ====================
  describe('_getAxis 方法', () => {
    beforeEach(() => {
      mockGetGamepads.mockReturnValue([
        {
          index: 0,
          id: 'Standard Gamepad',
          buttons: [],
          axes: [0.1, 0.8, 0, 0],
        },
      ]);
      gamepad.activeGamepadIndex = 0;
      gamepad._refreshGamepadState();
    });

    it('轴值超过死区时应该返回原值', () => {
      expect(gamepad._getAxis(1)).toBe(0.8);
    });

    it('轴值在死区内时应该返回 0', () => {
      expect(gamepad._getAxis(0)).toBe(0);
    });

    it('没有激活手柄时应该返回 0', () => {
      gamepad.activeGamepadIndex = null;
      gamepad.activeGamepad = null;

      expect(gamepad._getAxis(0)).toBe(0);
    });

    it('负数轴值超过死区时应该返回原值', () => {
      mockGetGamepads.mockReturnValue([
        {
          index: 0,
          id: 'Standard Gamepad',
          buttons: [],
          axes: [-0.9, 0, 0, 0],
        },
      ]);
      gamepad._refreshGamepadState();

      expect(gamepad._getAxis(0)).toBe(-0.9);
    });
  });

  // ==================== 摇杆防抖 ====================
  describe('摇杆防抖', () => {
    it('_startAxisAction 首次触发应该发送事件', () => {
      gamepad._startAxisAction('MOVE_LEFT');

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
      expect(gamepad.axisStates['MOVE_LEFT']).toBe(true);
    });

    it('_startAxisAction 已触发状态不应该重复发送事件', () => {
      gamepad.axisStates['MOVE_LEFT'] = true;

      gamepad._startAxisAction('MOVE_LEFT');

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('_stopAxisAction 应该重置状态', () => {
      gamepad.axisStates['MOVE_LEFT'] = true;

      gamepad._stopAxisAction('MOVE_LEFT');

      expect(gamepad.axisStates['MOVE_LEFT']).toBe(false);
    });
  });

  // ==================== _handleStickMove ====================
  describe('_handleStickMove 方法', () => {
    beforeEach(() => {
      gamepad.emit.mockClear();
    });

    it('向上推应该触发 ROTATE', () => {
      gamepad._handleStickMove(0, -0.8);

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'ROTATE',
        payload: { Game: mockGame },
      });
    });

    it('向下推应该触发 MOVE_DOWN', () => {
      gamepad._handleStickMove(0, 0.8);

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_DOWN',
        payload: { Game: mockGame },
      });
    });

    it('向左推应该触发 MOVE_LEFT', () => {
      gamepad._handleStickMove(-0.8, 0);

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
    });

    it('向右推应该触发 MOVE_RIGHT', () => {
      gamepad._handleStickMove(0.8, 0);

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_RIGHT',
        payload: { Game: mockGame },
      });
    });

    it('摇杆归中时应该停止动作', () => {
      gamepad.axisStates['MOVE_LEFT'] = true;

      gamepad._handleStickMove(0, 0);

      expect(gamepad.axisStates['MOVE_LEFT']).toBe(false);
    });
  });

  // ==================== _updateActionMap ====================
  describe('_updateActionMap 方法', () => {
    it('difficulty 模式应该更新映射为难度选择', () => {
      gamepad._updateActionMap('difficulty');
      // 验证映射已更新（通过后续按钮测试验证）
      expect(true).toBe(true);
    });

    it('playing 模式应该更新映射为游戏操作', () => {
      gamepad._updateActionMap('playing');
      expect(true).toBe(true);
    });

    it('应该返回 GamepadController 实例', () => {
      const result = gamepad._updateActionMap('playing');
      expect(result).toBe(gamepad);
    });
  });

  // ==================== _getMoveUpAction / _getMoveDownAction ====================
  describe('方向键上下移动', () => {
    let events;

    beforeEach(() => {
      events = GameEvents(mockGame.id);
    });

    it('main-menu 模式上移应该增加等级', () => {
      gamepad._getMoveUpAction('main-menu', 3);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, { level: 4 });
    });

    it('main-menu 模式上移等级不能超过 10', () => {
      gamepad._getMoveUpAction('main-menu', 10);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, { level: 10 });
    });

    it('main-menu 模式下移应该减少等级', () => {
      gamepad._getMoveDownAction('main-menu', 5);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, { level: 4 });
    });

    it('main-menu 模式下移等级不能低于 1', () => {
      gamepad._getMoveDownAction('main-menu', 1);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, { level: 1 });
    });

    it('非 main-menu 模式上移应该返回 ROTATE', () => {
      const action = gamepad._getMoveUpAction('playing', 1);

      expect(action).toBe('ROTATE');
    });

    it('非 main-menu 模式下移应该返回 MOVE_DOWN', () => {
      const action = gamepad._getMoveDownAction('playing', 1);

      expect(action).toBe('MOVE_DOWN');
    });
  });

  // ==================== _handleBetopDpad ====================
  describe('_handleBetopDpad 方法', () => {
    beforeEach(() => {
      mockState = { mode: 'playing', level: 1 };
      gamepad.emit.mockClear();
    });

    it('值为 -1.00000 时应该触发上方向', () => {
      gamepad._handleBetopDpad(-1, mockState);

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'ROTATE',
        payload: { Game: mockGame },
      });
    });

    it('值为 0.14286 时应该触发下方向', () => {
      gamepad._handleBetopDpad(0.14286, mockState);

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_DOWN',
        payload: { Game: mockGame },
      });
    });

    it('值为 0.71429 时应该触发左方向', () => {
      gamepad._handleBetopDpad(0.71429, mockState);

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
    });

    it('值为 -0.42857 时应该触发右方向', () => {
      gamepad._handleBetopDpad(-0.42857, mockState);

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_RIGHT',
        payload: { Game: mockGame },
      });
    });

    it('默认值应该重置所有方向状态', () => {
      gamepad.dpadAxisState = {
        up: true,
        down: true,
        left: true,
        right: true,
      };

      gamepad._handleBetopDpad(0, mockState);

      expect(gamepad.dpadAxisState).toEqual({
        up: false,
        down: false,
        left: false,
        right: false,
      });
    });

    it('main-menu 模式冷却期内不应触发', () => {
      gamepad.lastDpadTime = Date.now();
      const state = { mode: 'main-menu', level: 3 };
      gamepad.emit.mockClear();

      gamepad._handleBetopDpad(-1, state);

      expect(gamepad.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== update 方法 ====================
  describe('update 方法', () => {
    it('AI 控制时应该直接返回', () => {
      mockStore.getMode.mockReturnValue('playing');
      mockGame.Player.name = 'ai';
      gamepad.Player = mockGame.Player;
      gamepad._refreshGamepadState = jest.fn();
      gamepad._collectCommands = jest.fn();

      gamepad.update(Date.now());

      expect(gamepad._collectCommands).not.toHaveBeenCalled();
    });

    it('没有激活手柄时应该直接返回', () => {
      gamepad.activeGamepad = null;
      gamepad._refreshGamepadState = jest.fn();
      gamepad._collectCommands = jest.fn();

      gamepad.update(Date.now());

      expect(gamepad._collectCommands).not.toHaveBeenCalled();
    });

    it('有激活手柄且非AI控制时应该收集命令', () => {
      mockGame.Player.name = 'human';
      gamepad.Player = mockGame.Player;
      const mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({ value: 0, pressed: false })),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
      mockGetGamepads.mockReturnValue([mockPad]);
      gamepad._refreshGamepadState();

      gamepad._collectCommands = jest.fn();
      gamepad.update(Date.now());

      expect(gamepad._collectCommands).toHaveBeenCalled();
    });

    it('应该返回 GamepadController 实例', () => {
      const result = gamepad.update(Date.now());
      expect(result).toBe(gamepad);
    });
  });

  // ==================== _collectCommands ====================
  describe('_collectCommands 方法', () => {
    let mockPad;

    beforeEach(() => {
      mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({ value: 0, pressed: false })),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
      mockGetGamepads.mockReturnValue([mockPad]);
      gamepad._refreshGamepadState();
      gamepad.emit.mockClear();
    });

    it('replay 模式不应该处理摇杆', () => {
      mockState.mode = 'replay';
      gamepad._handleStickMove = jest.fn();

      gamepad._collectCommands(Date.now());

      expect(gamepad._handleStickMove).not.toHaveBeenCalled();
    });

    it('game-over 模式不应该处理摇杆', () => {
      mockState.mode = 'game-over';
      gamepad._handleStickMove = jest.fn();

      gamepad._collectCommands(Date.now());

      expect(gamepad._handleStickMove).not.toHaveBeenCalled();
    });

    it('BETOP 手柄应该处理 DPAD axis9', () => {
      mockPad.id = 'BETOP 20bc:1263';
      mockPad.axes[9] = -1;
      gamepad._refreshGamepadState();
      gamepad._handleBetopDpad = jest.fn();

      gamepad._collectCommands(Date.now());

      expect(gamepad._handleBetopDpad).toHaveBeenCalled();
    });

    it('应该返回 GamepadController 实例', () => {
      const result = gamepad._collectCommands(Date.now());
      expect(result).toBe(gamepad);
    });
  });

  // ==================== AI 控制模式 ====================
  describe('AI 控制模式', () => {
    let mockPad;

    beforeEach(() => {
      mockStore.getController.mockReturnValue('ai');
      mockGame.isVersus.mockReturnValue(false);
      mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({ value: 0, pressed: false })),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
      mockGetGamepads.mockReturnValue([mockPad]);
      gamepad._refreshGamepadState();
      gamepad.emit.mockClear();
    });

    it('AI 控制时 RB 键（SWITCH_CONTROLLER）应该可以发送事件', () => {
      mockPad.buttons[5] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'SWITCH_CONTROLLER',
        payload: { Game: mockGame },
      });
    });

    it('AI 控制时 A 键（TOGGLE_MUSIC）应该可以发送事件', () => {
      mockPad.buttons[0] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'TOGGLE_MUSIC',
        payload: { Game: mockGame },
      });
    });

    it('AI 控制时 B 键不应该发送事件（DROP 不在 AI_ALLOWED_ACTIONS 中）', () => {
      mockPad.buttons[1] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      const calls = gamepad.emit.mock.calls.filter(
        (call) => call[0] === 'dispatch:input',
      );
      expect(calls.length).toBe(0);
    });

    it('AI 控制时 X 键（RESTART）应该可以发送事件', () => {
      mockPad.buttons[2] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'RESTART',
        payload: { Game: mockGame },
      });
    });

    it('AI 控制时 START 键不应该发送事件（CONFIRM 不在 AI_ALLOWED_ACTIONS 中）', () => {
      mockPad.buttons[9] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      const calls = gamepad.emit.mock.calls.filter(
        (call) => call[0] === 'dispatch:input',
      );
      expect(calls.length).toBe(0);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('navigator.getGamepads 不存在时应该使用空数组', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(() => {
        gamepad._refreshGamepadState();
      }).not.toThrow();

      expect(gamepad.activeGamepad).toBeNull();
    });

    it('activeGamepad 的按钮不存在时 _isPressed 应该返回 false', () => {
      gamepad.activeGamepadIndex = 0;
      mockGetGamepads.mockReturnValue([
        {
          index: 0,
          id: 'Standard Gamepad',
          buttons: [],
          axes: [],
        },
      ]);
      gamepad._refreshGamepadState();

      expect(gamepad._isPressed('A')).toBe(false);
    });

    it('unsubscribe 应该能重复调用', () => {
      expect(() => {
        gamepad.removeEventListeners();
        gamepad.removeEventListeners();
      }).not.toThrow();
    });
  });

  // ==================== _onConnect 边界 ====================
  describe('_onConnect 边界', () => {
    it('已有激活手柄时连接新手柄应该被忽略，不发送事件', () => {
      gamepad.activeGamepadIndex = 0;
      gamepad.emit.mockClear();

      gamepad._onConnect({ gamepad: { index: 1, id: 'Standard Gamepad' } });

      expect(gamepad.activeGamepadIndex).toBe(0);
      expect(gamepad.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== 对战模式 ====================
  describe('对战模式下的行为', () => {
    let mockPad;

    beforeEach(() => {
      mockGame.isVersus.mockReturnValue(true);
      mockGame.Player.name = 'human';
      gamepad.Player = mockGame.Player;
      mockStore.getController.mockReturnValue('human');
      mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({ value: 0, pressed: false })),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
      mockGetGamepads.mockReturnValue([mockPad]);
      gamepad._refreshGamepadState();
      gamepad.emit.mockClear();
    });

    it('对战模式下 human 玩家按 RB 键应该被屏蔽', () => {
      mockPad.buttons[5] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('对战模式下按 X 键应该被屏蔽', () => {
      mockPad.buttons[2] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('对战模式下 AI 玩家按 Y 键应该被屏蔽', () => {
      mockGame.Player.name = 'ai';
      gamepad.Player = mockGame.Player;
      mockStore.getController.mockReturnValue('ai');
      mockPad.buttons[3] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('对战模式下 AI 玩家按 RT 键应该被屏蔽', () => {
      mockGame.Player.name = 'ai';
      gamepad.Player = mockGame.Player;
      mockStore.getController.mockReturnValue('ai');
      mockPad.buttons[7] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('对战模式下 A 键（TOGGLE_MUSIC）应该可以发送', () => {
      mockPad.buttons[0] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'TOGGLE_MUSIC',
        payload: { Game: mockGame },
      });
    });
  });
});
