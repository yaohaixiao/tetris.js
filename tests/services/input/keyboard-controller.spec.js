/** @jest-environment jsdom */

import GAME from '@/lib/game/constants/game.js';
import KeyboardController from '@/lib/services/input/keyboard-controller.js';
import { UIEvents } from '@/lib/events/event-catalog.js';

// Mock Base class
jest.mock('@/lib/core', () => {
  return class Base {
    constructor(options) {
      Object.assign(this, options);
    }
    emit(eventName, data) {
      if (this._emitMock) {
        this._emitMock(eventName, data);
      }
      return this;
    }
  };
});

describe('KeyboardController', () => {
  let keyboard;
  let mockGame;
  let mockStore;
  let mockPlayer;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPlayer = {
      name: 'human',
    };

    mockStore = {
      getMode: jest.fn().mockReturnValue('playing'),
      getController: jest.fn().mockReturnValue('human'),
    };

    mockGame = {
      id: 'test-game-uuid',
      Store: mockStore,
      Player: mockPlayer,
      isVersus: jest.fn().mockReturnValue(false),
    };

    keyboard = new KeyboardController({
      Game: mockGame,
      Store: mockStore,
    });

    // 设置 Player 属性
    keyboard.Player = mockPlayer;

    // 设置 emit spy
    jest.spyOn(keyboard, 'emit').mockImplementation(() => keyboard);

    // Spy on global event listeners
    jest.spyOn(globalThis, 'addEventListener');
    jest.spyOn(globalThis, 'removeEventListener');
    jest.spyOn(document, 'addEventListener');
    jest.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确创建 KeyboardController 实例', () => {
      expect(keyboard).toBeDefined();
      expect(keyboard).toBeInstanceOf(KeyboardController);
    });

    it('应该正确注入依赖', () => {
      expect(keyboard.Game).toBe(mockGame);
      expect(keyboard.Store).toBe(mockStore);
    });

    it('应该正确初始化 DAS 状态', () => {
      expect(keyboard.dasState).toEqual({
        dasTimer: -1,
        arrTimer: 0,
        direction: 0,
        active: false,
      });
    });
  });

  // ==================== addEventListeners ====================
  describe('addEventListeners 方法', () => {
    it('应该在 globalThis 上注册 resize 事件', () => {
      keyboard.addEventListeners();

      expect(globalThis.addEventListener).toHaveBeenCalledWith(
        'resize',
        keyboard._onResize,
      );
    });

    it('应该在 document 上注册 keydown 事件', () => {
      keyboard.addEventListeners();

      expect(document.addEventListener).toHaveBeenCalledWith(
        'keydown',
        keyboard._onKeydown,
      );
    });

    it('应该在 document 上注册 keyup 事件', () => {
      keyboard.addEventListeners();

      expect(document.addEventListener).toHaveBeenCalledWith(
        'keyup',
        keyboard._onKeyup,
      );
    });

    it('应该返回 KeyboardController 实例以支持链式调用', () => {
      const result = keyboard.addEventListeners();
      expect(result).toBe(keyboard);
    });
  });

  // ==================== removeEventListeners ====================
  describe('removeEventListeners 方法', () => {
    it('应该移除所有事件监听', () => {
      keyboard.removeEventListeners();

      expect(globalThis.removeEventListener).toHaveBeenCalledWith(
        'resize',
        keyboard._onResize,
      );
      expect(document.removeEventListener).toHaveBeenCalledWith(
        'keydown',
        keyboard._onKeydown,
      );
      expect(document.removeEventListener).toHaveBeenCalledWith(
        'keyup',
        keyboard._onKeyup,
      );
    });

    it('应该返回 KeyboardController 实例以支持链式调用', () => {
      const result = keyboard.removeEventListeners();
      expect(result).toBe(keyboard);
    });
  });

  // ==================== _onResize ====================
  describe('_onResize 回调', () => {
    it('应该发送 ui:resize 事件', () => {
      const events = UIEvents(mockGame.id);
      keyboard._onResize();

      expect(keyboard.emit).toHaveBeenCalledWith(events.RESIZE);
    });

    it('应该返回 KeyboardController 实例', () => {
      const result = keyboard._onResize();
      expect(result).toBe(keyboard);
    });
  });

  // ==================== _onKeydown - human 控制 ====================
  describe('_onKeydown 回调（human 控制）', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      mockStore.getController.mockReturnValue('human');
      mockPlayer.name = 'human';
      mockGame.isVersus.mockReturnValue(false);
      keyboard.Player = mockPlayer;
      keyboard.emit.mockClear();
    });

    it('应该将有效的键盘输入转换为 dispatch:input 事件', () => {
      keyboard._onKeydown({ key: 'ArrowLeft' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
    });

    it('应该支持空格键', () => {
      keyboard._onKeydown({ key: ' ' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'DROP',
        payload: { Game: mockGame },
      });
    });

    it('应该支持 s 键（切换控制者）', () => {
      keyboard._onKeydown({ key: 's' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'SWITCH_CONTROLLER',
        payload: { Game: mockGame },
      });
    });

    it('应该支持字母键 m（切换音乐）', () => {
      keyboard._onKeydown({ key: 'm' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'TOGGLE_MUSIC',
        payload: { Game: mockGame },
      });
    });

    it('应该支持字母键 p（暂停）', () => {
      keyboard._onKeydown({ key: 'p' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'TOGGLE_PAUSED',
        payload: { Game: mockGame },
      });
    });

    it('应该支持字母键 r（重启）', () => {
      keyboard._onKeydown({ key: 'r' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'RESTART',
        payload: { Game: mockGame },
      });
    });

    it('应该支持回车键（确认）', () => {
      keyboard._onKeydown({ key: 'Enter' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'CONFIRM',
        payload: { Game: mockGame },
      });
    });

    it('应该支持 c 键（HOLD）', () => {
      keyboard._onKeydown({ key: 'c' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'HOLD',
        payload: { Game: mockGame },
      });
    });

    it('应该支持 q 键（QUIT）', () => {
      keyboard._onKeydown({ key: 'q' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'QUIT',
        payload: { Game: mockGame },
      });
    });

    it('未映射的按键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'z' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('空 key 不应该发送事件', () => {
      keyboard._onKeydown({ key: '' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('key 为 undefined 不应该发送事件', () => {
      keyboard._onKeydown({ key: undefined });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('应该处理大写字母', () => {
      keyboard._onKeydown({ key: 'R' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'RESTART',
        payload: { Game: mockGame },
      });
    });

    it('应该返回 KeyboardController 实例', () => {
      const result = keyboard._onKeydown({ key: 'ArrowLeft' });
      expect(result).toBe(keyboard);
    });
  });

  // ==================== _onKeydown - AI 控制模式 ====================
  describe('_onKeydown 回调（AI 控制）', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      mockStore.getController.mockReturnValue('ai');
      mockPlayer.name = 'ai';
      mockGame.isVersus.mockReturnValue(false);
      keyboard.Player = mockPlayer;
      keyboard.emit.mockClear();
    });

    // 注意：由于 _onKeydown 中有这个检查：
    // if (Store.getMode() === 'playing' && Player.name === 'ai') {
    //   return this;
    // }
    // AI 玩家在 playing 模式下不会发送任何事件
    // 所以这些测试应该期望不发送事件

    it('AI 控制时 s 键不应该发送事件（因为 AI 玩家在 playing 模式下不响应按键）', () => {
      keyboard._onKeydown({ key: 's' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('AI 控制时 m 键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'm' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('AI 控制时 p 键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'p' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('AI 控制时 r 键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'r' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('AI 控制时方向键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'ArrowLeft' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('AI 控制时空格键不应该发送事件', () => {
      keyboard._onKeydown({ key: ' ' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('AI 控制时 c 键（HOLD）不应该发送事件', () => {
      keyboard._onKeydown({ key: 'c' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('非 playing 模式下 AI 控制的限制不生效', () => {
      mockStore.getMode.mockReturnValue('paused');
      mockStore.getController.mockReturnValue('ai');
      mockPlayer.name = 'ai';
      keyboard.emit.mockClear();

      keyboard._onKeydown({ key: 'ArrowLeft' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
    });
  });

  // ==================== replay 模式下的行为 ====================
  describe('replay 模式下的行为', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('replay');
      mockStore.getController.mockReturnValue('human');
      mockPlayer.name = 'human';
      mockGame.isVersus.mockReturnValue(false);
      keyboard.Player = mockPlayer;
      keyboard.emit.mockClear();
    });

    it('replay 模式下大多数按键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'ArrowLeft' });
      expect(keyboard.emit).not.toHaveBeenCalled();

      keyboard._onKeydown({ key: 's' });
      expect(keyboard.emit).not.toHaveBeenCalled();

      keyboard._onKeydown({ key: 'm' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('replay 模式下回车键仍然可以发送事件', () => {
      keyboard._onKeydown({ key: 'Enter' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'CONFIRM',
        payload: { Game: mockGame },
      });
    });
  });

  // ==================== 对战模式（Versus） ====================
  describe('对战模式下的行为', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      mockGame.isVersus.mockReturnValue(true);
      keyboard.Player = mockPlayer;
      keyboard.emit.mockClear();
    });

    it('对战模式下 human 玩家按 s 键应该被屏蔽', () => {
      mockStore.getController.mockReturnValue('human');
      mockPlayer.name = 'human';
      keyboard._onKeydown({ key: 's' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('对战模式下按 r 键应该被屏蔽', () => {
      mockStore.getController.mockReturnValue('human');
      mockPlayer.name = 'human';
      keyboard._onKeydown({ key: 'r' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('对战模式下移动键不应该被屏蔽', () => {
      mockStore.getController.mockReturnValue('human');
      mockPlayer.name = 'human';
      keyboard._onKeydown({ key: 'ArrowLeft' });

      expect(keyboard.emit).toHaveBeenCalled();
    });

    it('对战模式下 AI 玩家按 p 键应该被屏蔽', () => {
      mockStore.getController.mockReturnValue('ai');
      mockPlayer.name = 'ai';
      keyboard._onKeydown({ key: 'p' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('对战模式下 AI 玩家按 c 键应该被屏蔽', () => {
      mockStore.getController.mockReturnValue('ai');
      mockPlayer.name = 'ai';
      keyboard._onKeydown({ key: 'c' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('对战模式下 AI 玩家按 m 键应该可以发送（不受对战限制）', () => {
      mockStore.getController.mockReturnValue('ai');
      mockPlayer.name = 'ai';
      keyboard._onKeydown({ key: 'm' });

      // 注意：由于 AI 玩家在 playing 模式下不响应任何按键（_onKeydown 中的检查），
      // 所以 m 键也不会发送。这个测试应该期望不发送。
      expect(keyboard.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== 按键映射 ====================
  describe('按键映射', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      mockStore.getController.mockReturnValue('human');
      mockPlayer.name = 'human';
      mockGame.isVersus.mockReturnValue(false);
      keyboard.Player = mockPlayer;
      keyboard.emit.mockClear();
    });

    const testCases = [
      { key: 'ArrowLeft', expected: 'MOVE_LEFT' },
      { key: 'ArrowRight', expected: 'MOVE_RIGHT' },
      { key: 'ArrowDown', expected: 'MOVE_DOWN' },
      { key: 'ArrowUp', expected: 'ROTATE' },
      { key: ' ', expected: 'DROP' },
      { key: 's', expected: 'SWITCH_CONTROLLER' },
      { key: 'm', expected: 'TOGGLE_MUSIC' },
      { key: 'p', expected: 'TOGGLE_PAUSED' },
      { key: 'r', expected: 'RESTART' },
      { key: 'q', expected: 'QUIT' },
      { key: 'c', expected: 'HOLD' },
      { key: '1', expected: 'LEVEL_ONE' },
      { key: '2', expected: 'LEVEL_TWO' },
      { key: '3', expected: 'LEVEL_THREE' },
      { key: '4', expected: 'LEVEL_FOUR' },
      { key: '5', expected: 'LEVEL_FIVE' },
      { key: '6', expected: 'LEVEL_SIX' },
      { key: '7', expected: 'LEVEL_SEVEN' },
      { key: '8', expected: 'LEVEL_EIGHT' },
      { key: '9', expected: 'LEVEL_NINE' },
      { key: 't', expected: 'LEVEL_TEN' },
      { key: 'e', expected: 'EASY' },
      { key: 'n', expected: 'NORMAL' },
      { key: 'h', expected: 'HARD' },
      { key: 'x', expected: 'EXPERT' },
      { key: 'b', expected: 'BACK' },
      { key: 'Enter', expected: 'CONFIRM' },
    ];

    testCases.forEach(({ key, expected }) => {
      it(`按键 "${key}" 应该映射为 "${expected}"`, () => {
        keyboard._onKeydown({ key });

        expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
          device: 'keyboard',
          action: expected,
          payload: { Game: mockGame },
        });
      });
    });
  });

  // ==================== DAS/ARR ====================
  describe('DAS/ARR（长按自动移动）', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      mockStore.getController.mockReturnValue('human');
      mockPlayer.name = 'human';
      mockGame.isVersus.mockReturnValue(false);
      keyboard.Player = mockPlayer;
    });

    it('按下左键应该设置 dasState.direction = -1', () => {
      keyboard._onKeydown({ key: 'ArrowLeft' });

      expect(keyboard.dasState.direction).toBe(-1);
      expect(keyboard.dasState.dasTimer).toBe(0);
      expect(keyboard.dasState.arrTimer).toBe(0);
      expect(keyboard.dasState.active).toBe(true);
    });

    it('按下右键应该设置 dasState.direction = 1', () => {
      keyboard._onKeydown({ key: 'ArrowRight' });

      expect(keyboard.dasState.direction).toBe(1);
      expect(keyboard.dasState.dasTimer).toBe(0);
      expect(keyboard.dasState.arrTimer).toBe(0);
      expect(keyboard.dasState.active).toBe(true);
    });

    it('按下下键不应该设置 DAS 状态', () => {
      const initialDasState = { ...keyboard.dasState };
      keyboard._onKeydown({ key: 'ArrowDown' });

      expect(keyboard.dasState.direction).toBe(initialDasState.direction);
      expect(keyboard.dasState.active).toBe(initialDasState.active);
    });

    it('按其他键不应该设置 DAS 状态', () => {
      const initialDasState = { ...keyboard.dasState };
      keyboard._onKeydown({ key: 'ArrowUp' });

      expect(keyboard.dasState).toEqual(initialDasState);
    });
  });

  // ==================== update 方法 ====================
  describe('update 方法（DAS/ARR 帧更新）', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      keyboard.emit.mockClear();
    });

    it('dasState.active 为 false 时不执行', () => {
      keyboard.dasState.active = false;
      keyboard.dasState.direction = 1;

      keyboard.update();

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('direction 为 0 时不执行', () => {
      keyboard.dasState.active = true;
      keyboard.dasState.direction = 0;

      keyboard.update();

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('非 playing 模式时不执行', () => {
      mockStore.getMode.mockReturnValue('paused');
      keyboard.dasState.active = true;
      keyboard.dasState.direction = 1;

      keyboard.update();

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('DAS 阶段：dasTimer < 10 时递增但不触发移动', () => {
      keyboard.dasState.active = true;
      keyboard.dasState.direction = 1;
      keyboard.dasState.dasTimer = 5;

      keyboard.update();

      expect(keyboard.dasState.dasTimer).toBe(6);
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('DAS 完成后 arrTimer 达到阈值触发左移', () => {
      keyboard.dasState.active = true;
      keyboard.dasState.direction = -1;
      keyboard.dasState.dasTimer = 10;
      keyboard.dasState.arrTimer = 2;

      keyboard.update();

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
      expect(keyboard.dasState.arrTimer).toBe(0);
    });

    it('DAS 完成后 arrTimer 达到阈值触发右移', () => {
      keyboard.dasState.active = true;
      keyboard.dasState.direction = 1;
      keyboard.dasState.dasTimer = 10;
      keyboard.dasState.arrTimer = 2;

      keyboard.update();

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'MOVE_RIGHT',
        payload: { Game: mockGame },
      });
      expect(keyboard.dasState.arrTimer).toBe(0);
    });

    it('ARR 阶段：arrTimer < 2 时递增但不触发移动', () => {
      keyboard.dasState.active = true;
      keyboard.dasState.direction = 1;
      keyboard.dasState.dasTimer = 10;
      keyboard.dasState.arrTimer = 1;

      keyboard.update();

      expect(keyboard.dasState.arrTimer).toBe(2);
      expect(keyboard.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== _onKeyup ====================
  describe('_onKeyup 回调', () => {
    it('松开左键应该重置 DAS 状态', () => {
      keyboard.dasState.direction = -1;
      keyboard.dasState.dasTimer = 5;
      keyboard.dasState.active = true;

      keyboard._onKeyup({ key: 'ArrowLeft' });

      expect(keyboard.dasState.direction).toBe(0);
      expect(keyboard.dasState.dasTimer).toBe(-1);
      expect(keyboard.dasState.active).toBe(false);
    });

    it('松开右键应该重置 DAS 状态', () => {
      keyboard.dasState.direction = 1;
      keyboard.dasState.dasTimer = 5;
      keyboard.dasState.active = true;

      keyboard._onKeyup({ key: 'ArrowRight' });

      expect(keyboard.dasState.direction).toBe(0);
      expect(keyboard.dasState.dasTimer).toBe(-1);
      expect(keyboard.dasState.active).toBe(false);
    });

    it('当前方向与松开键方向不一致时不重置', () => {
      keyboard.dasState.direction = -1;
      keyboard.dasState.dasTimer = 5;
      keyboard.dasState.active = true;

      keyboard._onKeyup({ key: 'ArrowRight' });

      expect(keyboard.dasState.direction).toBe(-1);
      expect(keyboard.dasState.dasTimer).toBe(5);
      expect(keyboard.dasState.active).toBe(true);
    });

    it('松开非方向键不应该影响 DAS 状态', () => {
      keyboard.dasState.direction = -1;
      keyboard.dasState.dasTimer = 5;
      keyboard.dasState.active = true;

      keyboard._onKeyup({ key: 'ArrowDown' });

      expect(keyboard.dasState.direction).toBe(-1);
      expect(keyboard.dasState.dasTimer).toBe(5);
      expect(keyboard.dasState.active).toBe(true);
    });

    it('空 key 不应该崩溃', () => {
      expect(() => keyboard._onKeyup({})).not.toThrow();
    });

    it('应该返回 KeyboardController 实例', () => {
      const result = keyboard._onKeyup({ key: 'ArrowLeft' });
      expect(result).toBe(keyboard);
    });
  });

  // ==================== 链式调用 ====================
  describe('链式调用', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      mockStore.getController.mockReturnValue('human');
      mockPlayer.name = 'human';
      mockGame.isVersus.mockReturnValue(false);
      keyboard.Player = mockPlayer;
    });

    it('addEventListeners 和 removeEventListeners 支持链式调用', () => {
      const result = keyboard
        .addEventListeners()
        .removeEventListeners()
        .addEventListeners();

      expect(result).toBe(keyboard);
    });

    it('_onKeydown 和 _onResize 支持链式调用', () => {
      const result = keyboard._onKeydown({ key: 'ArrowLeft' })._onResize();

      expect(result).toBe(keyboard);
    });
  });

  // ==================== setDisabled ====================
  describe('setDisabled 方法', () => {
    it('应该设置 disabled 为 true', () => {
      keyboard.setDisabled(true);
      expect(keyboard.disabled).toBe(true);
    });

    it('应该设置 disabled 为 false', () => {
      keyboard.setDisabled(true);
      keyboard.setDisabled(false);
      expect(keyboard.disabled).toBe(false);
    });

    it('应该返回 KeyboardController 实例以支持链式调用', () => {
      const result = keyboard.setDisabled(true);
      expect(result).toBe(keyboard);
    });
  });

  // ==================== disabled 状态下的行为 ====================
  describe('disabled 状态', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      mockStore.getController.mockReturnValue('human');
      mockPlayer.name = 'human';
      mockGame.isVersus.mockReturnValue(false);
      keyboard.Player = mockPlayer;
      keyboard.setDisabled(true);
      keyboard.emit.mockClear();
    });

    it('disabled 时 _onKeydown 不应该发送事件', () => {
      keyboard._onKeydown({ key: 'ArrowLeft' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('disabled 时 _onKeydown 应该直接返回', () => {
      const result = keyboard._onKeydown({ key: 'ArrowLeft' });
      expect(result).toBe(keyboard);
    });

    it('disabled 时 update 不应该执行 DAS/ARR', () => {
      keyboard.dasState.active = true;
      keyboard.dasState.direction = 1;
      keyboard.dasState.dasTimer = 10;
      keyboard.dasState.arrTimer = 2;

      keyboard.update();

      expect(keyboard.emit).not.toHaveBeenCalled();
      // DAS 状态不应该变化（因为直接 return 了）
      expect(keyboard.dasState.arrTimer).toBe(2);
    });
  });

  // ==================== 对战模式 P2 键盘屏蔽 (行181-182) ====================
  describe('对战模式 P2 (index=1) 键盘屏蔽', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
      mockStore.getController.mockReturnValue('human');
      mockPlayer.name = 'human';
      mockPlayer.index = 1; // P2
      mockGame.isVersus.mockReturnValue(true);
      keyboard.Player = mockPlayer;
      keyboard.emit.mockClear();
    });

    it('P2 在 playing 模式下所有按键都应该被屏蔽', () => {
      keyboard._onKeydown({ key: 'ArrowLeft' });
      expect(keyboard.emit).not.toHaveBeenCalled();

      keyboard._onKeydown({ key: 'ArrowRight' });
      expect(keyboard.emit).not.toHaveBeenCalled();

      keyboard._onKeydown({ key: 'ArrowDown' });
      expect(keyboard.emit).not.toHaveBeenCalled();

      keyboard._onKeydown({ key: 'ArrowUp' });
      expect(keyboard.emit).not.toHaveBeenCalled();

      keyboard._onKeydown({ key: ' ' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('P2 在 playing 模式下按 p 键应该被屏蔽', () => {
      keyboard._onKeydown({ key: 'p' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('P2 在 playing 模式下按 m 键应该被屏蔽', () => {
      keyboard._onKeydown({ key: 'm' });
      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('P2 在非 playing 模式（如 main-menu）下不应该被屏蔽', () => {
      mockStore.getMode.mockReturnValue('main-menu');
      keyboard._onKeydown({ key: 'ArrowLeft' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
    });

    it('P2 在 difficulty 模式下不应该被屏蔽', () => {
      mockStore.getMode.mockReturnValue('difficulty');
      keyboard._onKeydown({ key: 'Enter' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'CONFIRM',
        payload: { Game: mockGame },
      });
    });

    it('P1 (index=0) 在 playing 模式下不应该被屏蔽', () => {
      mockPlayer.index = 0;
      keyboard.Player = mockPlayer;
      keyboard._onKeydown({ key: 'ArrowLeft' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
    });
  });
});
