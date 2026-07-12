/** @jest-environment jsdom */
import ElapsedTimer from '@/lib/runtime/elapsed-timer.js';

// Mock isElement
jest.mock('@/lib/utils/types/is-element.js', () => {
  return jest.fn();
});

// Mock Base class
jest.mock('@/lib/core/index.js', () => {
  return jest.fn().mockImplementation(function (options) {
    Object.assign(this, options);
  });
});

import isElement from '@/lib/utils/types/is-element.js';

describe('ElapsedTimer', () => {
  let mockScheduler;
  let mockStore;
  let mockContainer;
  let intervalCallbacks;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // 配置 isElement mock - 在 jsdom 环境中判断 DOM 元素
    isElement.mockImplementation((element) => {
      return element && typeof element === 'object' && element.nodeType === 1;
    });

    // 用于存储 Scheduler.interval 注册的回调
    intervalCallbacks = {};

    // 创建 mock Scheduler
    mockScheduler = {
      interval: jest.fn((callback, delay) => {
        const id = `interval-${Math.random().toString(36).substr(2, 9)}`;
        intervalCallbacks[id] = callback;
        return id;
      }),
      cancel: jest.fn((id) => {
        delete intervalCallbacks[id];
      }),
    };

    // 创建 mock Store
    mockStore = {
      setElapsedTime: jest.fn(),
      setSessionTime: jest.fn(),
    };

    // 使用真实的 DOM 元素作为容器
    mockContainer = document.createElement('div');

    // 重置 intervalCallbacks
    intervalCallbacks = {};
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ==================== 构造函数和初始化 ====================
  describe('构造函数和初始化', () => {
    it('应该成功创建实例', () => {
      const timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      expect(timer).toBeInstanceOf(ElapsedTimer);
      // 验证 isElement 被调用
      expect(isElement).toHaveBeenCalledWith(mockContainer);
    });

    it('应该初始化所有内部状态', () => {
      const timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      expect(timer.elapsedSeconds).toBe(0);
      expect(timer.sessionSeconds).toBe(0);
      expect(timer.elapsedId).toBeNull();
      expect(timer.isRunning).toBe(false);
    });

    it('应该接受 DOM 元素作为容器', () => {
      const timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      expect(timer.container).toBe(mockContainer);
    });

    it('应该接受 ID 字符串作为容器（通过 querySelector）', () => {
      // 配置 isElement 返回 false，强制走 querySelector 分支
      isElement.mockReturnValue(false);

      const mockDomElement = document.createElement('div');
      mockDomElement.id = 'human-0-timer-display';
      document.body.appendChild(mockDomElement);

      const timer = new ElapsedTimer({
        element: 'timer-display',
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      expect(timer.container).toBe(mockDomElement);

      // 清理
      document.body.removeChild(mockDomElement);
    });

    it('应该自动启动会话计时器', () => {
      new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      expect(mockScheduler.interval).toHaveBeenCalledWith(
        expect.any(Function),
        1000,
      );
    });

    it('会话计时器应该每秒递增 sessionSeconds', () => {
      const timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      expect(timer.sessionSeconds).toBe(0);

      // 获取会话计时器回调（第一个注册的 interval）
      const sessionCallback = Object.values(intervalCallbacks)[0];

      // 触发回调
      sessionCallback();
      expect(mockStore.setSessionTime).toHaveBeenCalledWith(1);

      // 模拟 3 秒后
      sessionCallback();
      sessionCallback();

      expect(timer.sessionSeconds).toBe(3);
      expect(mockStore.setSessionTime).toHaveBeenCalledWith(3);
    });
  });

  // ==================== padZero ====================
  describe('padZero', () => {
    let timer;

    beforeEach(() => {
      timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });
    });

    it('应该将小于 10 的数字前面补零', () => {
      expect(timer.padZero(0)).toBe('00');
      expect(timer.padZero(5)).toBe('05');
      expect(timer.padZero(9)).toBe('09');
    });

    it('应该保持 10 及以上的数字不变', () => {
      expect(timer.padZero(10)).toBe('10');
      expect(timer.padZero(59)).toBe('59');
      expect(timer.padZero(99)).toBe('99');
    });

    it('应该返回字符串类型', () => {
      expect(typeof timer.padZero(5)).toBe('string');
      expect(typeof timer.padZero(15)).toBe('string');
    });
  });

  // ==================== formatTime ====================
  describe('formatTime', () => {
    let timer;

    beforeEach(() => {
      timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });
    });

    it('应该将 0 秒格式化为 "00:00:00"', () => {
      expect(timer.formatTime(0)).toBe('00:00:00');
    });

    it('应该正确格式化秒数', () => {
      expect(timer.formatTime(5)).toBe('00:00:05');
      expect(timer.formatTime(30)).toBe('00:00:30');
      expect(timer.formatTime(59)).toBe('00:00:59');
    });

    it('应该正确格式化分钟', () => {
      expect(timer.formatTime(60)).toBe('00:01:00');
      expect(timer.formatTime(65)).toBe('00:01:05');
      expect(timer.formatTime(125)).toBe('00:02:05');
      expect(timer.formatTime(3599)).toBe('00:59:59');
    });

    it('应该正确格式化小时', () => {
      expect(timer.formatTime(3600)).toBe('01:00:00');
      expect(timer.formatTime(3665)).toBe('01:01:05');
      expect(timer.formatTime(7325)).toBe('02:02:05');
    });

    it('应该处理大于 100 小时的时间', () => {
      expect(timer.formatTime(360000)).toBe('100:00:00');
    });

    it('应该始终返回 HH:mm:ss 格式', () => {
      const result = timer.formatTime(12345);
      expect(result).toMatch(/^\d{2,}:\d{2}:\d{2}$/);
    });
  });

  // ==================== render ====================
  describe('render', () => {
    let timer;

    beforeEach(() => {
      timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });
    });

    it('应该将格式化后的时间渲染到容器中', () => {
      timer.elapsedSeconds = 65;
      timer.render();

      expect(timer.container.textContent).toBe('00:01:05');
    });

    it('应该在 elapsedSeconds 为 0 时渲染 "00:00:00"', () => {
      timer.elapsedSeconds = 0;
      timer.render();

      expect(timer.container.textContent).toBe('00:00:00');
    });
  });

  // ==================== start ====================
  describe('start', () => {
    let timer;

    beforeEach(() => {
      timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });
    });

    it('应该启动游戏计时器', () => {
      timer.start();

      expect(timer.isRunning).toBe(true);
      expect(mockScheduler.interval).toHaveBeenCalledTimes(2); // 会话 + 游戏
    });

    it('应该设置 elapsedId', () => {
      timer.start();

      expect(timer.elapsedId).not.toBeNull();
    });

    it('如果已经在运行，不应该重复启动', () => {
      timer.start();
      const firstElapsedId = timer.elapsedId;

      timer.start();

      expect(timer.elapsedId).toBe(firstElapsedId);
      expect(mockScheduler.interval).toHaveBeenCalledTimes(2);
    });

    it('游戏计时器应该每秒递增 elapsedSeconds', () => {
      timer.start();

      expect(timer.elapsedSeconds).toBe(0);

      const callbacks = Object.values(intervalCallbacks);
      const gameCallback = callbacks[callbacks.length - 1];

      for (let i = 0; i < 5; i++) {
        gameCallback();
      }

      expect(timer.elapsedSeconds).toBe(5);
    });

    it('游戏计时器应该每秒更新 Store', () => {
      timer.start();

      const callbacks = Object.values(intervalCallbacks);
      const gameCallback = callbacks[callbacks.length - 1];

      gameCallback();
      gameCallback();

      expect(mockStore.setElapsedTime).toHaveBeenCalledWith(1);
      expect(mockStore.setElapsedTime).toHaveBeenCalledWith(2);
    });

    it('游戏计时器应该每秒调用 render', () => {
      timer.start();
      jest.spyOn(timer, 'render');

      const callbacks = Object.values(intervalCallbacks);
      const gameCallback = callbacks[callbacks.length - 1];

      gameCallback();

      expect(timer.render).toHaveBeenCalled();
    });

    it('应该正确格式化并渲染游戏时间', () => {
      timer.start();

      const callbacks = Object.values(intervalCallbacks);
      const gameCallback = callbacks[callbacks.length - 1];

      for (let i = 0; i < 65; i++) {
        gameCallback();
      }

      expect(mockContainer.textContent).toBe('00:01:05');
    });
  });

  // ==================== pause ====================
  describe('pause', () => {
    let timer;

    beforeEach(() => {
      timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });
    });

    it('应该暂停游戏计时器', () => {
      timer.start();
      timer.pause();

      expect(timer.isRunning).toBe(false);
    });

    it('应该取消游戏计时器的 interval', () => {
      timer.start();
      const elapsedId = timer.elapsedId;

      timer.pause();

      expect(mockScheduler.cancel).toHaveBeenCalledWith(elapsedId);
    });

    it('应该将 elapsedId 设置为 null', () => {
      timer.start();
      timer.pause();

      expect(timer.elapsedId).toBeNull();
    });

    it('如果已经暂停，不应该重复取消', () => {
      timer.pause();

      expect(mockScheduler.cancel).not.toHaveBeenCalled();
    });

    it('暂停后计时应该停止', () => {
      timer.start();

      const callbacks = Object.values(intervalCallbacks);
      const gameCallback = callbacks[callbacks.length - 1];

      for (let i = 0; i < 5; i++) {
        gameCallback();
      }

      expect(timer.elapsedSeconds).toBe(5);

      timer.pause();
      expect(timer.elapsedSeconds).toBe(5);
    });

    it('暂停后会话计时应该继续运行', () => {
      timer.start();
      timer.pause();

      const sessionCallback = Object.values(intervalCallbacks)[0];
      const sessionSecondsBefore = timer.sessionSeconds;

      sessionCallback();
      sessionCallback();

      expect(timer.sessionSeconds).toBe(sessionSecondsBefore + 2);
    });

    it('pause 后再次 start 应该恢复计时', () => {
      timer.start();

      const callbacks = Object.values(intervalCallbacks);
      let gameCallback = callbacks[callbacks.length - 1];

      for (let i = 0; i < 5; i++) {
        gameCallback();
      }

      timer.pause();
      expect(timer.elapsedSeconds).toBe(5);

      timer.start();
      expect(timer.isRunning).toBe(true);

      const newCallbacks = Object.values(intervalCallbacks);
      gameCallback = newCallbacks[newCallbacks.length - 1];

      for (let i = 0; i < 3; i++) {
        gameCallback();
      }

      expect(timer.elapsedSeconds).toBe(8);
    });
  });

  // ==================== reset ====================
  describe('reset', () => {
    let timer;

    beforeEach(() => {
      timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });
    });

    it('应该暂停游戏计时器', () => {
      timer.start();
      timer.reset();

      expect(timer.isRunning).toBe(false);
    });

    it('应该重置 elapsedSeconds 为 0', () => {
      timer.start();

      const callbacks = Object.values(intervalCallbacks);
      const gameCallback = callbacks[callbacks.length - 1];

      for (let i = 0; i < 10; i++) {
        gameCallback();
      }

      expect(timer.elapsedSeconds).toBe(10);

      timer.reset();
      expect(timer.elapsedSeconds).toBe(0);
    });

    it('应该更新 Store 中的游戏时间', () => {
      timer.start();

      const callbacks = Object.values(intervalCallbacks);
      const gameCallback = callbacks[callbacks.length - 1];

      for (let i = 0; i < 5; i++) {
        gameCallback();
      }

      timer.reset();

      expect(mockStore.setElapsedTime).toHaveBeenCalledWith(0);
    });

    it('应该渲染 "00:00:00"', () => {
      timer.start();

      const callbacks = Object.values(intervalCallbacks);
      const gameCallback = callbacks[callbacks.length - 1];

      for (let i = 0; i < 5; i++) {
        gameCallback();
      }

      timer.reset();

      expect(mockContainer.textContent).toBe('00:00:00');
    });

    it('不应该重置会话计时器', () => {
      const sessionCallback = Object.values(intervalCallbacks)[0];

      for (let i = 0; i < 10; i++) {
        sessionCallback();
      }

      const sessionSecondsBefore = timer.sessionSeconds;

      timer.reset();

      expect(timer.sessionSeconds).toBe(sessionSecondsBefore);
    });

    it('重置后可以再次启动', () => {
      timer.start();

      const callbacks = Object.values(intervalCallbacks);
      let gameCallback = callbacks[callbacks.length - 1];

      for (let i = 0; i < 5; i++) {
        gameCallback();
      }

      timer.reset();
      timer.start();

      const newCallbacks = Object.values(intervalCallbacks);
      gameCallback = newCallbacks[newCallbacks.length - 1];

      for (let i = 0; i < 3; i++) {
        gameCallback();
      }

      expect(timer.elapsedSeconds).toBe(3);
    });
  });

  // ==================== destroy ====================
  describe('destroy', () => {
    let timer;

    beforeEach(() => {
      timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });
    });

    it('应该取消游戏计时器', () => {
      timer.start();
      const elapsedId = timer.elapsedId;

      timer.destroy();

      expect(mockScheduler.cancel).toHaveBeenCalledWith(elapsedId);
    });

    it('应该取消会话计时器', () => {
      const sessionId = timer.sessionId;

      timer.destroy();

      expect(mockScheduler.cancel).toHaveBeenCalledWith(sessionId);
    });

    it('应该将 elapsedId 和 sessionId 设置为 null', () => {
      timer.start();
      timer.destroy();

      expect(timer.elapsedId).toBeNull();
      expect(timer.sessionId).toBeNull();
    });

    it('应该将 isRunning 设置为 false', () => {
      timer.start();
      timer.destroy();

      expect(timer.isRunning).toBe(false);
    });

    it('应该处理 elapsedId 已经为 null 的情况', () => {
      timer.destroy();

      expect(mockScheduler.cancel).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 获取器方法 ====================
  describe('获取器方法', () => {
    let timer;

    beforeEach(() => {
      timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });
    });

    describe('getElapsedTime', () => {
      it('应该返回格式化后的游戏耗时', () => {
        timer.elapsedSeconds = 65;
        expect(timer.getElapsedTime()).toBe('00:01:05');
      });

      it('应该返回字符串', () => {
        timer.elapsedSeconds = 0;
        expect(typeof timer.getElapsedTime()).toBe('string');
      });
    });

    describe('getElapsedSeconds', () => {
      it('应该返回游戏耗时的总秒数', () => {
        timer.elapsedSeconds = 125;
        expect(timer.getElapsedSeconds()).toBe(125);
      });

      it('应该返回数字', () => {
        expect(typeof timer.getElapsedSeconds()).toBe('number');
      });
    });

    describe('getSessionTime', () => {
      it('应该返回格式化后的会话时长', () => {
        timer.sessionSeconds = 3665;
        expect(timer.getSessionTime()).toBe('01:01:05');
      });

      it('应该返回字符串', () => {
        expect(typeof timer.getSessionTime()).toBe('string');
      });
    });

    describe('getSessionSeconds', () => {
      it('应该返回会话时长的总秒数', () => {
        timer.sessionSeconds = 200;
        expect(timer.getSessionSeconds()).toBe(200);
      });

      it('应该返回数字', () => {
        expect(typeof timer.getSessionSeconds()).toBe('number');
      });
    });
  });

  // ==================== 双计时器独立性 ====================
  describe('双计时器独立性', () => {
    let timer;

    beforeEach(() => {
      timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });
    });

    it('游戏计时器和会话计时器应该独立运行', () => {
      timer.start();

      const callbacks = Object.values(intervalCallbacks);
      const sessionCallback = callbacks[0];
      const gameCallback = callbacks[callbacks.length - 1];

      for (let i = 0; i < 3; i++) {
        gameCallback();
      }

      for (let i = 0; i < 5; i++) {
        sessionCallback();
      }

      expect(timer.elapsedSeconds).toBe(3);
      expect(timer.sessionSeconds).toBe(5);
    });

    it('暂停游戏不应该影响会话计时', () => {
      const sessionCallback = Object.values(intervalCallbacks)[0];

      for (let i = 0; i < 5; i++) {
        sessionCallback();
      }

      const sessionBefore = timer.sessionSeconds;

      timer.pause();

      for (let i = 0; i < 3; i++) {
        sessionCallback();
      }

      expect(timer.sessionSeconds).toBe(sessionBefore + 3);
    });

    it('重置游戏不应该影响会话计时', () => {
      const sessionCallback = Object.values(intervalCallbacks)[0];

      for (let i = 0; i < 10; i++) {
        sessionCallback();
      }

      const sessionBefore = timer.sessionSeconds;

      timer.reset();

      expect(timer.elapsedSeconds).toBe(0);
      expect(timer.sessionSeconds).toBe(sessionBefore);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('未启动时调用 pause 不应该报错', () => {
      const timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      expect(() => timer.pause()).not.toThrow();
    });

    it('未启动时调用 reset 不应该报错', () => {
      const timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      expect(() => timer.reset()).not.toThrow();
      expect(timer.elapsedSeconds).toBe(0);
    });

    it('多次 reset 不应该累积副作用', () => {
      const timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      timer.reset();
      timer.reset();
      timer.reset();

      expect(timer.elapsedSeconds).toBe(0);
      expect(timer.isRunning).toBe(false);
    });

    it('重复 destroy 不应该报错', () => {
      const timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      timer.start();
      timer.destroy();
      expect(() => timer.destroy()).not.toThrow();
    });

    it('应该处理 formatTime 的大数值输入', () => {
      const timer = new ElapsedTimer({
        element: mockContainer,
        Player: { name: 'human', index: 0 },
        Store: mockStore,
        Scheduler: mockScheduler,
      });

      const result = timer.formatTime(3599999);
      expect(result).toBe('999:59:59');
    });
  });
});
