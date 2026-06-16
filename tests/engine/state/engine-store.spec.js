/**
 * @file EngineStore 单元测试
 */

import EngineStore from '@/lib/engine/state/engine-store.js';
import EngineState from '@/lib/engine/state/engine-state.js';

// Mock extend 工具函数
jest.mock('@/lib/utils/oop/extend.js', () => {
  return jest.fn((defaults, options) => ({ ...defaults, ...options }));
});

// Mock structuredClone 实现深拷贝隔离
global.structuredClone = jest.fn((obj) => JSON.parse(JSON.stringify(obj)));

describe('EngineStore', () => {
  let store;

  beforeEach(() => {
    store = new EngineStore();
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    test('应该正确创建实例', () => {
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(EngineStore);
    });

    test('应该自动调用 initialize', () => {
      expect(store.state).toBeDefined();
    });

    test('默认状态应该包含 EngineState 的所有字段', () => {
      const state = store.getState();
      expect(state.Mode).toBe(EngineState.Mode);
      expect(state.Players).toEqual(EngineState.Players);
      expect(state.victoryScore).toBe(EngineState.victoryScore);
      expect(state.Block).toBeDefined();
      expect(state.Elements).toBeDefined();
    });

    test('传入的 options 应该覆盖默认值', () => {
      const customStore = new EngineStore({ Mode: 'single', victoryScore: 10 });
      expect(customStore.getMode()).toBe('single');
      expect(customStore.getVictoryScore()).toBe(10);
    });

    test('传入空对象应该使用默认值', () => {
      const defaultStore = new EngineStore({});
      expect(defaultStore.getMode()).toBe(EngineState.Mode);
    });

    test('不传参数应该使用默认值', () => {
      const defaultStore = new EngineStore();
      expect(defaultStore.getMode()).toBe(EngineState.Mode);
    });

    test('initialize 应该调用 structuredClone 深拷贝', () => {
      expect(structuredClone).toHaveBeenCalled();
    });

    test('传入的 options 原对象不应该被修改', () => {
      const options = { Mode: 'single' };
      new EngineStore(options);
      expect(options.Mode).toBe('single');
    });
  });

  // ==================== getState ====================
  describe('getState', () => {
    test('应该返回状态对象', () => {
      const state = store.getState();
      expect(state).toBe(store.state);
    });

    test('返回的状态应该包含所有必要字段', () => {
      const state = store.getState();
      expect(state).toHaveProperty('Mode');
      expect(state).toHaveProperty('Players');
      expect(state).toHaveProperty('victoryScore');
      expect(state).toHaveProperty('Block');
      expect(state).toHaveProperty('Elements');
    });

    test('getState 返回内部状态引用', () => {
      const state = store.getState();
      expect(state).toBe(store.state);
    });
  });

  // ==================== isVersus ====================
  describe('isVersus', () => {
    test('Mode 为 versus 时应该返回 true', () => {
      store.setMode('versus');
      expect(store.isVersus()).toBe(true);
    });

    test('Mode 为 single 时应该返回 false', () => {
      store.setMode('single');
      expect(store.isVersus()).toBe(false);
    });

    test('Mode 为其他值时应该返回 false', () => {
      store.setMode('multiplayer');
      expect(store.isVersus()).toBe(false);
    });
  });

  // ==================== Mode 管理 ====================
  describe('getMode / setMode', () => {
    test('应该返回默认 Mode', () => {
      expect(store.getMode()).toBe(EngineState.Mode);
    });

    test('setMode 应该正确更新 Mode', () => {
      store.setMode('single');
      expect(store.getMode()).toBe('single');

      store.setMode('versus');
      expect(store.getMode()).toBe('versus');
    });

    test('Mode 切换应该反映在 isVersus 中', () => {
      store.setMode('versus');
      expect(store.isVersus()).toBe(true);

      store.setMode('single');
      expect(store.isVersus()).toBe(false);
    });
  });

  // ==================== victoryScore 管理 ====================
  describe('getVictoryScore / setVictoryScore', () => {
    test('应该返回默认 victoryScore', () => {
      expect(store.getVictoryScore()).toBe(EngineState.victoryScore);
    });

    test('setVictoryScore 应该正确更新', () => {
      store.setVictoryScore(10);
      expect(store.getVictoryScore()).toBe(10);

      store.setVictoryScore(30);
      expect(store.getVictoryScore()).toBe(30);
    });

    test('victoryScore 可以为 0', () => {
      store.setVictoryScore(0);
      expect(store.getVictoryScore()).toBe(0);
    });
  });

  // ==================== Block 配置管理 ====================
  describe('getBlockStyle / setBlockStyle', () => {
    test('应该返回默认 Block.style', () => {
      expect(store.getBlockStyle()).toBe(EngineState.Block.style);
    });

    test('setBlockStyle 应该正确更新', () => {
      store.setBlockStyle('classic');
      expect(store.getBlockStyle()).toBe('classic');

      store.setBlockStyle('pixel');
      expect(store.getBlockStyle()).toBe('pixel');
    });
  });

  describe('getBlockPattern / setBlockPattern', () => {
    test('应该返回默认 Block.pattern', () => {
      expect(store.getBlockPattern()).toBe(EngineState.Block.pattern);
    });

    test('setBlockPattern 应该正确更新', () => {
      store.setBlockPattern('square');
      expect(store.getBlockPattern()).toBe('square');

      store.setBlockPattern('jay');
      expect(store.getBlockPattern()).toBe('jay');
    });
  });

  // ==================== 状态独立性 ====================
  describe('状态独立性', () => {
    test('多个 Store 实例互不影响', () => {
      const store1 = new EngineStore({ Mode: 'single', victoryScore: 5 });
      const store2 = new EngineStore({ Mode: 'versus', victoryScore: 20 });

      expect(store1.getMode()).toBe('single');
      expect(store2.getMode()).toBe('versus');

      store1.setMode('versus');
      expect(store1.getMode()).toBe('versus');
      expect(store2.getMode()).toBe('versus');
    });

    test('修改 Block 配置不影响其他实例', () => {
      const store1 = new EngineStore();
      const store2 = new EngineStore();

      store1.setBlockStyle('pixel');
      expect(store1.getBlockStyle()).toBe('pixel');
      expect(store2.getBlockStyle()).toBe(EngineState.Block.style);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    test('可以多次切换 Mode', () => {
      store.setMode('single');
      store.setMode('versus');
      store.setMode('single');
      expect(store.getMode()).toBe('single');
    });

    test('victoryScore 可以为任意数值', () => {
      store.setVictoryScore(-1);
      expect(store.getVictoryScore()).toBe(-1);

      store.setVictoryScore(999);
      expect(store.getVictoryScore()).toBe(999);
    });

    test('Block.style 可以设置为任意字符串', () => {
      store.setBlockStyle('custom-style');
      expect(store.getBlockStyle()).toBe('custom-style');
    });

    test('Block.pattern 可以设置为任意字符串', () => {
      store.setBlockPattern('custom-pattern');
      expect(store.getBlockPattern()).toBe('custom-pattern');
    });
  });
});
