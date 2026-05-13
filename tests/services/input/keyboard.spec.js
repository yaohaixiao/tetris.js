/** @jest-environment jsdom */

import Keyboard from '@/lib/services/input/keyboard.js';

// Mock resolveKeyboardAction 的映射表
// 通过 mock 模块来隔离原生依赖
jest.mock('@/lib/services/input/keyboard.js', () => {
  const originalModule = jest.requireActual('@/lib/services/input/keyboard.js');

  return {
    __esModule: true,
    default: originalModule.default,
  };
});

describe('Keyboard', () => {
  let keyboard;
  let mockGame;
  let mockStore;

  // 模拟原生事件
  let addEventListenerSpy;
  let removeEventListenerSpy;
  let documentAddEventListenerSpy;
  let documentRemoveEventListenerSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = { id: 'test-game-uuid' };
    mockStore = {
      getMode: jest.fn().mockReturnValue('playing'),
    };

    // Spy 原生事件监听
    addEventListenerSpy = jest.spyOn(globalThis, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(globalThis, 'removeEventListener');
    documentAddEventListenerSpy = jest.spyOn(document, 'addEventListener');
    documentRemoveEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    keyboard = new Keyboard({
      Game: mockGame,
      Store: mockStore,
    });

    // Mock emit 方法
    jest.spyOn(keyboard, 'emit').mockImplementation(() => keyboard);
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
    documentAddEventListenerSpy.mockRestore();
    documentRemoveEventListenerSpy.mockRestore();
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

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );
    });

    it('应该在 document 上注册 keydown 事件', () => {
      keyboard.addEventListeners();

      expect(documentAddEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      );
    });

    it('应该返回 Keyboard 实例以支持链式调用', () => {
      const result = keyboard.addEventListeners();

      expect(result).toBe(keyboard);
    });

    it('多次调用应该注册多次事件', () => {
      keyboard.addEventListeners();
      keyboard.addEventListeners();

      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(documentAddEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });

  // ==================== removeEventListeners ====================
  describe('removeEventListeners 方法', () => {
    it('应该在 globalThis 上移除 resize 事件', () => {
      keyboard.addEventListeners();
      keyboard.removeEventListeners();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );
    });

    it('应该在 document 上移除 keydown 事件', () => {
      keyboard.addEventListeners();
      keyboard.removeEventListeners();

      expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      );
    });

    it('add 和 remove 应该使用相同的回调引用', () => {
      keyboard.addEventListeners();
      keyboard.removeEventListeners();

      const addResizeCallback = addEventListenerSpy.mock.calls[0][1];
      const removeResizeCallback = removeEventListenerSpy.mock.calls[0][1];

      expect(addResizeCallback).toBe(removeResizeCallback);
    });

    it('add 和 remove 的 keydown 回调应该是相同引用', () => {
      keyboard.addEventListeners();
      keyboard.removeEventListeners();

      const addKeydownCallback = documentAddEventListenerSpy.mock.calls[0][1];
      const removeKeydownCallback =
        documentRemoveEventListenerSpy.mock.calls[0][1];

      expect(addKeydownCallback).toBe(removeKeydownCallback);
    });

    it('应该返回 Keyboard 实例以支持链式调用', () => {
      const result = keyboard.removeEventListeners();

      expect(result).toBe(keyboard);
    });

    it('未注册时调用不应该报错', () => {
      expect(() => {
        keyboard.removeEventListeners();
      }).not.toThrow();
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
      const event = { key: 'ArrowLeft' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'MOVE_LEFT',
        payload: {
          Game: mockGame,
        },
      });
    });

    it('应该支持空格键', () => {
      const event = { key: ' ' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'DROP',
        payload: {
          Game: mockGame,
        },
      });
    });

    it('应该支持字母键 m（切换音乐）', () => {
      const event = { key: 'm' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'TOGGLE_MUSIC',
        payload: {
          Game: mockGame,
        },
      });
    });

    it('应该支持字母键 p（暂停）', () => {
      const event = { key: 'p' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'TOGGLE_PAUSED',
        payload: {
          Game: mockGame,
        },
      });
    });

    it('应该支持字母键 r（重启）', () => {
      const event = { key: 'r' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'RESTART',
        payload: {
          Game: mockGame,
        },
      });
    });

    it('应该支持数字键 1（等级一）', () => {
      const event = { key: '1' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'LEVEL_ONE',
        payload: {
          Game: mockGame,
        },
      });
    });

    it('应该支持字母键 e（简单难度）', () => {
      const event = { key: 'e' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'EASY',
        payload: {
          Game: mockGame,
        },
      });
    });

    it('应该支持回车键（确认）', () => {
      const event = { key: 'Enter' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'CONFIRM',
        payload: {
          Game: mockGame,
        },
      });
    });

    it('未映射的按键不应该发送事件', () => {
      const event = { key: 'z' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('空 key 不应该发送事件', () => {
      const event = { key: '' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('应该处理大写字母', () => {
      const event = { key: 'R' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'RESTART',
        payload: {
          Game: mockGame,
        },
      });
    });

    it('应该返回 Keyboard 实例', () => {
      const event = { key: 'ArrowLeft' };

      const result = keyboard._onKeydown(event);

      expect(result).toBe(keyboard);
    });

    it('无效按键时也应该返回 Keyboard 实例', () => {
      const event = { key: 'z' };

      const result = keyboard._onKeydown(event);

      expect(result).toBe(keyboard);
    });
  });

  // ==================== replay 模式下的行为 ====================
  describe('replay 模式下的行为', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('replay');
    });

    it('replay 模式下大多数按键不应该发送事件', () => {
      const event = { key: 'ArrowLeft' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('replay 模式下回车键仍然可以发送事件', () => {
      const event = { key: 'Enter' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'CONFIRM',
        payload: {
          Game: mockGame,
        },
      });
    });

    it('replay 模式下无效按键不应该发送事件', () => {
      const event = { key: 'z' };

      keyboard._onKeydown(event);

      expect(keyboard.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== 各种按键映射 ====================
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
        const event = { key };

        keyboard._onKeydown(event);

        expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
          device: 'keyboard',
          action: expected,
          payload: {
            Game: mockGame,
          },
        });
      });
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('event.key 为 undefined 时不应该发送事件', () => {
      const event = { key: undefined };

      keyboard._onKeydown(event);

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('event.key 为 null 时不应该发送事件', () => {
      const event = { key: null };

      keyboard._onKeydown(event);

      expect(keyboard.emit).not.toHaveBeenCalled();
    });

    it('event 为空对象时不应该发送事件', () => {
      const event = {};

      keyboard._onKeydown(event);

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

  // ==================== 集成测试 ====================
  describe('集成测试', () => {
    it('注册事件后，触发 resize 应该发送事件', () => {
      keyboard.addEventListeners();

      // 获取注册的回调
      const resizeCallback = addEventListenerSpy.mock.calls[0][1];

      // 模拟触发 resize
      resizeCallback();

      expect(keyboard.emit).toHaveBeenCalledWith(
        `ui:${mockGame.id}:resize`,
      );
    });

    it('注册事件后，触发 keydown 应该发送事件', () => {
      keyboard.addEventListeners();

      // 获取注册的回调
      const keydownCallback = documentAddEventListenerSpy.mock.calls[0][1];

      // 模拟触发 keydown
      keydownCallback({ key: 'ArrowLeft' });

      expect(keyboard.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'MOVE_LEFT',
        payload: {
          Game: mockGame,
        },
      });
    });
  });
});
