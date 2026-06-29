/**
 * 测试 BattleStore 状态管理器的所有状态操作和垃圾行管理功能
 *
 * @file BattleStore 单元测试
 */

import BattleStore from '@/lib/battle/battle-store.js';

// Mock Base 类
jest.mock('@/lib/core', () => {
  return jest.fn(function Base(options) {
    Object.assign(this, options);
  });
});

// Mock structuredClone
global.structuredClone = jest.fn((obj) => JSON.parse(JSON.stringify(obj)));

describe('BattleStore', () => {
  // ==================== 辅助函数 ====================

  /** 创建模拟的 Game 实例 */
  const createMockGame = (name, index) => ({
    Player: { name, index },
    id: `${name}-${index}`,
  });

  /** 创建 BattleStore 实例的快捷方法 */
  const createStore = (games) => {
    return new BattleStore({ games });
  };

  // ==================== 构造函数测试 ====================

  describe('构造函数', () => {
    test('应该正确继承 Base 类', () => {
      const games = [createMockGame('Alice', 0)];
      const store = new BattleStore({ games });
      expect(store.games).toEqual(games);
    });

    test('应该自动调用 initialize 方法', () => {
      const initializeSpy = jest.spyOn(BattleStore.prototype, 'initialize');
      const games = [createMockGame('Alice', 0)];
      new BattleStore({ games });
      expect(initializeSpy).toHaveBeenCalledTimes(1);
      initializeSpy.mockRestore();
    });

    test('应该接受空的 games 数组', () => {
      expect(() => new BattleStore({ games: [] })).not.toThrow();
    });

    test('应该通过 structuredClone 深拷贝 BattleState', () => {
      const games = [createMockGame('Alice', 0)];
      new BattleStore({ games });
      expect(structuredClone).toHaveBeenCalled();
    });

    test('两个实例的 state 应该是独立的对象', () => {
      const games = [createMockGame('Alice', 0)];
      const store1 = new BattleStore({ games });
      const store2 = new BattleStore({ games });

      store1.state.scores['Alice-0'] = 10;
      expect(store2.state.scores['Alice-0']).toBe(0);
    });
  });

  // ==================== 初始化测试 ====================

  describe('初始化', () => {
    test('state.running 应该初始化为 false', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.state.running).toBe(false);
    });

    test('state.winner 应该初始化为 null', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.state.winner).toBeNull();
    });

    test('state.scores 应该包含已初始化的玩家', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.state.scores).toEqual({ 'Alice-0': 0 });
    });

    test('state.pendingGarbage 应该包含已初始化的玩家', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.state.pendingGarbage).toEqual({ 'Alice-0': 0 });
    });

    test('state.roundId 应该初始化为 0', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.state.roundId).toBe(0);
    });

    test('state.VictoryScore 应该包含默认难度配置', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.state.VictoryScore).toEqual({
        easy: 5,
        normal: 8,
        hard: 12,
        expert: 15,
      });
    });

    test('应该为每个玩家初始化分数为 0', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      expect(store.state.scores['Alice-0']).toBe(0);
      expect(store.state.scores['Bob-1']).toBe(0);
    });

    test('应该为每个玩家初始化待处理垃圾行为 0', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      expect(store.state.pendingGarbage['Alice-0']).toBe(0);
      expect(store.state.pendingGarbage['Bob-1']).toBe(0);
    });

    test('应该为 3 个玩家正确初始化', () => {
      const games = [
        createMockGame('P1', 0),
        createMockGame('P2', 1),
        createMockGame('P3', 2),
      ];
      const store = createStore(games);

      expect(store.state.scores['P1-0']).toBe(0);
      expect(store.state.scores['P2-1']).toBe(0);
      expect(store.state.scores['P3-2']).toBe(0);

      expect(store.state.pendingGarbage['P1-0']).toBe(0);
      expect(store.state.pendingGarbage['P2-1']).toBe(0);
      expect(store.state.pendingGarbage['P3-2']).toBe(0);
    });

    test('空 games 数组时 scores 和 pendingGarbage 应为空对象', () => {
      const store = createStore([]);
      expect(store.state.scores).toEqual({});
      expect(store.state.pendingGarbage).toEqual({});
    });

    test('initialize 应该可以多次调用', () => {
      const store = createStore([createMockGame('Alice', 0)]);

      store.setRunning(true);
      store.setWinner({});

      store.initialize();

      expect(store.state.running).toBe(false);
      expect(store.state.winner).toBeNull();
    });
  });

  // ==================== _initialize 测试 ====================

  describe('_initialize', () => {
    test('应该重置所有状态为初始值', () => {
      const games = [createMockGame('Alice', 0)];
      const store = createStore(games);

      store.state.running = true;
      store.state.winner = games[0];
      store.state.scores['Alice-0'] = 5;
      store.state.pendingGarbage['Alice-0'] = 10;
      store.state.roundId = 99;

      store._initialize();

      expect(store.state.running).toBe(false);
      expect(store.state.winner).toBeNull();
      expect(store.state.scores['Alice-0']).toBe(0);
      expect(store.state.pendingGarbage['Alice-0']).toBe(0);
      expect(store.state.roundId).toBe(0);
    });

    test('应该在 games 变化时重新初始化玩家列表', () => {
      const initialGames = [createMockGame('Alice', 0)];
      const store = createStore(initialGames);

      store.games = [createMockGame('Bob', 1), createMockGame('Charlie', 2)];
      store._initialize();

      expect(store.state.scores).toHaveProperty('Bob-1');
      expect(store.state.scores).toHaveProperty('Charlie-2');
      expect(store.state.scores).not.toHaveProperty('Alice-0');
    });
  });

  // ==================== setRunning / isRunning 测试 ====================

  describe('setRunning / isRunning', () => {
    test('应该正确设置和获取运行状态', () => {
      const store = createStore([createMockGame('Alice', 0)]);

      expect(store.isRunning()).toBe(false);

      store.setRunning(true);
      expect(store.isRunning()).toBe(true);

      store.setRunning(false);
      expect(store.isRunning()).toBe(false);
    });

    test('应该可以多次切换状态', () => {
      const store = createStore([createMockGame('Alice', 0)]);

      store.setRunning(true);
      expect(store.isRunning()).toBe(true);

      store.setRunning(false);
      expect(store.isRunning()).toBe(false);

      store.setRunning(true);
      expect(store.isRunning()).toBe(true);
    });
  });

  // ==================== setWinner / getWinner 测试 ====================

  describe('setWinner / getWinner', () => {
    test('应该正确设置和获取胜者', () => {
      const games = [createMockGame('Alice', 0)];
      const store = createStore(games);

      expect(store.getWinner()).toBeNull();

      store.setWinner(games[0]);
      expect(store.getWinner()).toBe(games[0]);
    });

    test('应该可以设置任意对象为胜者', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const winner = {
        id: 'custom-winner',
        Player: { name: 'Winner', index: 99 },
      };

      store.setWinner(winner);
      expect(store.getWinner()).toEqual(winner);
    });

    test('应该可以重置胜者为 null', () => {
      const games = [createMockGame('Alice', 0)];
      const store = createStore(games);

      store.setWinner(games[0]);
      expect(store.getWinner()).not.toBeNull();

      store.setWinner(null);
      expect(store.getWinner()).toBeNull();
    });
  });

  // ==================== getScore / setScore 测试 ====================

  describe('getScore / setScore', () => {
    test('应该返回指定玩家的分数', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      store.state.scores['Alice-0'] = 5;

      expect(store.getScore('Alice-0')).toBe(5);
    });

    test('应该返回初始分数 0', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.getScore('Alice-0')).toBe(0);
    });

    test('未初始化的玩家应该返回 undefined', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.getScore('NonExistent-99')).toBeUndefined();
    });

    test('setScore 应该正确设置分数', () => {
      const store = createStore([createMockGame('Alice', 0)]);

      store.setScore('Alice-0', 10);
      expect(store.getScore('Alice-0')).toBe(10);
    });

    test('setScore 应该可以设置任意值', () => {
      const store = createStore([createMockGame('Alice', 0)]);

      store.setScore('Alice-0', 0);
      expect(store.getScore('Alice-0')).toBe(0);

      store.setScore('Alice-0', -5);
      expect(store.getScore('Alice-0')).toBe(-5);
    });

    test('应该区分不同玩家的分数', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.state.scores['Alice-0'] = 3;
      store.state.scores['Bob-1'] = 7;

      expect(store.getScore('Alice-0')).toBe(3);
      expect(store.getScore('Bob-1')).toBe(7);
    });
  });

  // ==================== getVictoryScore / setVictoryScore 测试 ====================

  describe('getVictoryScore / setVictoryScore', () => {
    test('应该返回默认 VictoryScore（easy 难度）', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.getVictoryScore()).toBe(5);
    });

    test('getVictoryScore 应该支持指定难度', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.getVictoryScore('easy')).toBe(5);
      expect(store.getVictoryScore('normal')).toBe(8);
      expect(store.getVictoryScore('hard')).toBe(12);
      expect(store.getVictoryScore('expert')).toBe(15);
    });

    test('setVictoryScore 应该正确更新指定难度', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      store.setVictoryScore('easy', 10);
      expect(store.getVictoryScore('easy')).toBe(10);
      expect(store.getVictoryScore('normal')).toBe(8);
    });

    test('setVictoryScore 应该支持更新所有难度', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      store.setVictoryScore('easy', 3);
      store.setVictoryScore('normal', 6);
      store.setVictoryScore('hard', 9);
      store.setVictoryScore('expert', 12);

      expect(store.getVictoryScore('easy')).toBe(3);
      expect(store.getVictoryScore('normal')).toBe(6);
      expect(store.getVictoryScore('hard')).toBe(9);
      expect(store.getVictoryScore('expert')).toBe(12);
    });

    test('VictoryScore 可以为 0', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      store.setVictoryScore('easy', 0);
      expect(store.getVictoryScore('easy')).toBe(0);
    });
  });

  // ==================== getPlayerId 测试 ====================

  describe('getPlayerId', () => {
    test('应该生成正确的玩家 ID', () => {
      const store = createStore([]);
      const game = createMockGame('Alice', 0);
      expect(store.getPlayerId(game)).toBe('Alice-0');
    });

    test('应该处理不同的名称和索引', () => {
      const store = createStore([]);

      expect(store.getPlayerId(createMockGame('Player1', 5))).toBe('Player1-5');
      expect(store.getPlayerId(createMockGame('Bob', 10))).toBe('Bob-10');
      expect(store.getPlayerId(createMockGame('Charlie', 999))).toBe(
        'Charlie-999',
      );
    });

    test('应该处理空字符串名称', () => {
      const store = createStore([]);
      const game = createMockGame('', 0);
      expect(store.getPlayerId(game)).toBe('-0');
    });

    test('应该处理相同名称不同索引', () => {
      const store = createStore([]);
      expect(store.getPlayerId(createMockGame('Player', 0))).toBe('Player-0');
      expect(store.getPlayerId(createMockGame('Player', 1))).toBe('Player-1');
    });
  });

  // ==================== updateScores 测试 ====================

  describe('updateScores', () => {
    test('应该给胜者增加 1 个胜场', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.updateScores({ winner: games[0], loser: games[1] });

      expect(store.getScore('Alice-0')).toBe(1);
      expect(store.getScore('Bob-1')).toBe(0);
    });

    test('应该保持败者分数不变', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.state.scores['Bob-1'] = 2;
      store.updateScores({ winner: games[0], loser: games[1] });

      expect(store.getScore('Bob-1')).toBe(2);
    });

    test('应该多次调用累积胜场数', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.updateScores({ winner: games[0], loser: games[1] });
      store.updateScores({ winner: games[0], loser: games[1] });
      store.updateScores({ winner: games[0], loser: games[1] });

      expect(store.getScore('Alice-0')).toBe(3);
      expect(store.getScore('Bob-1')).toBe(0);
    });

    test('应该支持交替获胜', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.updateScores({ winner: games[0], loser: games[1] });
      expect(store.getScore('Alice-0')).toBe(1);

      store.updateScores({ winner: games[1], loser: games[0] });
      expect(store.getScore('Bob-1')).toBe(1);

      store.updateScores({ winner: games[0], loser: games[1] });
      expect(store.getScore('Alice-0')).toBe(2);
      expect(store.getScore('Bob-1')).toBe(1);
    });

    test('应该将败者负数分数重置为 0', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.state.scores['Bob-1'] = -5;
      store.updateScores({ winner: games[0], loser: games[1] });

      expect(store.getScore('Bob-1')).toBe(0);
    });

    test('败者分数为 0 时应该保持 0', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.updateScores({ winner: games[0], loser: games[1] });

      expect(store.getScore('Bob-1')).toBe(0);
    });

    test('应该处理胜者分数从非零开始累加', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.state.scores['Alice-0'] = 10;
      store.updateScores({ winner: games[0], loser: games[1] });

      expect(store.getScore('Alice-0')).toBe(11);
    });
  });

  // ==================== addGarbage 测试 ====================

  describe('addGarbage', () => {
    test('应该累加待处理垃圾行', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      store.addGarbage(createMockGame('Alice', 0), 3);
      expect(store.getPendingGarbage(createMockGame('Alice', 0))).toBe(3);
    });

    test('应该多次累加垃圾行', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 2);
      store.addGarbage(game, 3);
      store.addGarbage(game, 1);

      expect(store.getPendingGarbage(game)).toBe(6);
    });

    test('应该为不同玩家独立累加', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.addGarbage(games[0], 3);
      store.addGarbage(games[1], 5);

      expect(store.getPendingGarbage(games[0])).toBe(3);
      expect(store.getPendingGarbage(games[1])).toBe(5);
    });

    test('应该处理未初始化的玩家', () => {
      const store = createStore([]);
      const game = createMockGame('NewPlayer', 99);

      store.addGarbage(game, 5);

      expect(store.getPendingGarbage(game)).toBe(5);
    });

    test('应该处理累加 0 行垃圾', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 0);

      expect(store.getPendingGarbage(game)).toBe(0);
    });

    test('应该处理累加负数垃圾行', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 5);
      store.addGarbage(game, -2);

      expect(store.getPendingGarbage(game)).toBe(3);
    });
  });

  // ==================== offsetGarbage 测试 ====================

  describe('offsetGarbage', () => {
    test('攻击力大于待处理垃圾行时应返回剩余攻击力', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 3);

      const remaining = store.offsetGarbage(game, 5);

      expect(remaining).toBe(2);
      expect(store.getPendingGarbage(game)).toBe(0);
    });

    test('攻击力小于待处理垃圾行时应返回 0', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 5);

      const remaining = store.offsetGarbage(game, 3);

      expect(remaining).toBe(0);
      expect(store.getPendingGarbage(game)).toBe(2);
    });

    test('攻击力等于待处理垃圾行时应返回 0', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 4);

      const remaining = store.offsetGarbage(game, 4);

      expect(remaining).toBe(0);
      expect(store.getPendingGarbage(game)).toBe(0);
    });

    test('无待处理垃圾时应返回全部攻击力', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      const remaining = store.offsetGarbage(game, 4);

      expect(remaining).toBe(4);
      expect(store.getPendingGarbage(game)).toBe(0);
    });

    test('攻击力为 0 时不改变待处理垃圾行', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 5);

      const remaining = store.offsetGarbage(game, 0);

      expect(remaining).toBe(0);
      expect(store.getPendingGarbage(game)).toBe(5);
    });

    test('应该多次抵消累积减少待处理垃圾行', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 10);

      const r1 = store.offsetGarbage(game, 3);
      expect(r1).toBe(0);
      expect(store.getPendingGarbage(game)).toBe(7);

      const r2 = store.offsetGarbage(game, 4);
      expect(r2).toBe(0);
      expect(store.getPendingGarbage(game)).toBe(3);

      const r3 = store.offsetGarbage(game, 5);
      expect(r3).toBe(2);
      expect(store.getPendingGarbage(game)).toBe(0);
    });

    test('应该处理未初始化玩家的抵消', () => {
      const store = createStore([]);
      const game = createMockGame('NewPlayer', 99);

      const remaining = store.offsetGarbage(game, 5);

      expect(remaining).toBe(5);
      expect(store.getPendingGarbage(game)).toBe(0);
    });

    test('各种场景对照表验证', () => {
      // 场景 1: pending=5, attack=3 → remaining=2, return 0
      const store1 = createStore([createMockGame('P1', 0)]);
      const game1 = createMockGame('P1', 0);
      store1.addGarbage(game1, 5);
      expect(store1.offsetGarbage(game1, 3)).toBe(0);
      expect(store1.getPendingGarbage(game1)).toBe(2);

      // 场景 2: pending=3, attack=5 → remaining=0, return 2
      const store2 = createStore([createMockGame('P2', 0)]);
      const game2 = createMockGame('P2', 0);
      store2.addGarbage(game2, 3);
      expect(store2.offsetGarbage(game2, 5)).toBe(2);
      expect(store2.getPendingGarbage(game2)).toBe(0);

      // 场景 3: pending=0, attack=4 → remaining=0, return 4
      const store3 = createStore([createMockGame('P3', 0)]);
      const game3 = createMockGame('P3', 0);
      expect(store3.offsetGarbage(game3, 4)).toBe(4);
      expect(store3.getPendingGarbage(game3)).toBe(0);

      // 场景 4: pending=2, attack=2 → remaining=0, return 0
      const store4 = createStore([createMockGame('P4', 0)]);
      const game4 = createMockGame('P4', 0);
      store4.addGarbage(game4, 2);
      expect(store4.offsetGarbage(game4, 2)).toBe(0);
      expect(store4.getPendingGarbage(game4)).toBe(0);
    });
  });

  // ==================== getPendingGarbage 测试 ====================

  describe('getPendingGarbage', () => {
    test('应该返回正确的待处理垃圾行数', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 7);

      expect(store.getPendingGarbage(game)).toBe(7);
    });

    test('未初始化的玩家应该返回 0', () => {
      const store = createStore([]);
      const game = createMockGame('NewPlayer', 99);

      expect(store.getPendingGarbage(game)).toBe(0);
    });

    test('初始值应该为 0', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      expect(store.getPendingGarbage(game)).toBe(0);
    });
  });

  // ==================== clearGarbage 测试 ====================

  describe('clearGarbage', () => {
    test('应该清空指定玩家的待处理垃圾行', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 10);
      expect(store.getPendingGarbage(game)).toBe(10);

      store.clearGarbage(game);
      expect(store.getPendingGarbage(game)).toBe(0);
    });

    test('应该只清空指定玩家的垃圾行', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.addGarbage(games[0], 5);
      store.addGarbage(games[1], 8);

      store.clearGarbage(games[0]);

      expect(store.getPendingGarbage(games[0])).toBe(0);
      expect(store.getPendingGarbage(games[1])).toBe(8);
    });

    test('未初始化的玩家也可以清空', () => {
      const store = createStore([]);
      const game = createMockGame('NewPlayer', 99);

      expect(() => store.clearGarbage(game)).not.toThrow();
      expect(store.getPendingGarbage(game)).toBe(0);
    });

    test('清空后可以重新累加', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      store.addGarbage(game, 5);
      store.clearGarbage(game);
      store.addGarbage(game, 3);

      expect(store.getPendingGarbage(game)).toBe(3);
    });

    test('清空已为 0 的垃圾行不报错', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      expect(() => store.clearGarbage(game)).not.toThrow();
      expect(store.getPendingGarbage(game)).toBe(0);
    });
  });

  // ==================== increaseRound / getRoundId 测试 ====================

  describe('increaseRound / getRoundId', () => {
    test('初始 roundId 应该为 0', () => {
      const store = createStore([createMockGame('Alice', 0)]);
      expect(store.getRoundId()).toBe(0);
    });

    test('increaseRound 应该递增 roundId', () => {
      const store = createStore([createMockGame('Alice', 0)]);

      store.increaseRound();
      expect(store.getRoundId()).toBe(1);

      store.increaseRound();
      expect(store.getRoundId()).toBe(2);
    });

    test('应该支持多次递增', () => {
      const store = createStore([createMockGame('Alice', 0)]);

      for (let i = 0; i < 10; i++) {
        store.increaseRound();
      }

      expect(store.getRoundId()).toBe(10);
    });
  });

  // ==================== reset 测试 ====================

  describe('reset', () => {
    test('应该重置所有状态为初始值', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      store.setRunning(true);
      store.setWinner(games[0]);
      store.updateScores({ winner: games[0], loser: games[1] });
      store.updateScores({ winner: games[0], loser: games[1] });
      store.addGarbage(games[0], 5);
      store.addGarbage(games[1], 3);
      store.increaseRound();
      store.increaseRound();

      store.reset();

      expect(store.isRunning()).toBe(false);
      expect(store.getWinner()).toBeNull();
      expect(store.getScore('Alice-0')).toBe(0);
      expect(store.getScore('Bob-1')).toBe(0);
      expect(store.getPendingGarbage(games[0])).toBe(0);
      expect(store.getPendingGarbage(games[1])).toBe(0);
      expect(store.getRoundId()).toBe(0);
    });

    test('应该可以多次调用 reset', () => {
      const store = createStore([createMockGame('Alice', 0)]);

      store.setRunning(true);
      store.reset();
      expect(store.isRunning()).toBe(false);

      store.setRunning(true);
      store.reset();
      expect(store.isRunning()).toBe(false);
    });

    test('reset 后应该保持 games 引用不变', () => {
      const games = [createMockGame('Alice', 0)];
      const store = createStore(games);

      store.reset();

      expect(store.games).toBe(games);
    });
  });

  // ==================== 集成测试 ====================

  describe('集成测试', () => {
    test('完整的对战生命周期', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      // 1. 开始对战
      expect(store.isRunning()).toBe(false);
      store.setRunning(true);
      expect(store.isRunning()).toBe(true);

      // 2. Bob 受到攻击
      store.addGarbage(games[1], 3);
      expect(store.getPendingGarbage(games[1])).toBe(3);

      // 3. Bob 消行抵消
      const remaining = store.offsetGarbage(games[1], 2);
      expect(remaining).toBe(0);
      expect(store.getPendingGarbage(games[1])).toBe(1);

      // 4. Bob 再次消行完全抵消
      const remaining2 = store.offsetGarbage(games[1], 1);
      expect(remaining2).toBe(0);
      expect(store.getPendingGarbage(games[1])).toBe(0);

      // 5. Alice 消行攻击
      const attack = store.offsetGarbage(games[0], 4);
      expect(attack).toBe(4);
      store.addGarbage(games[1], attack);

      // 6. 游戏结束，Alice 获胜
      store.setWinner(games[0]);
      store.updateScores({ winner: games[0], loser: games[1] });
      expect(store.getWinner()).toBe(games[0]);
      expect(store.getScore('Alice-0')).toBe(1);

      // 7. 停止对战
      store.setRunning(false);
      expect(store.isRunning()).toBe(false);

      // 8. 重置
      store.reset();
      expect(store.isRunning()).toBe(false);
      expect(store.getWinner()).toBeNull();
      expect(store.getRoundId()).toBe(0);
    });

    test('多局对战分数累积', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      const results = [
        { winner: 0, loser: 1 },
        { winner: 1, loser: 0 },
        { winner: 0, loser: 1 },
        { winner: 0, loser: 1 },
        { winner: 1, loser: 0 },
      ];

      results.forEach(({ winner, loser }) => {
        store.updateScores({ winner: games[winner], loser: games[loser] });
        store.increaseRound();
      });

      expect(store.getScore('Alice-0')).toBe(3);
      expect(store.getScore('Bob-1')).toBe(2);
      expect(store.getRoundId()).toBe(5);
    });

    test('垃圾行攻防交互', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      // Alice 消 4 行 → 攻击力 3
      const attack1 = store.offsetGarbage(games[0], 3);
      expect(attack1).toBe(3);
      store.addGarbage(games[1], attack1);

      // Bob 受到 3 行垃圾，消 2 行 → 攻击力 1，不足以抵消
      const counter1 = store.offsetGarbage(games[1], 1);
      expect(counter1).toBe(0);
      expect(store.getPendingGarbage(games[1])).toBe(2);

      // Bob 再次消 3 行 → 攻击力 2，完全抵消
      const counter2 = store.offsetGarbage(games[1], 2);
      expect(counter2).toBe(0);
      expect(store.getPendingGarbage(games[1])).toBe(0);
    });

    test('使用 VictoryScore 判断胜负', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const store = createStore(games);

      // 使用默认 easy 难度（5 分）
      expect(store.getVictoryScore('easy')).toBe(5);

      // Alice 赢了 3 局
      store.updateScores({ winner: games[0], loser: games[1] });
      store.updateScores({ winner: games[0], loser: games[1] });
      store.updateScores({ winner: games[0], loser: games[1] });

      expect(store.getScore('Alice-0')).toBe(3);
      // 3 < 5，未达到 VictoryScore
      expect(store.getScore('Alice-0')).toBeLessThan(
        store.getVictoryScore('easy'),
      );

      // Alice 再赢 2 局
      store.updateScores({ winner: games[0], loser: games[1] });
      store.updateScores({ winner: games[0], loser: games[1] });

      expect(store.getScore('Alice-0')).toBe(5);
      // 5 >= 5，达到 VictoryScore
      expect(store.getScore('Alice-0')).toBeGreaterThanOrEqual(
        store.getVictoryScore('easy'),
      );
    });
  });
});
