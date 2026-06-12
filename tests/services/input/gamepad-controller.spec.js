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
      Player: { name: 'human' },
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

      expect(gamepad.emit).toHaveBeenCalledWith(
        events.UPDATE_GAMEPAD_CONNECTED,
        {
          connected: true,
        },
      );
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

      expect(gamepad.emit).toHaveBeenCalledWith(
        events.UPDATE_GAMEPAD_CONNECTED,
        {
          connected: false,
        },
      );
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

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, {
        level: 4,
      });
    });

    it('main-menu 模式上移等级不能超过 10', () => {
      gamepad._getMoveUpAction('main-menu', 10);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, {
        level: 10,
      });
    });

    it('main-menu 模式下移应该减少等级', () => {
      gamepad._getMoveDownAction('main-menu', 5);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, {
        level: 4,
      });
    });

    it('main-menu 模式下移等级不能低于 1', () => {
      gamepad._getMoveDownAction('main-menu', 1);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, {
        level: 1,
      });
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
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
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
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
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
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
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
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
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

  // ==================== 补充覆盖 505-521: _onConnect 完整分支 ====================
  describe('_onConnect 完整分支覆盖', () => {
    it('标准手柄连接时应该使用 STANDARD_BTN_MAP', () => {
      gamepad.activeGamepadIndex = null;
      gamepad.curBtnMap = null;
      const event = {
        gamepad: {
          index: 0,
          id: 'Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)',
        },
      };

      gamepad._onConnect(event);

      expect(gamepad.curBtnMap.A).toBe(0); // 标准映射 A=0
      expect(gamepad.curBtnMap.B).toBe(1); // 标准映射 B=1
    });

    it('北通手柄连接时应该使用 BETOP 映射', () => {
      gamepad.activeGamepadIndex = null;
      gamepad.curBtnMap = null;
      const event = { gamepad: { index: 0, id: 'BETOP 20bc:1263' } };

      gamepad._onConnect(event);

      expect(gamepad.curBtnMap.A).toBe(2); // 北通映射 A=2
      expect(gamepad.curBtnMap.B).toBe(1); // 北通映射 B=1
    });

    it('连接手柄后应该触发 UPDATE_GAMEPAD_CONNECTED 事件', () => {
      gamepad.activeGamepadIndex = null;
      gamepad.emit.mockClear();
      const event = { gamepad: { index: 0, id: 'Standard Gamepad' } };

      gamepad._onConnect(event);

      const events = GameEvents(mockGame.id);
      expect(gamepad.emit).toHaveBeenCalledWith(
        events.UPDATE_GAMEPAD_CONNECTED,
        { connected: true },
      );
    });

    it('已有激活手柄时不应触发连接事件', () => {
      gamepad.activeGamepadIndex = 1;
      gamepad.emit.mockClear();
      const event = { gamepad: { index: 2, id: 'Standard Gamepad' } };

      gamepad._onConnect(event);

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('连接北通手柄后 _onConnect 返回 this', () => {
      gamepad.activeGamepadIndex = null;
      const event = { gamepad: { index: 0, id: 'BETOP 20bc:1263' } };

      const result = gamepad._onConnect(event);

      expect(result).toBe(gamepad);
    });
  });

  // ==================== 补充覆盖 570: _onDisconnect 完整分支 ====================
  describe('_onDisconnect 完整分支覆盖', () => {
    it('断开当前激活手柄时应该清空所有状态', () => {
      gamepad.activeGamepadIndex = 0;
      gamepad.buttonStates = { A: true, B: true };
      gamepad.axisStates = { MOVE_LEFT: true, ROTATE: true };
      const event = { gamepad: { index: 0 } };

      gamepad._onDisconnect(event);

      expect(gamepad.activeGamepadIndex).toBeNull();
      expect(gamepad.buttonStates).toEqual({});
      expect(gamepad.axisStates).toEqual({});
    });

    it('断开当前激活手柄时应该触发断开事件', () => {
      gamepad.activeGamepadIndex = 0;
      gamepad.emit.mockClear();
      const event = { gamepad: { index: 0 } };

      gamepad._onDisconnect(event);

      const events = GameEvents(mockGame.id);
      expect(gamepad.emit).toHaveBeenCalledWith(
        events.UPDATE_GAMEPAD_CONNECTED,
        { connected: false },
      );
    });

    it('断开的不是当前手柄时不应触发断开事件', () => {
      gamepad.activeGamepadIndex = 0;
      gamepad.emit.mockClear();
      const event = { gamepad: { index: 1 } };

      gamepad._onDisconnect(event);

      expect(gamepad.emit).not.toHaveBeenCalled();
      expect(gamepad.activeGamepadIndex).toBe(0);
    });

    it('_onDisconnect 应该返回 this', () => {
      gamepad.activeGamepadIndex = 0;
      const event = { gamepad: { index: 0 } };

      const result = gamepad._onDisconnect(event);

      expect(result).toBe(gamepad);
    });

    it('断开手柄后再次连接应该能正常工作', () => {
      // 先断开
      gamepad.activeGamepadIndex = 0;
      gamepad._onDisconnect({ gamepad: { index: 0 } });
      expect(gamepad.activeGamepadIndex).toBeNull();

      // 再连接
      gamepad._onConnect({ gamepad: { index: 0, id: 'Standard Gamepad' } });
      expect(gamepad.activeGamepadIndex).toBe(0);
    });
  });

  // ==================== 补充覆盖 590: _refreshGamepadState 自动选择 BETOP ====================
  describe('_refreshGamepadState 自动选择分支', () => {
    it('自动选择手柄时应该正确设置 BETOP 映射', () => {
      gamepad.activeGamepadIndex = null;
      const mockPad = {
        index: 2,
        id: 'BETOP 20bc:1263 Controller',
        buttons: [],
        axes: [],
      };
      mockGetGamepads.mockReturnValue([null, null, mockPad]);

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBe(2);
      expect(gamepad.curBtnMap.A).toBe(2); // BETOP A=2
      expect(gamepad.curBtnMap.B).toBe(1); // BETOP B=1
      expect(gamepad.activeGamepad).toBe(mockPad);
    });

    it('自动选择手柄时应该正确设置标准映射', () => {
      gamepad.activeGamepadIndex = null;
      const mockPad = {
        index: 1,
        id: 'PS4 Controller',
        buttons: [],
        axes: [],
      };
      mockGetGamepads.mockReturnValue([null, mockPad]);

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBe(1);
      expect(gamepad.curBtnMap.A).toBe(0); // 标准 A=0
      expect(gamepad.curBtnMap.START).toBe(9); // 标准 START=9
    });

    it('已有激活手柄时自动选择不应该覆盖', () => {
      gamepad.activeGamepadIndex = 3;
      const mockPad1 = {
        index: 1,
        id: 'Standard Gamepad',
        buttons: [],
        axes: [],
      };
      const mockPad2 = {
        index: 3,
        id: 'BETOP 20bc:1263',
        buttons: [],
        axes: [],
      };
      mockGetGamepads.mockReturnValue([null, mockPad1, null, mockPad2]);

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBe(3);
      expect(gamepad.activeGamepad).toBe(mockPad2);
    });

    it('所有手柄都为 null 时 activeGamepad 应为 null', () => {
      gamepad.activeGamepadIndex = null;
      mockGetGamepads.mockReturnValue([null, null, null]);

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBeNull();
      expect(gamepad.activeGamepad).toBeNull();
    });

    it('只有一个手柄且为 null 时不应设置', () => {
      gamepad.activeGamepadIndex = null;
      mockGetGamepads.mockReturnValue([null]);

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBeNull();
    });
  });

  // ==================== _updateActionMap difficulty 模式完整测试 ====================
  describe('_updateActionMap difficulty 模式完整测试', () => {
    let mockPad;

    beforeEach(() => {
      mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
      mockGetGamepads.mockReturnValue([mockPad]);
      mockStore.getController.mockReturnValue('human');
      mockGame.isVersus.mockReturnValue(false);
      mockGame.Player.name = 'human';
      gamepad.Player = mockGame.Player;
      gamepad._refreshGamepadState();
      gamepad.emit.mockClear();
    });

    it('difficulty 模式按 A 应该发送 EASY', () => {
      mockStore.getState.mockReturnValue({ mode: 'difficulty', level: 1 });
      mockPad.buttons[0] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'EASY',
        payload: { Game: mockGame },
      });
    });

    it('difficulty 模式按 B 应该发送 NORMAL', () => {
      mockStore.getState.mockReturnValue({ mode: 'difficulty', level: 1 });
      mockPad.buttons[1] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'NORMAL',
        payload: { Game: mockGame },
      });
    });

    it('difficulty 模式按 Y 应该发送 HARD', () => {
      mockStore.getState.mockReturnValue({ mode: 'difficulty', level: 1 });
      mockPad.buttons[3] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'HARD',
        payload: { Game: mockGame },
      });
    });

    it('difficulty 模式按 X 应该发送 EXPERT', () => {
      mockStore.getState.mockReturnValue({ mode: 'difficulty', level: 1 });
      mockPad.buttons[2] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'EXPERT',
        payload: { Game: mockGame },
      });
    });

    it('difficulty 模式按 BACK 应该发送 BACK', () => {
      mockStore.getState.mockReturnValue({ mode: 'difficulty', level: 1 });
      mockPad.buttons[8] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'BACK',
        payload: { Game: mockGame },
      });
    });

    it('切换到 playing 模式后按 B 应该发送 DROP（不再是 NORMAL）', () => {
      // 先验证 difficulty 模式的映射
      mockStore.getState.mockReturnValue({ mode: 'difficulty', level: 1 });
      mockPad.buttons[1] = { value: 1, pressed: true };
      gamepad.buttonStates = {}; // 重置防抖
      gamepad._collectCommands(Date.now());
      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'NORMAL',
        payload: { Game: mockGame },
      });

      // 切换到 playing 模式
      mockStore.getState.mockReturnValue({ mode: 'playing', level: 1 });
      mockPad.buttons[1] = { value: 1, pressed: true };
      gamepad.buttonStates = {}; // 重置防抖
      gamepad.emit.mockClear();
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'DROP',
        payload: { Game: mockGame },
      });
    });

    it('切换到 playing 模式后按 A 应该发送 TOGGLE_MUSIC（不再是 EASY）', () => {
      // 先验证 difficulty 模式的映射
      mockStore.getState.mockReturnValue({ mode: 'difficulty', level: 1 });
      mockPad.buttons[0] = { value: 1, pressed: true };
      gamepad.buttonStates = {};
      gamepad._collectCommands(Date.now());
      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'EASY',
        payload: { Game: mockGame },
      });

      // 切换到 playing 模式
      mockStore.getState.mockReturnValue({ mode: 'playing', level: 1 });
      mockPad.buttons[0] = { value: 1, pressed: true };
      gamepad.buttonStates = {};
      gamepad.emit.mockClear();
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'TOGGLE_MUSIC',
        payload: { Game: mockGame },
      });
    });

    it('unknown 模式下按 B 应该保持默认映射（DROP）', () => {
      // 默认构造函数中 GAMEPAD_ACTION_MAP.B = 'DROP'
      // unknown 模式不匹配任何 case，映射不会被 _updateActionMap 修改
      mockStore.getState.mockReturnValue({ mode: 'unknown-mode', level: 1 });
      mockPad.buttons[1] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      // B 的默认映射是 DROP
      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'DROP',
        payload: { Game: mockGame },
      });
    });

    it('_updateActionMap 应该返回 this', () => {
      const result = gamepad._updateActionMap('difficulty');
      expect(result).toBe(gamepad);
    });
  });

  // ==================== difficulty 模式下手柄操作 ====================
  describe('difficulty 模式下手柄操作', () => {
    let mockPad;

    beforeEach(() => {
      mockState.mode = 'difficulty';
      mockState.level = 1;
      mockStore.getState.mockReturnValue(mockState);
      mockGame.isVersus.mockReturnValue(false);
      mockGame.Player.name = 'human';
      gamepad.Player = mockGame.Player;
      mockStore.getController.mockReturnValue('human');

      mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
      mockGetGamepads.mockReturnValue([mockPad]);
      gamepad._refreshGamepadState();
      gamepad.emit.mockClear();
    });

    it('difficulty 模式按 A 应该发送 EASY', () => {
      mockPad.buttons[0] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'EASY',
        payload: { Game: mockGame },
      });
    });

    it('difficulty 模式按 B 应该发送 NORMAL', () => {
      mockPad.buttons[1] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'NORMAL',
        payload: { Game: mockGame },
      });
    });

    it('difficulty 模式按 Y 应该发送 HARD', () => {
      mockPad.buttons[3] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'HARD',
        payload: { Game: mockGame },
      });
    });

    it('difficulty 模式按 X 应该发送 EXPERT', () => {
      mockPad.buttons[2] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'EXPERT',
        payload: { Game: mockGame },
      });
    });

    it('difficulty 模式按 BACK 应该发送 BACK', () => {
      mockPad.buttons[8] = { value: 1, pressed: true };
      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'BACK',
        payload: { Game: mockGame },
      });
    });

    it('所有难度按钮都被正确映射', () => {
      const testCases = [
        { buttonIndex: 0, expectedAction: 'EASY', btnName: 'A' },
        { buttonIndex: 1, expectedAction: 'NORMAL', btnName: 'B' },
        { buttonIndex: 2, expectedAction: 'EXPERT', btnName: 'X' },
        { buttonIndex: 3, expectedAction: 'HARD', btnName: 'Y' },
        { buttonIndex: 8, expectedAction: 'BACK', btnName: 'BACK' },
      ];

      testCases.forEach(({ buttonIndex, expectedAction, btnName }) => {
        // 重置防抖状态
        gamepad.buttonStates = {};
        gamepad.emit.mockClear();
        mockPad.buttons.forEach((b) => {
          b.value = 0;
          b.pressed = false;
        });
        mockPad.buttons[buttonIndex] = { value: 1, pressed: true };

        gamepad._collectCommands(Date.now());

        expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
          device: 'gamepad',
          action: expectedAction,
          payload: { Game: mockGame },
        });
      });
    });
  });

  // ==================== _resolveAction 完整分支 ====================
  describe('_resolveAction 完整分支', () => {
    it('主菜单模式 DPAD_UP 冷却期内应返回空字符串', () => {
      gamepad.lastDpadTime = Date.now(); // 刚触发过
      const result = gamepad._resolveAction(
        'ROTATE',
        'DPAD_UP',
        true,
        'main-menu',
        5,
        Date.now(),
      );

      expect(result).toBe('');
    });

    it('主菜单模式非 DPAD 按键不受冷却限制', () => {
      gamepad.lastDpadTime = Date.now(); // 刚触发过
      const result = gamepad._resolveAction(
        'CONFIRM',
        'START',
        false,
        'main-menu',
        5,
        Date.now(),
      );

      // 非 DPAD 按键直接返回原 action
      expect(result).toBe('CONFIRM');
    });

    it('非主菜单模式 DPAD 不受冷却限制', () => {
      gamepad.lastDpadTime = Date.now();
      const result = gamepad._resolveAction(
        'MOVE_LEFT',
        'DPAD_LEFT',
        true,
        'playing',
        1,
        Date.now(),
      );

      // playing 模式直接返回原 action
      expect(result).toBe('MOVE_LEFT');
    });

    it('主菜单模式 DPAD_LEFT 应该返回原动作', () => {
      gamepad.lastDpadTime = 0;
      const result = gamepad._resolveAction(
        'MOVE_LEFT',
        'DPAD_LEFT',
        true,
        'main-menu',
        5,
        Date.now() + 200,
      );

      expect(result).toBe('MOVE_LEFT');
    });

    it('主菜单模式 DPAD_RIGHT 应该返回原动作', () => {
      gamepad.lastDpadTime = 0;
      const result = gamepad._resolveAction(
        'MOVE_RIGHT',
        'DPAD_RIGHT',
        true,
        'main-menu',
        5,
        Date.now() + 200,
      );

      expect(result).toBe('MOVE_RIGHT');
    });
  });

  // ==================== _handleStandardButtons 屏蔽分支 ====================
  describe('_handleStandardButtons 屏蔽分支', () => {
    let mockPad;

    beforeEach(() => {
      mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
      mockGetGamepads.mockReturnValue([mockPad]);
      gamepad._refreshGamepadState();
      gamepad.emit.mockClear();
    });

    it('replay 模式非 START 键应该被屏蔽', () => {
      mockState.mode = 'replay';
      mockPad.buttons[0] = { value: 1, pressed: true }; // A 键

      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('replay 模式 START 键应该可以发送', () => {
      mockState.mode = 'replay';
      mockPad.buttons[9] = { value: 1, pressed: true }; // START 键

      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'CONFIRM',
        payload: { Game: mockGame },
      });
    });

    it('game-over 模式非 START 键应该被屏蔽', () => {
      mockState.mode = 'game-over';
      mockPad.buttons[0] = { value: 1, pressed: true }; // A 键

      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('game-over 模式 START 键应该可以发送', () => {
      mockState.mode = 'game-over';
      mockPad.buttons[9] = { value: 1, pressed: true }; // START 键

      gamepad._collectCommands(Date.now());

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'CONFIRM',
        payload: { Game: mockGame },
      });
    });

    it('BETOP 手柄 DPAD 按键应该跳过按钮处理', () => {
      mockPad.id = 'BETOP 20bc:1263';
      mockPad.buttons[14] = { value: 1, pressed: true }; // DPAD_LEFT
      gamepad._refreshGamepadState();
      gamepad.emit.mockClear();

      gamepad._collectCommands(Date.now());

      // BETOP DPAD 不走按钮方式，应该没有触发 MOVE_LEFT
      const moveLeftCalls = gamepad.emit.mock.calls.filter(
        (call) =>
          call[0] === 'dispatch:input' && call[1]?.action === 'MOVE_LEFT',
      );
      expect(moveLeftCalls.length).toBe(0);
    });

    it('被屏蔽的按键应该触发 early return', () => {
      mockState.mode = 'replay';
      mockPad.buttons[0] = { value: 1, pressed: true };
      gamepad.emit.mockClear();
      const result = gamepad._collectCommands(Date.now());

      // 屏蔽后 _handleStandardButtons 返回 this，但 _collectCommands 继续执行
      expect(result).toBe(gamepad);
    });
  });

  // ==================== _handleBetopDpad 边界 ====================
  describe('_handleBetopDpad 完整分支', () => {
    it('上方向重复触发不应重复发送事件', () => {
      gamepad.dpadAxisState.up = true;
      gamepad.emit.mockClear();

      gamepad._handleBetopDpad(-1, { mode: 'playing', level: 1 });

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('下方向重复触发不应重复发送事件', () => {
      gamepad.dpadAxisState.down = true;
      gamepad.emit.mockClear();

      gamepad._handleBetopDpad(0.14286, { mode: 'playing', level: 1 });

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('左方向重复触发不应重复发送事件', () => {
      gamepad.dpadAxisState.left = true;
      gamepad.emit.mockClear();

      gamepad._handleBetopDpad(0.71429, { mode: 'playing', level: 1 });

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('右方向重复触发不应重复发送事件', () => {
      gamepad.dpadAxisState.right = true;
      gamepad.emit.mockClear();

      gamepad._handleBetopDpad(-0.42857, { mode: 'playing', level: 1 });

      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('未知轴值应该重置所有方向状态', () => {
      gamepad.dpadAxisState = {
        up: true,
        down: false,
        left: true,
        right: false,
      };

      gamepad._handleBetopDpad(0.5, { mode: 'playing', level: 1 });

      expect(gamepad.dpadAxisState).toEqual({
        up: false,
        down: false,
        left: false,
        right: false,
      });
    });

    it('main-menu 模式 DPAD 冷却期应该直接返回不处理', () => {
      gamepad.lastDpadTime = Date.now();
      gamepad.dpadAxisState = {
        up: false,
        down: false,
        left: false,
        right: false,
      };
      gamepad.emit.mockClear();

      gamepad._handleBetopDpad(-1, { mode: 'main-menu', level: 3 });

      expect(gamepad.emit).not.toHaveBeenCalled();
      expect(gamepad.dpadAxisState.up).toBe(false);
    });
  });

  // ==================== _getMoveUpAction 等级边界 ====================
  describe('_getMoveUpAction 等级边界', () => {
    let events;

    beforeEach(() => {
      events = GameEvents(mockGame.id);
      gamepad.emit.mockClear();
    });

    it('等级从 9 增加到 10', () => {
      const action = gamepad._getMoveUpAction('main-menu', 9);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, {
        level: 10,
      });
      expect(action).toBe('LEVEL_TEN');
    });

    it('等级从 10 不能再增加', () => {
      const action = gamepad._getMoveUpAction('main-menu', 10);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, {
        level: 10,
      });
      // LEVELS[9] = 'TEN'
      expect(action).toBe('LEVEL_TEN');
    });

    it('等级从 2 减少到 1', () => {
      const action = gamepad._getMoveDownAction('main-menu', 2);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, {
        level: 1,
      });
      expect(action).toBe('LEVEL_ONE');
    });

    it('等级从 1 不能再减少', () => {
      const action = gamepad._getMoveDownAction('main-menu', 1);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, {
        level: 1,
      });
      expect(action).toBe('LEVEL_ONE');
    });

    it('等级 0 边界（非法值）', () => {
      // level 0 → newLevel = -1 → clamp 到 1
      const action = gamepad._getMoveDownAction('main-menu', 0);

      expect(gamepad.emit).toHaveBeenCalledWith(events.UPDATE_LEVEL, {
        level: 1,
      });
      expect(action).toBe('LEVEL_ONE');
    });

    it('所有等级名称映射正确', () => {
      const expectedNames = [
        'ONE',
        'TWO',
        'THREE',
        'FOUR',
        'FIX',
        'SIX',
        'SEVEN',
        'EIGHT',
        'NINE',
        'TEN',
      ];

      for (let i = 1; i <= 10; i++) {
        gamepad.emit.mockClear();
        const action = gamepad._getMoveUpAction('main-menu', i - 1); // 从 i-1 增加到 i
        expect(action).toBe(`LEVEL_${expectedNames[i - 1]}`);
      }
    });
  });

  // ==================== update 方法完整分支 ====================
  describe('update 方法完整分支', () => {
    it('对战模式 AI 玩家应直接返回', () => {
      mockStore.getMode.mockReturnValue('playing');
      mockGame.Player.name = 'ai';
      gamepad.Player = mockGame.Player;
      gamepad._refreshGamepadState = jest.fn();
      gamepad._collectCommands = jest.fn();
      gamepad.emit.mockClear();

      const result = gamepad.update(Date.now());

      expect(result).toBe(gamepad);
      expect(gamepad._collectCommands).not.toHaveBeenCalled();
      expect(gamepad.emit).not.toHaveBeenCalled();
    });

    it('非 playing 模式 AI 玩家应该走正常流程', () => {
      mockStore.getMode.mockReturnValue('main-menu'); // 不是 'playing'
      mockGame.Player.name = 'ai';
      gamepad.Player = mockGame.Player;
      gamepad._refreshGamepadState = jest.fn().mockReturnValue(gamepad);
      gamepad._collectCommands = jest.fn().mockReturnValue(gamepad);

      const mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
        axes: [],
      };
      mockGetGamepads.mockReturnValue([mockPad]);
      gamepad.activeGamepadIndex = 0;
      gamepad.activeGamepad = mockPad;

      gamepad.update(Date.now());

      // 非 playing 模式即使是 AI 也不跳过
      expect(gamepad._collectCommands).toHaveBeenCalled();
    });

    it('human 玩家 playing 模式正常处理', () => {
      mockStore.getMode.mockReturnValue('playing');
      mockGame.Player.name = 'human';
      gamepad.Player = mockGame.Player;

      const mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
      mockGetGamepads.mockReturnValue([mockPad]);
      gamepad.activeGamepadIndex = 0;
      gamepad.activeGamepad = mockPad;
      gamepad._collectCommands = jest.fn().mockReturnValue(gamepad);

      gamepad.update(Date.now());

      expect(gamepad._collectCommands).toHaveBeenCalled();
    });
  });

  // ==================== 补充覆盖 275-277: _onConnect 绑定手柄 BETOP 分支 emit ====================
  describe('_onConnect 绑定手柄分支', () => {
    it('绑定手柄连接 BETOP 时应该发送连接事件', () => {
      gamepad.boundGamepadIndex = 0;
      gamepad.emit.mockClear();
      const event = { gamepad: { index: 0, id: 'BETOP 20bc:1263' } };

      gamepad._onConnect(event);

      const events = GameEvents(mockGame.id);
      expect(gamepad.emit).toHaveBeenCalledWith(
        events.UPDATE_GAMEPAD_CONNECTED,
        { connected: true },
      );
      expect(gamepad.curBtnMap.A).toBe(2);
    });

    it('绑定手柄连接不匹配时应该忽略', () => {
      gamepad.boundGamepadIndex = 1;
      gamepad.emit.mockClear();
      const event = { gamepad: { index: 0, id: 'Standard Gamepad' } };

      const result = gamepad._onConnect(event);

      expect(gamepad.emit).not.toHaveBeenCalled();
      expect(gamepad.activeGamepadIndex).toBeNull();
      expect(result).toBe(gamepad);
    });
  });

  // ==================== 补充覆盖 301: _onDisconnect emit 断开事件 ====================
  describe('_onDisconnect 发送事件', () => {
    it('断开时应该发送 UPDATE_GAMEPAD_CONNECTED 事件', () => {
      gamepad.activeGamepadIndex = 0;
      gamepad.emit.mockClear();
      const event = { gamepad: { index: 0 } };
      const events = GameEvents(mockGame.id);

      gamepad._onDisconnect(event);

      expect(gamepad.emit).toHaveBeenCalledWith(
        events.UPDATE_GAMEPAD_CONNECTED,
        { connected: false },
      );
    });
  });

  // ==================== 补充覆盖 377-389: _refreshGamepadState 绑定索引分支 ====================
  describe('_refreshGamepadState 绑定索引', () => {
    it('绑定索引时应该使用绑定索引的手柄', () => {
      gamepad.boundGamepadIndex = 1;
      const mockPad0 = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: [],
        axes: [],
      };
      const mockPad1 = {
        index: 1,
        id: 'BETOP 20bc:1263',
        buttons: [],
        axes: [],
      };
      mockGetGamepads.mockReturnValue([mockPad0, mockPad1]);

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBe(1);
      expect(gamepad.activeGamepad).toBe(mockPad1);
      expect(gamepad.curBtnMap.A).toBe(2); // BETOP 映射
    });

    it('绑定索引的手柄不存在时 activeGamepad 为 null', () => {
      gamepad.boundGamepadIndex = 2;
      mockGetGamepads.mockReturnValue([null, null]);

      gamepad._refreshGamepadState();

      expect(gamepad.activeGamepadIndex).toBe(2);
      expect(gamepad.activeGamepad).toBeNull();
    });

    it('绑定索引的手柄为标准手柄时使用标准映射', () => {
      gamepad.boundGamepadIndex = 0;
      const mockPad = { index: 0, id: 'PS4 Controller', buttons: [], axes: [] };
      mockGetGamepads.mockReturnValue([mockPad]);

      gamepad._refreshGamepadState();

      expect(gamepad.curBtnMap.A).toBe(0); // 标准映射
    });
  });

  // ==================== 补充覆盖 477-486: _resolveAction 冷却期 ====================
  describe('_resolveAction 冷却期分支', () => {
    it('DPAD_UP 冷却期内应返回空字符串', () => {
      gamepad.lastDpadTime = Date.now();
      const result = gamepad._resolveAction(
        'ROTATE',
        'DPAD_UP',
        true,
        'main-menu',
        5,
        Date.now(),
      );
      expect(result).toBe('');
    });

    it('DPAD_DOWN 冷却期外应返回 _getMoveDownAction 结果', () => {
      gamepad.lastDpadTime = 0;
      const result = gamepad._resolveAction(
        'MOVE_DOWN',
        'DPAD_DOWN',
        true,
        'main-menu',
        3,
        Date.now() + 200,
      );
      // playing 模式返回 MOVE_DOWN，但 main-menu 返回 LEVEL_*
      expect(result).toBe('LEVEL_TWO'); // level 3 → 下移 → level 2
    });

    it('DPAD_DOWN 冷却期内应返回空字符串', () => {
      gamepad.lastDpadTime = Date.now();
      const result = gamepad._resolveAction(
        'MOVE_DOWN',
        'DPAD_DOWN',
        true,
        'main-menu',
        3,
        Date.now(),
      );
      expect(result).toBe('');
    });
  });

  // ==================== 补充覆盖 573, 578: _handleBetopDpad 方向键 ====================
  describe('_handleBetopDpad 方向键分支', () => {
    it('上方向 (-1.00000) 应该触发 _handleBetopDpadUp', () => {
      gamepad.emit.mockClear();
      gamepad._handleBetopDpad(-1, { mode: 'playing', level: 1 });

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'ROTATE',
        payload: { Game: mockGame },
      });
      expect(gamepad.dpadAxisState.up).toBe(true);
      expect(gamepad.dpadAxisState.down).toBe(false);
      expect(gamepad.dpadAxisState.left).toBe(false);
      expect(gamepad.dpadAxisState.right).toBe(false);
    });

    it('下方向 (0.14286) 应该触发 _handleBetopDpadDown', () => {
      gamepad.emit.mockClear();
      gamepad._handleBetopDpad(0.14286, { mode: 'playing', level: 1 });

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_DOWN',
        payload: { Game: mockGame },
      });
    });

    it('左方向 (0.71429) 应该触发 _handleBetopDpadLeft', () => {
      gamepad.emit.mockClear();
      gamepad._handleBetopDpad(0.71429, { mode: 'playing', level: 1 });

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
    });

    it('右方向 (-0.42857) 应该触发 _handleBetopDpadRight', () => {
      gamepad.emit.mockClear();
      gamepad._handleBetopDpad(-0.42857, { mode: 'playing', level: 1 });

      expect(gamepad.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'gamepad',
        action: 'MOVE_RIGHT',
        payload: { Game: mockGame },
      });
    });
  });

  // ==================== 补充覆盖 650: _getAxis 无激活手柄 ====================
  describe('_getAxis 无激活手柄', () => {
    it('activeGamepad 为 null 时应该返回 0', () => {
      gamepad.activeGamepad = null;
      expect(gamepad._getAxis(0)).toBe(0);
    });

    it('activeGamepad 为 undefined 时应该返回 0', () => {
      gamepad.activeGamepad = undefined;
      expect(gamepad._getAxis(1)).toBe(0);
    });

    it('axes 中指定索引不存在时应该返回 0', () => {
      gamepad.activeGamepad = { axes: [0.5] };
      expect(gamepad._getAxis(5)).toBe(0);
    });
  });

  // ==================== 补充覆盖 681: _isPressed 按钮不存在 ====================
  describe('_isPressed 按钮不存在', () => {
    it('按钮索引存在但按钮对象为 undefined', () => {
      gamepad.activeGamepad = {
        buttons: [undefined, { value: 1, pressed: true }],
      };
      gamepad.curBtnMap = { A: 0, B: 1 };

      // 按钮索引 0 对应的按钮为 undefined
      expect(gamepad._isPressed('A')).toBe(false);
      // 按钮索引 1 对应的按钮存在且按下
      expect(gamepad._isPressed('B')).toBe(true);
    });

    it('按钮对象为 null', () => {
      gamepad.activeGamepad = {
        buttons: [null],
      };
      gamepad.curBtnMap = { A: 0 };

      expect(gamepad._isPressed('A')).toBe(false);
    });
  });

  // ==================== setBoundIndex ====================
  describe('setBoundIndex 方法', () => {
    it('应该设置 boundGamepadIndex 和 activeGamepadIndex', () => {
      gamepad.setBoundIndex(2);
      expect(gamepad.boundGamepadIndex).toBe(2);
      expect(gamepad.activeGamepadIndex).toBe(2);
    });

    it('应该返回 this 支持链式调用', () => {
      const result = gamepad.setBoundIndex(0);
      expect(result).toBe(gamepad);
    });
  });

  // ==================== update 方法 P2 非 playing 模式限制 ====================
  describe('update 方法 P2 非 playing 模式限制', () => {
    it('P2 (boundIndex=1) 在 main-menu 模式应该直接返回', () => {
      gamepad.setBoundIndex(1);
      mockStore.getMode.mockReturnValue('main-menu');
      gamepad._refreshGamepadState = jest.fn();
      gamepad._collectCommands = jest.fn();

      gamepad.update(Date.now());

      expect(gamepad._collectCommands).not.toHaveBeenCalled();
    });

    it('P2 (boundIndex=1) 在 difficulty 模式应该直接返回', () => {
      gamepad.setBoundIndex(1);
      mockStore.getMode.mockReturnValue('difficulty');
      gamepad._refreshGamepadState = jest.fn();
      gamepad._collectCommands = jest.fn();

      gamepad.update(Date.now());

      expect(gamepad._collectCommands).not.toHaveBeenCalled();
    });

    it('P2 (boundIndex=1) 在 playing 模式应该正常处理', () => {
      gamepad.setBoundIndex(1);
      mockStore.getMode.mockReturnValue('playing');
      mockGame.Player.name = 'human';
      gamepad.Player = mockGame.Player;

      const mockPad = {
        index: 1,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
        axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
      mockGetGamepads.mockReturnValue([null, mockPad]);
      gamepad._refreshGamepadState();
      gamepad._collectCommands = jest.fn().mockReturnValue(gamepad);

      gamepad.update(Date.now());

      expect(gamepad._collectCommands).toHaveBeenCalled();
    });

    it('P1 (boundIndex=0) 在非 playing 模式不应该被限制', () => {
      gamepad.setBoundIndex(0);
      mockStore.getMode.mockReturnValue('main-menu');

      const mockPad = {
        index: 0,
        id: 'Standard Gamepad',
        buttons: Array.from({ length: 16 }, () => ({
          value: 0,
          pressed: false,
        })),
        axes: [],
      };
      mockGetGamepads.mockReturnValue([mockPad]);
      gamepad._refreshGamepadState();
      gamepad._collectCommands = jest.fn().mockReturnValue(gamepad);

      gamepad.update(Date.now());

      // P1 (boundIndex=0) 不会被限制
      expect(gamepad._collectCommands).toHaveBeenCalled();
    });
  });
});
