/**
 * @file BattleController 单元测试 - 完整修正版
 * @description 测试对战控制器的完整功能
 */

import BattleController from '@/lib/battle/battle-controller.js';
import VersusState from '@/lib/battle/versus-state.js';
import BattleHUD from '@/lib/battle/battle-hud.js';
import BattleRouter from '@/lib/events/router/battle-router.js';
import * as garbageSystem from '@/lib/battle/garbage-system.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

// ==================== Mock 模块 ====================

jest.mock('@/lib/core', () => {
  return jest.fn(function Base(options) {
    Object.assign(this, options);
  });
});

jest.mock('@/lib/battle/versus-state.js', () => {
  return jest.fn(function(options) {
    Object.assign(this, options);
    this.running = false;
    this.winner = null;
    this.scores = {};
    this.pendingGarbage = {};

    if (options && options.games) {
      for (const game of options.games) {
        const playerId = `${game.Player.name}-${game.Player.index}`;
        this.scores[playerId] = 0;
        this.pendingGarbage[playerId] = 0;
      }
    }

    this.setRunning = jest.fn(function(running) { this.running = running; });
    this.isRunning = jest.fn(function() { return this.running; });
    this.setWinner = jest.fn(function(winner) { this.winner = winner; });
    this.getWinner = jest.fn(function() { return this.winner; });
    this.getScore = jest.fn(function(id) { return this.scores[id] || 0; });
    this.getPlayerId = jest.fn(function(game) {
      return `${game.Player.name}-${game.Player.index}`;
    });
    this.updateScores = jest.fn();
    this.addGarbage = jest.fn();
    this.offsetGarbage = jest.fn();
    this.getPendingGarbage = jest.fn(function() { return 0; });
    this.clearGarbage = jest.fn();
    this.reset = jest.fn();
    this.initialize = jest.fn();
  });
});

jest.mock('@/lib/battle/battle-hud.js', () => {
  return jest.fn(function(options) {
    Object.assign(this, options);
    this.updateScores = jest.fn();
  });
});

jest.mock('@/lib/events/router/battle-router.js', () => {
  return jest.fn(function(options) {
    Object.assign(this, options);
    this.subscribe = jest.fn();
    this.unsubscribe = jest.fn();
  });
});

jest.mock('@/lib/battle/garbage-system.js', () => ({
  calculateGarbage: jest.fn(),
  applyGarbage: jest.fn(),
}));

jest.mock('@/lib/events/event-catalog.js', () => ({
  GameEvents: jest.fn(),
}));

describe('BattleController', () => {
  // ==================== 辅助函数 ====================

  const createMockGame = (name, index, id) => ({
    id: id || `${name}-${index}`,
    Player: { name, index },
    Store: {
      getState: jest.fn(),
      setState: jest.fn(),
    },
    emit: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  });

  const createController = (games) => {
    return new BattleController({ games });
  };

  // 重置所有 mock 并清除构造时的副作用
  const createCleanController = (games) => {
    const controller = createController(games);
    // 清除构造时 start() 的调用记录
    controller.state.setRunning.mockClear();
    controller.state.setWinner.mockClear();
    controller.state.addGarbage.mockClear();
    controller.state.offsetGarbage.mockClear();
    controller.state.updateScores.mockClear();
    controller.state.clearGarbage.mockClear();
    controller.state.getPendingGarbage.mockClear();
    controller.hud.updateScores.mockClear();
    controller.router.subscribe.mockClear();
    controller.router.unsubscribe.mockClear();
    return controller;
  };

  // ==================== 构造函数测试 ====================

  describe('构造函数', () => {
    test('应该正确继承 Base 类', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createController(games);

      expect(controller.games).toEqual(games);
    });

    test('应该自动调用 initialize 方法', () => {
      const initializeSpy = jest.spyOn(BattleController.prototype, 'initialize');
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];

      new BattleController({ games });

      expect(initializeSpy).toHaveBeenCalledTimes(1);
      initializeSpy.mockRestore();
    });

    test('应该接受空的 games 数组', () => {
      expect(() => {
        new BattleController({ games: [] });
      }).not.toThrow();
    });
  });

  // ==================== initialize 测试 ====================

  describe('initialize', () => {
    test('应该创建 VersusState 实例并传入 games', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createController(games);

      expect(VersusState).toHaveBeenCalledWith({ games });
      expect(controller.state).toBeDefined();
    });

    test('应该创建 BattleHUD 实例并传入 games 和 state', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createController(games);

      expect(BattleHUD).toHaveBeenCalledWith({
        games,
        state: controller.state,
      });
      expect(controller.hud).toBeDefined();
    });

    test('应该创建 BattleRouter 实例并传入自身引用', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createController(games);

      expect(BattleRouter).toHaveBeenCalledWith({
        battle: controller,
      });
      expect(controller.router).toBeDefined();
    });

    test('应该按依赖顺序创建子系统', () => {
      const callOrder = [];

      VersusState.mockImplementationOnce(() => {
        callOrder.push('state');
        return {
          setRunning: jest.fn(),
          isRunning: jest.fn(() => false),
        };
      });
      BattleHUD.mockImplementationOnce(() => {
        callOrder.push('hud');
        return {};
      });
      BattleRouter.mockImplementationOnce(() => {
        callOrder.push('router');
        return {};
      });

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      createController(games);

      expect(callOrder.indexOf('state')).toBeLessThan(callOrder.indexOf('hud'));
      expect(callOrder.indexOf('hud')).toBeLessThan(callOrder.indexOf('router'));
    });

    test('应该自动调用 start 开始对战', () => {
      const startSpy = jest.spyOn(BattleController.prototype, 'start');
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];

      new BattleController({ games });

      expect(startSpy).toHaveBeenCalledTimes(1);
      startSpy.mockRestore();
    });
  });

  // ==================== start 测试 ====================

  describe('start', () => {
    test('未运行时应该设置 running 为 true', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController(games);

      controller.state.isRunning.mockReturnValue(false);

      controller.start();

      expect(controller.state.setRunning).toHaveBeenCalledWith(true);
    });

    test('已运行时不应该重复设置', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController(games);

      controller.state.isRunning.mockReturnValue(true);

      controller.start();

      expect(controller.state.setRunning).not.toHaveBeenCalled();
    });

    test('多次调用 start 应该是幂等的', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController(games);

      // 第一次：未运行 → 设置 running
      controller.state.isRunning.mockReturnValue(false);
      controller.start();
      expect(controller.state.setRunning).toHaveBeenCalledTimes(1);

      // 第二次：已运行 → 不重复设置
      controller.state.isRunning.mockReturnValue(true);
      controller.start();
      expect(controller.state.setRunning).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== stop 测试 ====================

  describe('stop', () => {
    test('运行中时应该设置 running 为 false', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController(games);

      controller.state.isRunning.mockReturnValue(true);

      controller.stop();

      expect(controller.state.setRunning).toHaveBeenCalledWith(false);
    });

    test('已停止时不应该重复设置', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController(games);

      controller.state.isRunning.mockReturnValue(false);

      controller.stop();

      expect(controller.state.setRunning).not.toHaveBeenCalled();
    });

    test('多次调用 stop 应该是幂等的', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController(games);

      // 第一次：运行中 → 停止
      controller.state.isRunning.mockReturnValue(true);
      controller.stop();
      expect(controller.state.setRunning).toHaveBeenCalledTimes(1);

      // 第二次：已停止 → 不重复
      controller.state.isRunning.mockReturnValue(false);
      controller.stop();
      expect(controller.state.setRunning).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== getOpponent 测试 ====================

  describe('getOpponent', () => {
    test('应该返回对手的 Game 实例', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createController([alice, bob]);

      expect(controller.getOpponent(alice)).toBe(bob);
      expect(controller.getOpponent(bob)).toBe(alice);
    });

    test('应该根据 id 查找对手', () => {
      const game1 = createMockGame('P1', 0, 'id-1');
      const game2 = createMockGame('P2', 1, 'id-2');
      const game3 = createMockGame('P3', 2, 'id-3');
      const controller = createController([game1, game2, game3]);

      expect(controller.getOpponent(game1)).toBe(game2);
    });

    test('所有玩家 id 相同时应返回 undefined', () => {
      const game1 = createMockGame('P1', 0, 'same-id');
      const game2 = createMockGame('P2', 1, 'same-id');
      const controller = createController([game1, game2]);

      expect(controller.getOpponent(game1)).toBeUndefined();
    });

    test('只有一个玩家时应该返回 undefined', () => {
      const game = createMockGame('Solo', 0, 'solo-id');
      const controller = createController([game]);

      expect(controller.getOpponent(game)).toBeUndefined();
    });

    test('空 games 数组时应该返回 undefined', () => {
      const controller = createController([]);

      expect(controller.getOpponent({ id: 'any' })).toBeUndefined();
    });
  });

  // ==================== update 测试 ====================

  describe('update', () => {
    test('应该正确执行游戏结束流程', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      const stopSpy = jest.spyOn(controller, 'stop');
      const startSpy = jest.spyOn(controller, 'start');
      const mockEvents = { RESTART: 'game:restart' };
      GameEvents.mockReturnValue(mockEvents);

      controller.update(bob);

      expect(stopSpy).toHaveBeenCalled();
      expect(controller.state.setWinner).toHaveBeenCalledWith(alice);
      expect(controller.state.updateScores).toHaveBeenCalledWith({
        winner: alice,
        loser: bob,
      });
      expect(controller.hud.updateScores).toHaveBeenCalledWith(alice, bob);
      expect(GameEvents).toHaveBeenCalledWith(bob.id);
      expect(bob.emit).toHaveBeenCalledWith(mockEvents.RESTART);
      expect(startSpy).toHaveBeenCalled();

      stopSpy.mockRestore();
      startSpy.mockRestore();
    });

    test('应该按正确顺序执行各步骤', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      const callOrder = [];

      jest.spyOn(controller, 'stop').mockImplementation(() => callOrder.push('stop'));
      controller.state.setWinner.mockImplementation(() => callOrder.push('setWinner'));
      controller.state.updateScores.mockImplementation(() => callOrder.push('updateScores'));
      controller.hud.updateScores.mockImplementation(() => callOrder.push('hudUpdate'));
      bob.emit.mockImplementation(() => callOrder.push('emit'));
      jest.spyOn(controller, 'start').mockImplementation(() => callOrder.push('start'));

      controller.update(bob);

      expect(callOrder.indexOf('stop')).toBe(0);
      expect(callOrder.indexOf('setWinner')).toBeLessThan(callOrder.indexOf('updateScores'));
      expect(callOrder.indexOf('updateScores')).toBeLessThan(callOrder.indexOf('hudUpdate'));
      expect(callOrder.indexOf('hudUpdate')).toBeLessThan(callOrder.indexOf('emit'));
      expect(callOrder.indexOf('emit')).toBeLessThan(callOrder.indexOf('start'));
    });

    test('应该正确识别胜者（Alice 失败 → Bob 获胜）', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      controller.update(alice);
      expect(controller.state.setWinner).toHaveBeenCalledWith(bob);
    });

    test('应该正确识别胜者（Bob 失败 → Alice 获胜）', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      controller.update(bob);
      expect(controller.state.setWinner).toHaveBeenCalledWith(alice);
    });

    test('应该通知败者重新开始', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      GameEvents.mockReturnValue({ RESTART: 'restart-event' });

      controller.update(bob);

      expect(GameEvents).toHaveBeenCalledWith(bob.id);
      expect(bob.emit).toHaveBeenCalledWith('restart-event');
      expect(alice.emit).not.toHaveBeenCalled();
    });

    test('应该使用败者的 id 初始化 GameEvents', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      controller.update(alice);
      expect(GameEvents).toHaveBeenCalledWith('alice-id');

      controller.update(bob);
      expect(GameEvents).toHaveBeenCalledWith('bob-id');
    });
  });

  // ==================== processAttack 测试 ====================

  describe('processAttack', () => {
    test('应该计算攻击力并转发给对手', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      const lines = [{}, {}, {}, {}];
      garbageSystem.calculateGarbage.mockReturnValue(3);
      controller.state.offsetGarbage.mockReturnValue(3);

      const result = controller.processAttack(alice, lines);

      expect(garbageSystem.calculateGarbage).toHaveBeenCalledWith(4);
      expect(controller.state.offsetGarbage).toHaveBeenCalledWith(alice, 3);
      expect(controller.state.addGarbage).toHaveBeenCalledWith(bob, 3);
      expect(result).toBe(3);
    });

    test('攻击力为 0 时应直接返回 0', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      garbageSystem.calculateGarbage.mockReturnValue(0);

      const result = controller.processAttack(alice, [{}]);

      expect(result).toBe(0);
      expect(controller.state.offsetGarbage).not.toHaveBeenCalled();
      expect(controller.state.addGarbage).not.toHaveBeenCalled();
    });

    test('抵消后无剩余不应发送垃圾行', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      garbageSystem.calculateGarbage.mockReturnValue(2);
      controller.state.offsetGarbage.mockReturnValue(0);

      const result = controller.processAttack(alice, [{}, {}, {}]);

      expect(result).toBe(0);
      expect(controller.state.addGarbage).not.toHaveBeenCalled();
    });

    test('应该找到正确的攻击目标', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      garbageSystem.calculateGarbage.mockReturnValue(2);
      controller.state.offsetGarbage.mockReturnValue(2);

      // Alice 攻击 → 目标 Bob
      controller.processAttack(alice, [{}, {}]);
      expect(controller.state.addGarbage).toHaveBeenCalledWith(bob, 2);

      // Bob 攻击 → 目标 Alice
      controller.state.addGarbage.mockClear();
      controller.processAttack(bob, [{}, {}]);
      expect(controller.state.addGarbage).toHaveBeenCalledWith(alice, 2);
    });

    test('应该传递正确的消行数给 calculateGarbage', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      const testCases = [1, 2, 3, 4, 5];

      testCases.forEach((lineCount) => {
        const lines = Array(lineCount).fill({});
        garbageSystem.calculateGarbage.mockClear();
        controller.state.offsetGarbage.mockReturnValue(0);

        controller.processAttack(alice, lines);

        expect(garbageSystem.calculateGarbage).toHaveBeenCalledWith(lineCount);
      });
    });

    test('空消行数组应返回 0', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      garbageSystem.calculateGarbage.mockReturnValue(0);

      const result = controller.processAttack(alice, []);

      expect(result).toBe(0);
      expect(garbageSystem.calculateGarbage).toHaveBeenCalledWith(0);
    });

    test('应该返回正确的剩余攻击力', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      // 场景1：有剩余
      garbageSystem.calculateGarbage.mockReturnValue(4);
      controller.state.offsetGarbage.mockReturnValue(4);
      expect(controller.processAttack(alice, [{}])).toBe(4);

      // 场景2：部分剩余
      controller.state.offsetGarbage.mockReturnValue(2);
      expect(controller.processAttack(alice, [{}])).toBe(2);

      // 场景3：无剩余
      controller.state.offsetGarbage.mockReturnValue(0);
      expect(controller.processAttack(alice, [{}])).toBe(0);
    });

    test('应该先抵消自己的垃圾行再攻击', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      const callOrder = [];

      controller.state.offsetGarbage.mockImplementation(() => {
        callOrder.push('offset');
        return 2;
      });
      controller.state.addGarbage.mockImplementation(() => {
        callOrder.push('add');
      });
      garbageSystem.calculateGarbage.mockReturnValue(3);

      controller.processAttack(alice, [{}, {}, {}]);

      expect(callOrder.indexOf('offset')).toBeLessThan(callOrder.indexOf('add'));
    });
  });

  // ==================== flushGarbage 测试 ====================

  describe('flushGarbage', () => {
    test('应该在棋盘上应用垃圾行', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController([game]);

      const mockBoard = [[0, 0], [0, 0]];
      const mockNewBoard = [[1, 1], [1, 1]];

      controller.state.getPendingGarbage.mockReturnValue(3);
      game.Store.getState.mockReturnValue({
        board: mockBoard,
        difficulty: 'normal',
      });
      garbageSystem.applyGarbage.mockReturnValue(mockNewBoard);

      controller.flushGarbage(game);

      expect(controller.state.getPendingGarbage).toHaveBeenCalledWith(game);
      expect(game.Store.getState).toHaveBeenCalled();
      expect(garbageSystem.applyGarbage).toHaveBeenCalledWith(
        mockBoard,
        3,
        'normal'
      );
      expect(game.Store.setState).toHaveBeenCalledWith({
        board: mockNewBoard,
      });
      expect(controller.state.clearGarbage).toHaveBeenCalledWith(game);
    });

    test('无待处理垃圾时应直接返回', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController([game]);

      game.Store.getState.mockClear();
      game.Store.setState.mockClear();
      garbageSystem.applyGarbage.mockClear();

      controller.state.getPendingGarbage.mockReturnValue(0);

      controller.flushGarbage(game);

      expect(game.Store.getState).not.toHaveBeenCalled();
      expect(garbageSystem.applyGarbage).not.toHaveBeenCalled();
      expect(game.Store.setState).not.toHaveBeenCalled();
    });

    test('待处理垃圾为负数时应直接返回', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController([game]);

      game.Store.getState.mockClear();
      game.Store.setState.mockClear();
      garbageSystem.applyGarbage.mockClear();

      controller.state.getPendingGarbage.mockReturnValue(-1);

      controller.flushGarbage(game);

      expect(game.Store.getState).not.toHaveBeenCalled();
      expect(garbageSystem.applyGarbage).not.toHaveBeenCalled();
      expect(game.Store.setState).not.toHaveBeenCalled();
    });

    test('应该传递正确的难度参数', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController([game]);

      const difficulties = ['easy', 'normal', 'hard', 'expert'];

      difficulties.forEach((difficulty) => {
        controller.state.getPendingGarbage.mockReturnValue(2);
        game.Store.getState.mockReturnValue({
          board: [],
          difficulty,
        });
        garbageSystem.applyGarbage.mockClear();

        controller.flushGarbage(game);

        expect(garbageSystem.applyGarbage).toHaveBeenCalledWith(
          [],
          2,
          difficulty
        );
      });
    });

    test('应该更新正确的棋盘状态', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController([game]);

      const originalBoard = [[1, 2], [3, 4]];
      const newBoard = [[5, 6], [7, 8]];

      controller.state.getPendingGarbage.mockReturnValue(1);
      game.Store.getState.mockReturnValue({
        board: originalBoard,
        difficulty: 'easy',
      });
      garbageSystem.applyGarbage.mockReturnValue(newBoard);

      controller.flushGarbage(game);

      expect(game.Store.setState).toHaveBeenCalledWith({
        board: newBoard,
      });
    });

    test('应用垃圾行后应该清空计数', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController([game]);

      controller.state.getPendingGarbage.mockReturnValue(2);
      game.Store.getState.mockReturnValue({
        board: [],
        difficulty: 'easy',
      });
      garbageSystem.applyGarbage.mockReturnValue([]);

      controller.flushGarbage(game);

      expect(controller.state.clearGarbage).toHaveBeenCalledWith(game);
    });

    test('处理流程顺序验证', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController([game]);

      const callOrder = [];

      controller.state.getPendingGarbage.mockImplementation(() => {
        callOrder.push('getPending');
        return 2;
      });
      game.Store.getState.mockImplementation(() => {
        callOrder.push('getState');
        return { board: [], difficulty: 'easy' };
      });
      garbageSystem.applyGarbage.mockImplementation(() => {
        callOrder.push('applyGarbage');
        return [];
      });
      game.Store.setState.mockImplementation(() => {
        callOrder.push('setState');
      });
      controller.state.clearGarbage.mockImplementation(() => {
        callOrder.push('clearGarbage');
      });

      controller.flushGarbage(game);

      expect(callOrder).toEqual([
        'getPending',
        'getState',
        'applyGarbage',
        'setState',
        'clearGarbage',
      ]);
    });
  });

  // ==================== subscribe 测试 ====================

  describe('subscribe', () => {
    test('应该委托给 router.subscribe', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController(games);

      controller.subscribe();

      expect(controller.router.subscribe).toHaveBeenCalledTimes(1);
    });

    test('可以多次调用', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController(games);

      controller.subscribe();
      controller.subscribe();
      controller.subscribe();

      expect(controller.router.subscribe).toHaveBeenCalledTimes(3);
    });
  });

  // ==================== unsubscribe 测试 ====================

  describe('unsubscribe', () => {
    test('应该委托给 router.unsubscribe', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController(games);

      controller.unsubscribe();

      expect(controller.router.unsubscribe).toHaveBeenCalledTimes(1);
    });

    test('可以多次调用', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController(games);

      controller.unsubscribe();
      controller.unsubscribe();

      expect(controller.router.unsubscribe).toHaveBeenCalledTimes(2);
    });
  });

  // ==================== 集成测试 ====================

  describe('集成测试', () => {
    test('完整的对战生命周期', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      // 1. 手动开始对战
      controller.start();

      // 2. Alice 消 4 行（Tetris）
      const lines = [{}, {}, {}, {}];
      garbageSystem.calculateGarbage.mockReturnValue(3);
      controller.state.offsetGarbage.mockReturnValue(3);

      const attackResult = controller.processAttack(alice, lines);
      expect(attackResult).toBe(3);
      expect(controller.state.addGarbage).toHaveBeenCalledWith(bob, 3);

      // 3. Bob 的垃圾行被刷新到棋盘
      controller.state.getPendingGarbage.mockReturnValue(3);
      const newBoard = [[1, 1], [1, 1]];
      bob.Store.getState.mockReturnValue({
        board: [[0, 0], [0, 0]],
        difficulty: 'normal',
      });
      garbageSystem.applyGarbage.mockReturnValue(newBoard);

      controller.flushGarbage(bob);

      expect(bob.Store.setState).toHaveBeenCalledWith({ board: newBoard });
      expect(controller.state.clearGarbage).toHaveBeenCalledWith(bob);

      // 4. Bob 游戏结束
      const stopSpy = jest.spyOn(controller, 'stop');
      const startSpy = jest.spyOn(controller, 'start');
      GameEvents.mockReturnValue({ RESTART: 'restart' });

      controller.update(bob);

      expect(stopSpy).toHaveBeenCalled();
      expect(controller.state.setWinner).toHaveBeenCalledWith(alice);
      expect(controller.state.updateScores).toHaveBeenCalledWith({
        winner: alice,
        loser: bob,
      });
      expect(controller.hud.updateScores).toHaveBeenCalledWith(alice, bob);
      expect(bob.emit).toHaveBeenCalledWith('restart');
      expect(startSpy).toHaveBeenCalled();

      stopSpy.mockRestore();
      startSpy.mockRestore();
    });

    test('攻防交互场景', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      // Bob 有 5 行待处理垃圾，消 3 行（攻击力 2）
      garbageSystem.calculateGarbage.mockReturnValue(2);
      controller.state.offsetGarbage.mockReturnValue(0);

      const bobAttack = controller.processAttack(bob, [{}, {}, {}]);
      expect(bobAttack).toBe(0);
      expect(controller.state.addGarbage).not.toHaveBeenCalled();

      // Bob 再次消 4 行（攻击力 3），全部抵消后还有剩余
      garbageSystem.calculateGarbage.mockReturnValue(3);
      controller.state.offsetGarbage.mockReturnValue(3);
      controller.state.addGarbage.mockClear();

      const bobAttack2 = controller.processAttack(bob, [{}, {}, {}, {}]);
      expect(bobAttack2).toBe(3);
      expect(controller.state.addGarbage).toHaveBeenCalledWith(alice, 3);
    });

    test('多局对战分数累积', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController([alice, bob]);

      GameEvents.mockReturnValue({ RESTART: 'restart' });

      // 第 1 局：Alice 赢
      controller.update(bob);
      expect(controller.state.updateScores).toHaveBeenCalledWith({
        winner: alice,
        loser: bob,
      });

      // 第 2 局：Alice 赢
      controller.update(bob);
      expect(controller.state.updateScores).toHaveBeenCalledWith({
        winner: alice,
        loser: bob,
      });

      // 第 3 局：Bob 赢
      controller.update(alice);
      expect(controller.state.updateScores).toHaveBeenCalledWith({
        winner: bob,
        loser: alice,
      });

      expect(controller.state.updateScores).toHaveBeenCalledTimes(3);
    });
  });
});
