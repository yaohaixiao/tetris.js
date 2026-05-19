/** @jest-environment jsdom */

import GAME from '@/lib/game/constants/game.js'
import KeyboardController from '@/lib/services/input/keyboard-controller.js';

describe('KeyboardController', () => {
  let keyboard;
  let mockGame;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = { id: 'test-game-uuid' };
    mockStore = {
      getMode: jest.fn().mockReturnValue('playing'),
      getController: jest.fn().mockReturnValue('human'),
    };

    keyboard = new KeyboardController({
      Game: mockGame,
      Store: mockStore,
    });

    jest.spyOn(keyboard, 'emit').mockImplementation(() => keyboard);
    jest.spyOn(globalThis, 'addEventListener');
    jest.spyOn(globalThis, 'removeEventListener');
    jest.spyOn(document, 'addEventListener');
    jest.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    globalThis.addEventListener.mockRestore();
    globalThis.removeEventListener.mockRestore();
    document.addEventListener.mockRestore();
    document.removeEventListener.mockRestore();
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
  });

  // ==================== addEventListeners ====================
  describe('addEventListeners 方法', () => {
    it('应该在 globalThis 上注册 resize 事件', () => {
      keyboard.addEventListeners();

      expect(globalThis.addEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );
    });

    it('应该在 document 上注册 keydown 事件', () => {
      keyboard.addEventListeners();

      expect(document.addEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
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
      keyboard.addEventListeners();
      keyboard.removeEventListeners();

      expect(globalThis.removeEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );
      expect(document.removeEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      );
    });

    it('add 和 remove 应该使用相同的回调引用', () => {
      keyboard.addEventListeners();
      keyboard.removeEventListeners();

      const addResizeCb = globalThis.addEventListener.mock.calls[0][1];
      const removeResizeCb = globalThis.removeEventListener.mock.calls[0][1];

      expect(addResizeCb).toBe(removeResizeCb);
    });

    it('应该返回 KeyboardController 实例以支持链式调用', () => {
      const result = keyboard.removeEventListeners();

      expect(result).toBe(keyboard);
    });
  });

  // ==================== _onResize ====================
  describe('_onResize 回调', () => {
    it('应该发送 ui:resize 事件', () => {
      keyboard._onResize();

      expect(keyboard.emit).toHaveBeenCalledWith(`ui:${mockGame.id}:resize`);
    });

    it('应该返回 KeyboardController 实例', () => {
      const result = keyboard._onResize();

      expect(result).toBe(keyboard);
    });
  });

  // ==================== _onKeydown - human 模式 ====================
  describe('_onKeydown 回调（human 控制）', () => {
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

    it('未映射的按键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'z' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('空 key 不应该发送事件', () => {
      keyboard._onKeydown({ key: '' });

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
      mockStore.getController.mockReturnValue('ai');
    });

    it('AI 控制时 s 键（SWITCH_CONTROLLER）应该可以发送事件', () => {
      keyboard._onKeydown({ key: 's' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'SWITCH_CONTROLLER',
        payload: { Game: mockGame },
      });
    });

    it('AI 控制时 m 键应该可以发送事件', () => {
      keyboard._onKeydown({ key: 'm' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'TOGGLE_MUSIC',
        payload: { Game: mockGame },
      });
    });

    it('AI 控制时 p 键应该可以发送事件', () => {
      keyboard._onKeydown({ key: 'p' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'TOGGLE_PAUSED',
        payload: { Game: mockGame },
      });
    });

    it('AI 控制时 r 键应该可以发送事件', () => {
      keyboard._onKeydown({ key: 'r' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'RESTART',
        payload: { Game: mockGame },
      });
    });

    it('AI 控制时方向键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'ArrowLeft' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('AI 控制时空格键不应该发送事件', () => {
      keyboard._onKeydown({ key: ' ' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('AI 控制时回车键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'Enter' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('非 playing 模式下 AI 控制的限制不生效', () => {
      mockStore.getMode.mockReturnValue('paused');

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
    });

    it('replay 模式下大多数按键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'ArrowLeft' });

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

    it('replay 模式下 s 键不应该发送事件', () => {
      keyboard._onKeydown({ key: 's' });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== 按键映射 ====================
  describe('按键映射', () => {
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

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('event.key 为 undefined 时不应该发送事件', () => {
      keyboard._onKeydown({ key: undefined });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('event.key 为 null 时不应该发送事件', () => {
      keyboard._onKeydown({ key: null });

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('event 为空对象时不应该发送事件', () => {
      keyboard._onKeydown({});

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('链式调用 addEventListeners 和 removeEventListeners', () => {
      const result = keyboard
        .addEventListeners()
        .removeEventListeners()
        .addEventListeners();

      expect(result).toBe(keyboard);
    });

    it('链式调用 _onKeydown 和 _onResize', () => {
      const result = keyboard._onKeydown({ key: 'ArrowLeft' })._onResize();

      expect(result).toBe(keyboard);
    });
  });
});
