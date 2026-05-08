/** @jest-environment jsdom */
import Keyboard from '@/lib/services/input/keyboard';
import EventBus from '@/lib/core/event-bus';

jest.mock('@/lib/core/event-bus', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

describe('Keyboard', () => {
  let keyboard;

  beforeEach(() => {
    jest.clearAllMocks();
    keyboard = new Keyboard();
  });

  // ========== 构造函数 ==========
  describe('constructor', () => {
    test('初始 state 为空对象', () => {
      expect(keyboard.state).toEqual({});
    });
  });

  // ========== update ==========
  describe('update', () => {
    test('更新 state', () => {
      keyboard.update({ mode: 'playing', level: 1 });
      expect(keyboard.state).toEqual({ mode: 'playing', level: 1 });
    });

    test('多次 update 覆盖 state', () => {
      keyboard.update({ mode: 'playing' });
      keyboard.update({ mode: 'paused' });
      expect(keyboard.state.mode).toBe('paused');
    });
  });

  // ========== addEventListeners / removeEventListeners ==========
  describe('事件绑定/解绑', () => {
    test('addEventListeners 绑定 resize 和 keydown', () => {
      const addSpy = jest.spyOn(globalThis, 'addEventListener');
      const docAddSpy = jest.spyOn(document, 'addEventListener');

      keyboard.addEventListeners();

      expect(addSpy).toHaveBeenCalledWith('resize', keyboard._onResize);
      expect(docAddSpy).toHaveBeenCalledWith('keydown', keyboard._onKeydown);
    });

    test('removeEventListeners 解绑 resize 和 keydown', () => {
      const removeSpy = jest.spyOn(globalThis, 'removeEventListener');
      const docRemoveSpy = jest.spyOn(document, 'removeEventListener');

      keyboard.removeEventListeners();

      expect(removeSpy).toHaveBeenCalledWith('resize', keyboard._onResize);
      expect(docRemoveSpy).toHaveBeenCalledWith('keydown', keyboard._onKeydown);
    });

    test('链式调用', () => {
      const result = keyboard.addEventListeners();
      expect(result).toBe(keyboard);
    });
  });

  // ========== _onResize ==========
  describe('_onResize', () => {
    test('emit ui:resize 事件', () => {
      keyboard._onResize();
      expect(EventBus.emit).toHaveBeenCalledWith('ui:resize');
    });

    test('链式调用返回 this', () => {
      const result = keyboard._onResize();
      expect(result).toBe(keyboard);
    });
  });

  // ========== _onKeydown ==========
  describe('_onKeydown', () => {
    test('方向键 → MOVE_LEFT', () => {
      keyboard.state = { mode: 'playing' };
      keyboard._onKeydown({ key: 'ArrowLeft' });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'MOVE_LEFT',
        payload: {},
      });
    });

    test('方向键 → MOVE_RIGHT', () => {
      keyboard.state = { mode: 'playing' };
      keyboard._onKeydown({ key: 'ArrowRight' });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'MOVE_RIGHT',
        payload: {},
      });
    });

    test('空格 → DROP', () => {
      keyboard.state = { mode: 'playing' };
      keyboard._onKeydown({ key: ' ' });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'DROP',
        payload: {},
      });
    });

    test('p → TOGGLE_PAUSE', () => {
      keyboard.state = { mode: 'playing' };
      keyboard._onKeydown({ key: 'p' });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'TOGGLE_PAUSE',
        payload: {},
      });
    });

    test('r → RESTART', () => {
      keyboard.state = { mode: 'game-over' };
      keyboard._onKeydown({ key: 'r' });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'RESTART',
        payload: {},
      });
    });

    test('数字键 → LEVEL_ONE', () => {
      keyboard.state = { mode: 'difficulty' };
      keyboard._onKeydown({ key: '1' });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'LEVEL_ONE',
        payload: {},
      });
    });

    test('enter → CONFIRM', () => {
      keyboard.state = { mode: 'main-menu' };
      keyboard._onKeydown({ key: 'Enter' });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'CONFIRM',
        payload: {},
      });
    });

    test('e → EASY', () => {
      keyboard.state = { mode: 'difficulty' };
      keyboard._onKeydown({ key: 'e' });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'EASY',
        payload: {},
      });
    });

    test('b → BACK', () => {
      keyboard.state = { mode: 'difficulty' };
      keyboard._onKeydown({ key: 'b' });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'BACK',
        payload: {},
      });
    });

    // ========== 拦截逻辑 ==========
    test('replay 模式下只允许 enter', () => {
      keyboard.state = { mode: 'replay' };
      keyboard._onKeydown({ key: 'ArrowLeft' });
      expect(EventBus.emit).not.toHaveBeenCalled();
    });

    test('replay 模式下 enter 仍然有效', () => {
      keyboard.state = { mode: 'replay' };
      keyboard._onKeydown({ key: 'Enter' });
      expect(EventBus.emit).toHaveBeenCalledWith('dispatch:input', {
        device: 'keyboard',
        action: 'CONFIRM',
        payload: {},
      });
    });

    test('未映射的键不触发 emit', () => {
      keyboard.state = { mode: 'playing' };
      keyboard._onKeydown({ key: 'z' });
      expect(EventBus.emit).not.toHaveBeenCalled();
    });

    test('空 key 不触发', () => {
      keyboard.state = { mode: 'playing' };
      keyboard._onKeydown({ key: '' });
      expect(EventBus.emit).not.toHaveBeenCalled();
    });

    test('链式调用', () => {
      keyboard.state = { mode: 'playing' };
      const result = keyboard._onKeydown({ key: 'ArrowLeft' });
      expect(result).toBe(keyboard);
    });
  });
});
