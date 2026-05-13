/** @jest-environment jsdom */

import Keyboard from '@/lib/services/input/keyboard.js';

describe('Keyboard', () => {
  let keyboard;
  let mockGame;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = { id: 'test-game-uuid' };
    mockStore = {
      getMode: jest.fn().mockReturnValue('playing'),
    };

    keyboard = new Keyboard({
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
    it('应该正确创建 Keyboard 实例', () => {
      expect(keyboard).toBeDefined();
      expect(keyboard).toBeInstanceOf(Keyboard);
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

    it('应该返回 Keyboard 实例以支持链式调用', () => {
      const result = keyboard.addEventListeners();

      expect(result).toBe(keyboard);
    });
  });

  // ==================== removeEventListeners ====================
  describe('removeEventListeners 方法', () => {
    it('应该在 globalThis 上移除 resize 事件', () => {
      keyboard.addEventListeners();
      keyboard.removeEventListeners();

      expect(globalThis.removeEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );
    });

    it('应该在 document 上移除 keydown 事件', () => {
      keyboard.addEventListeners();
      keyboard.removeEventListeners();

      expect(document.removeEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      );
    });

    it('add 和 remove 应该使用相同的回调引用', () => {
      keyboard.addEventListeners();
      keyboard.removeEventListeners();

      const addResizeCallback = globalThis.addEventListener.mock.calls[0][1];
      const removeResizeCallback = globalThis.removeEventListener.mock.calls[0][1];

      expect(addResizeCallback).toBe(removeResizeCallback);
    });

    it('add 和 remove 的 keydown 回调应该是相同引用', () => {
      keyboard.addEventListeners();
      keyboard.removeEventListeners();

      const addKeydownCallback = document.addEventListener.mock.calls[0][1];
      const removeKeydownCallback = document.removeEventListener.mock.calls[0][1];

      expect(addKeydownCallback).toBe(removeKeydownCallback);
    });

    it('应该返回 Keyboard 实例以支持链式调用', () => {
      const result = keyboard.removeEventListeners();

      expect(result).toBe(keyboard);
    });
  });

  // ==================== _onResize ====================
  describe('_onResize 回调', () => {
    it('应该发送 ui:resize 事件', () => {
      keyboard._onResize();

      expect(keyboard.emit).toHaveBeenCalledWith(
        `ui:${mockGame.id}:resize`,
      );
    });

    it('应该返回 Keyboard 实例', () => {
      const result = keyboard._onResize();

      expect(result).toBe(keyboard);
    });
  });

  // ==================== _onKeydown 回调 ====================
  describe('_onKeydown 回调', () => {
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

    it('应该支持数字键 1（等级一）', () => {
      keyboard._onKeydown({ key: '1' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'LEVEL_ONE',
        payload: { Game: mockGame },
      });
    });

    it('应该支持字母键 e（简单难度）', () => {
      keyboard._onKeydown({ key: 'e' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'EASY',
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

    it('应该返回 Keyboard 实例', () => {
      const result = keyboard._onKeydown({ key: 'ArrowLeft' });

      expect(result).toBe(keyboard);
    });

    it('无效按键时也应该返回 Keyboard 实例', () => {
      const result = keyboard._onKeydown({ key: 'z' });

      expect(result).toBe(keyboard);
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

    it('replay 模式下无效按键不应该发送事件', () => {
      keyboard._onKeydown({ key: 'z' });

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
