/**
 * 测试对战状态管理器的所有状态操作和垃圾行管理功能
 *
 * @file VersusState 单元测试
 */

import VersusState from '@/lib/battle/versus-state.js';

// Mock Base 类
jest.mock('@/lib/core', () => {
  return jest.fn(function Base(options) {
    Object.assign(this, options);
  });
});

describe('VersusState', () => {
  // ==================== 辅助函数 ====================

  /** 创建模拟的 Game 实例 */
  const createMockGame = (name, index) => ({
    Player: { name, index },
    id: `${name}-${index}`,
  });

  /** 创建 VersusState 实例的快捷方法 */
  const createState = (games) => {
    return new VersusState({ games });
  };

  // ==================== 构造函数测试 ====================

  describe('构造函数', () => {
    test('应该正确继承 Base 类', () => {
      const games = [createMockGame('Alice', 0)];
      const state = new VersusState({ games });

      expect(state.games).toEqual(games);
    });

    test('应该自动调用 initialize 方法', () => {
      const initializeSpy = jest.spyOn(VersusState.prototype, 'initialize');
      const games = [createMockGame('Alice', 0)];

      new VersusState({ games });

      expect(initializeSpy).toHaveBeenCalledTimes(1);
      initializeSpy.mockRestore();
    });

    test('应该接受空的 games 数组', () => {
      expect(() => {
        new VersusState({ games: [] });
      }).not.toThrow();
    });

    test('缺少 games 参数时应该报错', () => {
      expect(() => {
        new VersusState({});
      }).toThrow();
    });
  });

  // ==================== 初始化测试 ====================

  describe('初始化', () => {
    test('running 应该初始化为 false', () => {
      const state = createState([createMockGame('Alice', 0)]);
      expect(state.running).toBe(false);
    });

    test('winner 应该初始化为 null', () => {
      const state = createState([createMockGame('Alice', 0)]);
      expect(state.winner).toBeNull();
    });

    test('scores 应该包含已初始化的玩家', () => {
      const state = createState([createMockGame('Alice', 0)]);
      // _initialize 会遍历 games 并为每个玩家初始化
      expect(state.scores).toEqual({ 'Alice-0': 0 });
    });

    test('pendingGarbage 应该包含已初始化的玩家', () => {
      const state = createState([createMockGame('Alice', 0)]);
      // _initialize 会遍历 games 并为每个玩家初始化
      expect(state.pendingGarbage).toEqual({ 'Alice-0': 0 });
    });

    test('应该为每个玩家初始化分数为 0', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      expect(state.scores['Alice-0']).toBe(0);
      expect(state.scores['Bob-1']).toBe(0);
    });

    test('应该为每个玩家初始化待处理垃圾行为 0', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      expect(state.pendingGarbage['Alice-0']).toBe(0);
      expect(state.pendingGarbage['Bob-1']).toBe(0);
    });

    test('应该为 3 个玩家正确初始化', () => {
      const games = [
        createMockGame('P1', 0),
        createMockGame('P2', 1),
        createMockGame('P3', 2),
      ];
      const state = createState(games);

      expect(state.scores['P1-0']).toBe(0);
      expect(state.scores['P2-1']).toBe(0);
      expect(state.scores['P3-2']).toBe(0);

      expect(state.pendingGarbage['P1-0']).toBe(0);
      expect(state.pendingGarbage['P2-1']).toBe(0);
      expect(state.pendingGarbage['P3-2']).toBe(0);
    });

    test('空 games 数组时 scores 和 pendingGarbage 应为空对象', () => {
      const state = createState([]);

      expect(state.scores).toEqual({});
      expect(state.pendingGarbage).toEqual({});
    });

    test('initialize 应该可以多次调用', () => {
      const state = createState([createMockGame('Alice', 0)]);

      // 修改状态
      state.setRunning(true);
      state.setWinner({});

      // 重新初始化
      state.initialize();

      expect(state.running).toBe(false);
      expect(state.winner).toBeNull();
    });
  });

  // ==================== _initialize 测试 ====================

  describe('_initialize', () => {
    test('应该重置所有状态为初始值', () => {
      const games = [createMockGame('Alice', 0)];
      const state = createState(games);

      // 先修改状态
      state.running = true;
      state.winner = games[0];
      state.scores['Alice-0'] = 5;
      state.pendingGarbage['Alice-0'] = 10;

      // 执行初始化
      state._initialize();

      expect(state.running).toBe(false);
      expect(state.winner).toBeNull();
      expect(state.scores['Alice-0']).toBe(0);
      expect(state.pendingGarbage['Alice-0']).toBe(0);
    });

    test('应该在 games 变化时重新初始化玩家列表', () => {
      const initialGames = [createMockGame('Alice', 0)];
      const state = createState(initialGames);

      // 修改 games
      state.games = [createMockGame('Bob', 1), createMockGame('Charlie', 2)];

      state._initialize();

      expect(state.scores).toHaveProperty('Bob-1');
      expect(state.scores).toHaveProperty('Charlie-2');
      expect(state.scores).not.toHaveProperty('Alice-0');
    });
  });

  // ==================== setRunning / isRunning 测试 ====================

  describe('setRunning / isRunning', () => {
    test('应该正确设置和获取运行状态', () => {
      const state = createState([createMockGame('Alice', 0)]);

      expect(state.isRunning()).toBe(false);

      state.setRunning(true);
      expect(state.isRunning()).toBe(true);

      state.setRunning(false);
      expect(state.isRunning()).toBe(false);
    });

    test('应该接受布尔值参数', () => {
      const state = createState([createMockGame('Alice', 0)]);

      state.setRunning(true);
      expect(state.running).toBe(true);

      state.setRunning(false);
      expect(state.running).toBe(false);
    });

    test('应该可以多次切换状态', () => {
      const state = createState([createMockGame('Alice', 0)]);

      state.setRunning(true);
      expect(state.isRunning()).toBe(true);

      state.setRunning(false);
      expect(state.isRunning()).toBe(false);

      state.setRunning(true);
      expect(state.isRunning()).toBe(true);
    });
  });

  // ==================== setWinner / getWinner 测试 ====================

  describe('setWinner / getWinner', () => {
    test('应该正确设置和获取胜者', () => {
      const games = [createMockGame('Alice', 0)];
      const state = createState(games);

      expect(state.getWinner()).toBeNull();

      state.setWinner(games[0]);
      expect(state.getWinner()).toBe(games[0]);
    });

    test('应该可以设置任意对象为胜者', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const winner = {
        id: 'custom-winner',
        Player: { name: 'Winner', index: 99 },
      };

      state.setWinner(winner);
      expect(state.getWinner()).toEqual(winner);
    });

    test('应该可以重置胜者为 null', () => {
      const games = [createMockGame('Alice', 0)];
      const state = createState(games);

      state.setWinner(games[0]);
      expect(state.getWinner()).not.toBeNull();

      state.setWinner(null);
      expect(state.getWinner()).toBeNull();
    });
  });

  // ==================== getScore 测试 ====================

  describe('getScore', () => {
    test('应该返回指定玩家的分数', () => {
      const state = createState([createMockGame('Alice', 0)]);
      state.scores['Alice-0'] = 5;

      expect(state.getScore('Alice-0')).toBe(5);
    });

    test('应该返回初始分数 0', () => {
      const state = createState([createMockGame('Alice', 0)]);

      expect(state.getScore('Alice-0')).toBe(0);
    });

    test('未初始化的玩家应该返回 undefined', () => {
      const state = createState([createMockGame('Alice', 0)]);

      expect(state.getScore('NonExistent-99')).toBeUndefined();
    });

    test('应该区分不同玩家的分数', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      state.scores['Alice-0'] = 3;
      state.scores['Bob-1'] = 7;

      expect(state.getScore('Alice-0')).toBe(3);
      expect(state.getScore('Bob-1')).toBe(7);
    });
  });

  // ==================== getPlayerId 测试 ====================

  describe('getPlayerId', () => {
    test('应该生成正确的玩家 ID', () => {
      const state = createState([]);
      const game = createMockGame('Alice', 0);

      expect(state.getPlayerId(game)).toBe('Alice-0');
    });

    test('应该处理不同的名称和索引', () => {
      const state = createState([]);

      expect(state.getPlayerId(createMockGame('Player1', 5))).toBe('Player1-5');
      expect(state.getPlayerId(createMockGame('Bob', 10))).toBe('Bob-10');
      expect(state.getPlayerId(createMockGame('Charlie', 999))).toBe(
        'Charlie-999',
      );
    });

    test('应该处理空字符串名称', () => {
      const state = createState([]);
      const game = createMockGame('', 0);

      expect(state.getPlayerId(game)).toBe('-0');
    });

    test('应该处理特殊字符名称', () => {
      const state = createState([]);
      const game = createMockGame('Player-1', 0);

      expect(state.getPlayerId(game)).toBe('Player-1-0');
    });

    test('应该处理相同名称不同索引', () => {
      const state = createState([]);

      expect(state.getPlayerId(createMockGame('Player', 0))).toBe('Player-0');
      expect(state.getPlayerId(createMockGame('Player', 1))).toBe('Player-1');
    });
  });

  // ==================== updateScores 测试 ====================

  describe('updateScores', () => {
    test('应该给胜者增加 1 个胜场', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      state.updateScores({ winner: games[0], loser: games[1] });

      expect(state.getScore('Alice-0')).toBe(1);
      expect(state.getScore('Bob-1')).toBe(0);
    });

    test('应该保持败者分数不变', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      state.scores['Bob-1'] = 2;
      state.updateScores({ winner: games[0], loser: games[1] });

      expect(state.getScore('Bob-1')).toBe(2);
    });

    test('应该多次调用累积胜场数', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      // Alice 连胜 3 局
      state.updateScores({ winner: games[0], loser: games[1] });
      state.updateScores({ winner: games[0], loser: games[1] });
      state.updateScores({ winner: games[0], loser: games[1] });

      expect(state.getScore('Alice-0')).toBe(3);
      expect(state.getScore('Bob-1')).toBe(0);
    });

    test('应该支持交替获胜', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      // Alice 赢
      state.updateScores({ winner: games[0], loser: games[1] });
      expect(state.getScore('Alice-0')).toBe(1);

      // Bob 赢
      state.updateScores({ winner: games[1], loser: games[0] });
      expect(state.getScore('Bob-1')).toBe(1);

      // Alice 再赢
      state.updateScores({ winner: games[0], loser: games[1] });
      expect(state.getScore('Alice-0')).toBe(2);
      expect(state.getScore('Bob-1')).toBe(1);
    });

    test('应该将败者负数分数重置为 0', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      // 手动设置负数（异常数据）
      state.scores['Bob-1'] = -5;

      state.updateScores({ winner: games[0], loser: games[1] });

      expect(state.getScore('Bob-1')).toBe(0);
    });

    test('败者分数为 0 时应该保持 0', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      state.updateScores({ winner: games[0], loser: games[1] });

      expect(state.getScore('Bob-1')).toBe(0);
    });

    test('应该处理胜者分数从非零开始累加', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      state.scores['Alice-0'] = 10;
      state.updateScores({ winner: games[0], loser: games[1] });

      expect(state.getScore('Alice-0')).toBe(11);
    });

    test('应该处理 3 人对战场景', () => {
      const games = [
        createMockGame('P1', 0),
        createMockGame('P2', 1),
        createMockGame('P3', 2),
      ];
      const state = createState(games);

      state.updateScores({ winner: games[0], loser: games[2] });

      expect(state.getScore('P1-0')).toBe(1);
      expect(state.getScore('P2-1')).toBe(0);
      expect(state.getScore('P3-2')).toBe(0);
    });
  });

  // ==================== addGarbage 测试 ====================

  describe('addGarbage', () => {
    test('应该累加待处理垃圾行', () => {
      const state = createState([createMockGame('Alice', 0)]);

      state.addGarbage(createMockGame('Alice', 0), 3);

      expect(state.getPendingGarbage(createMockGame('Alice', 0))).toBe(3);
    });

    test('应该多次累加垃圾行', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 2);
      state.addGarbage(game, 3);
      state.addGarbage(game, 1);

      expect(state.getPendingGarbage(game)).toBe(6);
    });

    test('应该为不同玩家独立累加', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      state.addGarbage(games[0], 3);
      state.addGarbage(games[1], 5);

      expect(state.getPendingGarbage(games[0])).toBe(3);
      expect(state.getPendingGarbage(games[1])).toBe(5);
    });

    test('应该处理未初始化的玩家', () => {
      const state = createState([]);
      const game = createMockGame('NewPlayer', 99);

      state.addGarbage(game, 5);

      expect(state.getPendingGarbage(game)).toBe(5);
    });

    test('应该处理累加 0 行垃圾', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 0);

      expect(state.getPendingGarbage(game)).toBe(0);
    });

    test('应该处理累加负数垃圾行', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 5);
      state.addGarbage(game, -2);

      expect(state.getPendingGarbage(game)).toBe(3);
    });

    test('应该从 0 开始累加', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 1);

      expect(state.pendingGarbage['Alice-0']).toBe(1);
    });

    test('应该处理大量垃圾行累加', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 100);

      expect(state.getPendingGarbage(game)).toBe(100);
    });
  });

  // ==================== offsetGarbage 测试 ====================

  describe('offsetGarbage', () => {
    test('攻击力大于待处理垃圾行时应返回剩余攻击力', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 3);

      const remaining = state.offsetGarbage(game, 5);

      expect(remaining).toBe(2); // 5 - 3 = 2
      expect(state.getPendingGarbage(game)).toBe(0);
    });

    test('攻击力小于待处理垃圾行时应返回 0', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 5);

      const remaining = state.offsetGarbage(game, 3);

      expect(remaining).toBe(0);
      expect(state.getPendingGarbage(game)).toBe(2); // 5 - 3 = 2
    });

    test('攻击力等于待处理垃圾行时应返回 0', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 4);

      const remaining = state.offsetGarbage(game, 4);

      expect(remaining).toBe(0);
      expect(state.getPendingGarbage(game)).toBe(0);
    });

    test('无待处理垃圾时应返回全部攻击力', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      const remaining = state.offsetGarbage(game, 4);

      expect(remaining).toBe(4);
      expect(state.getPendingGarbage(game)).toBe(0);
    });

    test('攻击力为 0 时不改变待处理垃圾行', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 5);

      const remaining = state.offsetGarbage(game, 0);

      expect(remaining).toBe(0);
      expect(state.getPendingGarbage(game)).toBe(5);
    });

    test('应该多次抵消累积减少待处理垃圾行', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 10);

      // 第一次抵消
      const r1 = state.offsetGarbage(game, 3);
      expect(r1).toBe(0);
      expect(state.getPendingGarbage(game)).toBe(7);

      // 第二次抵消
      const r2 = state.offsetGarbage(game, 4);
      expect(r2).toBe(0);
      expect(state.getPendingGarbage(game)).toBe(3);

      // 第三次抵消（超出）
      const r3 = state.offsetGarbage(game, 5);
      expect(r3).toBe(2); // 5 - 3 = 2
      expect(state.getPendingGarbage(game)).toBe(0);
    });

    test('应该处理未初始化玩家的抵消', () => {
      const state = createState([]);
      const game = createMockGame('NewPlayer', 99);

      const remaining = state.offsetGarbage(game, 5);

      expect(remaining).toBe(5);
      expect(state.getPendingGarbage(game)).toBe(0);
    });

    test('各种场景对照表验证', () => {
      // 场景 1: pending=5, attack=3 → remaining=2, return 0
      const state1 = createState([createMockGame('P1', 0)]);
      const game1 = createMockGame('P1', 0);
      state1.addGarbage(game1, 5);
      expect(state1.offsetGarbage(game1, 3)).toBe(0);
      expect(state1.getPendingGarbage(game1)).toBe(2);

      // 场景 2: pending=3, attack=5 → remaining=0, return 2
      const state2 = createState([createMockGame('P2', 0)]);
      const game2 = createMockGame('P2', 0);
      state2.addGarbage(game2, 3);
      expect(state2.offsetGarbage(game2, 5)).toBe(2);
      expect(state2.getPendingGarbage(game2)).toBe(0);

      // 场景 3: pending=0, attack=4 → remaining=0, return 4
      const state3 = createState([createMockGame('P3', 0)]);
      const game3 = createMockGame('P3', 0);
      expect(state3.offsetGarbage(game3, 4)).toBe(4);
      expect(state3.getPendingGarbage(game3)).toBe(0);

      // 场景 4: pending=2, attack=2 → remaining=0, return 0
      const state4 = createState([createMockGame('P4', 0)]);
      const game4 = createMockGame('P4', 0);
      state4.addGarbage(game4, 2);
      expect(state4.offsetGarbage(game4, 2)).toBe(0);
      expect(state4.getPendingGarbage(game4)).toBe(0);
    });
  });

  // ==================== getPendingGarbage 测试 ====================

  describe('getPendingGarbage', () => {
    test('应该返回正确的待处理垃圾行数', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 7);

      expect(state.getPendingGarbage(game)).toBe(7);
    });

    test('未初始化的玩家应该返回 0', () => {
      const state = createState([]);
      const game = createMockGame('NewPlayer', 99);

      expect(state.getPendingGarbage(game)).toBe(0);
    });

    test('初始值应该为 0', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      expect(state.getPendingGarbage(game)).toBe(0);
    });

    test('应该返回数字类型', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 5);

      expect(typeof state.getPendingGarbage(game)).toBe('number');
    });
  });

  // ==================== clearGarbage 测试 ====================

  describe('clearGarbage', () => {
    test('应该清空指定玩家的待处理垃圾行', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 10);
      expect(state.getPendingGarbage(game)).toBe(10);

      state.clearGarbage(game);
      expect(state.getPendingGarbage(game)).toBe(0);
    });

    test('应该只清空指定玩家的垃圾行', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      state.addGarbage(games[0], 5);
      state.addGarbage(games[1], 8);

      state.clearGarbage(games[0]);

      expect(state.getPendingGarbage(games[0])).toBe(0);
      expect(state.getPendingGarbage(games[1])).toBe(8);
    });

    test('未初始化的玩家也可以清空', () => {
      const state = createState([]);
      const game = createMockGame('NewPlayer', 99);

      expect(() => {
        state.clearGarbage(game);
      }).not.toThrow();

      expect(state.getPendingGarbage(game)).toBe(0);
    });

    test('清空后可以重新累加', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      state.addGarbage(game, 5);
      state.clearGarbage(game);
      state.addGarbage(game, 3);

      expect(state.getPendingGarbage(game)).toBe(3);
    });

    test('清空已为 0 的垃圾行不报错', () => {
      const state = createState([createMockGame('Alice', 0)]);
      const game = createMockGame('Alice', 0);

      expect(() => {
        state.clearGarbage(game);
      }).not.toThrow();

      expect(state.getPendingGarbage(game)).toBe(0);
    });
  });

  // ==================== reset 测试 ====================

  describe('reset', () => {
    test('应该重置所有状态为初始值', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      // 修改状态
      state.setRunning(true);
      state.setWinner(games[0]);
      state.updateScores({ winner: games[0], loser: games[1] });
      state.updateScores({ winner: games[0], loser: games[1] });
      state.addGarbage(games[0], 5);
      state.addGarbage(games[1], 3);

      // 重置
      state.reset();

      // 验证所有状态已重置
      expect(state.isRunning()).toBe(false);
      expect(state.getWinner()).toBeNull();
      expect(state.getScore('Alice-0')).toBe(0);
      expect(state.getScore('Bob-1')).toBe(0);
      expect(state.getPendingGarbage(games[0])).toBe(0);
      expect(state.getPendingGarbage(games[1])).toBe(0);
    });

    test('应该可以多次调用 reset', () => {
      const state = createState([createMockGame('Alice', 0)]);

      state.setRunning(true);
      state.reset();
      expect(state.isRunning()).toBe(false);

      state.setRunning(true);
      state.reset();
      expect(state.isRunning()).toBe(false);
    });

    test('reset 后应该保持 games 引用不变', () => {
      const games = [createMockGame('Alice', 0)];
      const state = createState(games);

      state.reset();

      expect(state.games).toBe(games);
    });
  });

  // ==================== 集成测试 ====================

  describe('集成测试', () => {
    test('完整的对战生命周期', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      // 1. 开始对战
      expect(state.isRunning()).toBe(false);
      state.setRunning(true);
      expect(state.isRunning()).toBe(true);

      // 2. Bob 受到攻击
      state.addGarbage(games[1], 3);
      expect(state.getPendingGarbage(games[1])).toBe(3);

      // 3. Bob 消行抵消
      const remaining = state.offsetGarbage(games[1], 2);
      expect(remaining).toBe(0);
      expect(state.getPendingGarbage(games[1])).toBe(1);

      // 4. Bob 再次消行完全抵消
      const remaining2 = state.offsetGarbage(games[1], 1);
      expect(remaining2).toBe(0);
      expect(state.getPendingGarbage(games[1])).toBe(0);

      // 5. Alice 消行攻击
      const attack = state.offsetGarbage(games[0], 4);
      expect(attack).toBe(4);
      state.addGarbage(games[1], attack);

      // 6. 游戏结束，Alice 获胜
      state.setWinner(games[0]);
      state.updateScores({ winner: games[0], loser: games[1] });
      expect(state.getWinner()).toBe(games[0]);
      expect(state.getScore('Alice-0')).toBe(1);

      // 7. 停止对战
      state.setRunning(false);
      expect(state.isRunning()).toBe(false);

      // 8. 重置
      state.reset();
      expect(state.isRunning()).toBe(false);
      expect(state.getWinner()).toBeNull();
    });

    test('多局对战分数累积', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      // 模拟 5 局对战
      const results = [
        { winner: 0, loser: 1 }, // Alice 赢
        { winner: 1, loser: 0 }, // Bob 赢
        { winner: 0, loser: 1 }, // Alice 赢
        { winner: 0, loser: 1 }, // Alice 赢
        { winner: 1, loser: 0 }, // Bob 赢
      ];

      results.forEach(({ winner, loser }) => {
        state.updateScores({
          winner: games[winner],
          loser: games[loser],
        });
      });

      expect(state.getScore('Alice-0')).toBe(3);
      expect(state.getScore('Bob-1')).toBe(2);
    });

    test('垃圾行攻防交互', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const state = createState(games);

      // Alice 消 4 行 → 攻击力 3
      const attack1 = state.offsetGarbage(games[0], 3);
      expect(attack1).toBe(3);
      state.addGarbage(games[1], attack1);

      // Bob 受到 3 行垃圾，消 2 行 → 攻击力 1，不足以抵消
      const counter1 = state.offsetGarbage(games[1], 1);
      expect(counter1).toBe(0);
      expect(state.getPendingGarbage(games[1])).toBe(2);

      // Bob 再次消 3 行 → 攻击力 2，完全抵消
      const counter2 = state.offsetGarbage(games[1], 2);
      expect(counter2).toBe(0);
      expect(state.getPendingGarbage(games[1])).toBe(0);
    });
  });
});
