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

    test('Mode 为 null 时应该返回 false（模式选择状态）', () => {
      store.setMode(null);
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

    test('setMode 支持设置为 null（模式选择状态）', () => {
      store.setMode(null);
      expect(store.getMode()).toBeNull();
    });

    test('Mode 切换应该反映在 isVersus 中', () => {
      store.setMode('versus');
      expect(store.isVersus()).toBe(true);

      store.setMode('single');
      expect(store.isVersus()).toBe(false);

      store.setMode(null);
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

  // ==================== Players 管理 ====================
  describe('getState().Players / setPlayers', () => {
    test('默认 Players 应该与 EngineState 一致', () => {
      const state = store.getState();
      expect(state.Players).toEqual(EngineState.Players);
    });

    test('setPlayers 应该正确更新 Players', () => {
      store.setPlayers(['human']);
      const state = store.getState();
      expect(state.Players).toEqual(['human']);
    });

    test('setPlayers 应该支持多人模式', () => {
      store.setPlayers(['human', 'ai']);
      expect(store.getState().Players).toEqual(['human', 'ai']);

      store.setPlayers(['human', 'human']);
      expect(store.getState().Players).toEqual(['human', 'human']);
    });

    test('setPlayers 应该支持清空玩家列表', () => {
      store.setPlayers(['human', 'ai']);
      expect(store.getState().Players).toEqual(['human', 'ai']);

      store.setPlayers([]);
      expect(store.getState().Players).toEqual([]);
    });

    test('setPlayers 应该与 Mode 配合使用', () => {
      // 单人模式
      store.setMode('single');
      store.setPlayers(['human']);
      expect(store.getMode()).toBe('single');
      expect(store.getState().Players).toEqual(['human']);

      // 对战模式 - 人机
      store.setMode('versus');
      store.setPlayers(['human', 'ai']);
      expect(store.getMode()).toBe('versus');
      expect(store.getState().Players).toEqual(['human', 'ai']);

      // 对战模式 - 双人
      store.setPlayers(['human', 'human']);
      expect(store.getState().Players).toEqual(['human', 'human']);
    });

    test('setPlayers 应该不影响其他状态', () => {
      const originalVictoryScore = store.getVictoryScore();
      const originalBlockStyle = store.getBlockStyle();

      store.setPlayers(['human']);

      expect(store.getVictoryScore()).toBe(originalVictoryScore);
      expect(store.getBlockStyle()).toBe(originalBlockStyle);
    });
  });

  // ==================== reset 方法 ====================
  describe('reset', () => {
    test('应该将状态重置为 EngineState 默认值', () => {
      // 先修改一些值
      store.setMode('versus');
      store.setPlayers(['human', 'ai']);
      store.setVictoryScore(10);
      store.setBlockStyle('pixel');
      store.setBlockPattern('jay');

      // 执行 reset
      store.reset();

      // 验证所有值恢复到默认
      expect(store.getMode()).toBe(EngineState.Mode);
      expect(store.getState().Players).toEqual(EngineState.Players);
      expect(store.getVictoryScore()).toBe(EngineState.victoryScore);
      expect(store.getBlockStyle()).toBe(EngineState.Block.style);
      expect(store.getBlockPattern()).toBe(EngineState.Block.pattern);
    });

    test('reset 后 Mode 应该恢复为 EngineState 默认值', () => {
      store.setMode('versus');
      store.reset();
      expect(store.getMode()).toBe(EngineState.Mode);
    });

    test('reset 后 Players 应该恢复为 EngineState 默认值', () => {
      store.setPlayers(['human', 'ai']);
      store.reset();
      expect(store.getState().Players).toEqual(EngineState.Players);
    });

    test('reset 后 victoryScore 应该恢复默认值', () => {
      store.setVictoryScore(99);
      store.reset();
      expect(store.getVictoryScore()).toBe(EngineState.victoryScore);
    });

    test('reset 后 Block 配置应该恢复默认值', () => {
      store.setBlockStyle('glass');
      store.setBlockPattern('ell');
      store.reset();
      expect(store.getBlockStyle()).toBe(EngineState.Block.style);
      expect(store.getBlockPattern()).toBe(EngineState.Block.pattern);
    });

    test('reset 应该使用 structuredClone 深拷贝', () => {
      // 清空之前的调用记录
      structuredClone.mockClear();

      store.reset();

      expect(structuredClone).toHaveBeenCalledWith(EngineState);
    });

    test('reset 后的状态应该是独立副本，修改不影响 EngineState', () => {
      store.reset();
      const state = store.getState();

      // 修改 state 中的值
      state.Mode = 'modified';

      // EngineState 不应该被影响
      expect(EngineState.Mode).not.toBe('modified');

      // store 的 state 被直接修改了，但 reset 会重新创建
      store.reset();
      expect(store.getMode()).toBe(EngineState.Mode);
    });

    test('连续多次 reset 不应该报错', () => {
      expect(() => {
        store.reset();
        store.reset();
        store.reset();
      }).not.toThrow();
    });

    test('reset 后应该清除所有自定义配置', () => {
      // 设置各种自定义值
      store.setMode('versus');
      store.setPlayers(['human', 'ai']);
      store.setVictoryScore(25);
      store.setBlockStyle('frosted');
      store.setBlockPattern('tee');

      store.reset();

      // 所有值都应该回到默认
      const state = store.getState();
      expect(state).toEqual(expect.objectContaining({
        Mode: EngineState.Mode,
        Players: EngineState.Players,
        victoryScore: EngineState.victoryScore,
      }));
      expect(state.Block.style).toBe(EngineState.Block.style);
      expect(state.Block.pattern).toBe(EngineState.Block.pattern);
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
      // store2 不受影响
      expect(store2.getMode()).toBe('versus');
    });

    test('修改 Block 配置不影响其他实例', () => {
      const store1 = new EngineStore();
      const store2 = new EngineStore();

      store1.setBlockStyle('pixel');
      expect(store1.getBlockStyle()).toBe('pixel');
      expect(store2.getBlockStyle()).toBe(EngineState.Block.style);
    });

    test('reset 只影响当前实例', () => {
      const store1 = new EngineStore();
      const store2 = new EngineStore();

      store1.setMode('versus');
      store1.setPlayers(['human', 'ai']);
      store1.reset();

      // store1 已重置
      expect(store1.getMode()).toBe(EngineState.Mode);
      expect(store1.getState().Players).toEqual(EngineState.Players);

      // store2 不受影响
      expect(store2.getMode()).toBe(EngineState.Mode);
      expect(store2.getState().Players).toEqual(EngineState.Players);
    });
  });

  // ==================== initialize 与 reset 的关系 ====================
  describe('initialize 与 reset 的关系', () => {
    test('initialize 可以用自定义配置覆盖', () => {
      store.initialize({ Mode: 'versus', victoryScore: 30 });
      expect(store.getMode()).toBe('versus');
      expect(store.getVictoryScore()).toBe(30);
    });

    test('reset 后可以再次 initialize', () => {
      store.setMode('versus');
      store.reset();
      expect(store.getMode()).toBe(EngineState.Mode);

      store.initialize({ Mode: 'single' });
      expect(store.getMode()).toBe('single');
    });

    test('reset 和 initialize 都使用 structuredClone', () => {
      structuredClone.mockClear();
      store.initialize({ Mode: 'single' });
      expect(structuredClone).toHaveBeenCalled();

      structuredClone.mockClear();
      store.reset();
      expect(structuredClone).toHaveBeenCalled();
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

    test('setPlayers 可以设置为任意字符串数组', () => {
      store.setPlayers(['player1', 'player2', 'player3']);
      expect(store.getState().Players).toEqual(['player1', 'player2', 'player3']);
    });

    test('setPlayers 传入空数组应该正常工作', () => {
      store.setPlayers([]);
      expect(store.getState().Players).toEqual([]);
    });

    test('reset 后所有自定义配置消失', () => {
      store.setMode('versus');
      store.setPlayers(['human', 'ai']);
      store.setVictoryScore(20);
      store.setBlockStyle('glass');
      store.setBlockPattern('ell');

      store.reset();

      expect(store.getMode()).toBe(EngineState.Mode);
      expect(store.getState().Players).toEqual(EngineState.Players);
      expect(store.getVictoryScore()).toBe(EngineState.victoryScore);
      expect(store.getBlockStyle()).toBe(EngineState.Block.style);
      expect(store.getBlockPattern()).toBe(EngineState.Block.pattern);
    });
  });
});
