/**
 * 测试对战控制器的完整功能
 *
 * @file BattleController 单元测试
 */

import BattleController from '@/lib/battle/battle-controller.js';
import BattleStore from '@/lib/battle/battle-store.js';
import BattleHUD from '@/lib/battle/battle-hud.js';
import BattleUI from '@/lib/battle/battle-ui.js';
import BattleRouter from '@/lib/events/router/battle-router.js';
import * as garbageSystem from '@/lib/battle/garbage-system.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

// ==================== Mock 模块 ====================

jest.mock('@/lib/core', () => {
  return jest.fn(function Base(options) {
    Object.assign(this, options);
    this.emit = jest.fn();
  });
});

jest.mock('@/lib/battle/battle-store.js', () => {
  return jest.fn(function (options) {
    Object.assign(this, options);
    this.state = {
      running: false,
      winner: null,
      scores: {},
      pendingGarbage: {},
      roundId: 0,
      VictoryScore: {
        easy: 5,
        normal: 8,
        hard: 12,
        expert: 15,
      },
    };

    if (options && options.games) {
      for (const game of options.games) {
        const playerId = `${game.Player.name}-${game.Player.index}`;
        this.state.scores[playerId] = 0;
        this.state.pendingGarbage[playerId] = 0;
      }
    }

    this.setRunning = jest.fn(function (running) {
      this.state.running = running;
    });
    this.isRunning = jest.fn(function () {
      return this.state.running;
    });
    this.setWinner = jest.fn(function (winner) {
      this.state.winner = winner;
    });
    this.getWinner = jest.fn(function () {
      return this.state.winner;
    });
    this.getScore = jest.fn(function (id) {
      return this.state.scores[id] || 0;
    });
    this.setScore = jest.fn(function (id, score) {
      this.state.scores[id] = score;
    });
    this.getPlayerId = jest.fn(function (game) {
      return `${game.Player.name}-${game.Player.index}`;
    });
    this.getVictoryScore = jest.fn(function (difficulty = 'easy') {
      return this.state.VictoryScore[difficulty];
    });
    this.setVictoryScore = jest.fn(function (difficulty, score) {
      this.state.VictoryScore[difficulty] = score;
    });
    this.updateScores = jest.fn();
    this.addGarbage = jest.fn();
    this.offsetGarbage = jest.fn();
    this.getPendingGarbage = jest.fn(function () {
      return 0;
    });
    this.clearGarbage = jest.fn();
    this.reset = jest.fn();
    this.initialize = jest.fn();
    this.increaseRound = jest.fn(function () {
      this.state.roundId += 1;
    });
    this.getRoundId = jest.fn(function () {
      return this.state.roundId;
    });
  });
});

jest.mock('@/lib/battle/battle-hud.js', () => {
  return jest.fn(function (options) {
    Object.assign(this, options);
    this.updateScores = jest.fn();
  });
});

jest.mock('@/lib/battle/battle-ui.js', () => {
  return jest.fn(function (options) {
    Object.assign(this, options);
    this.show = jest.fn();
    this.hide = jest.fn();
    this.$flies = {};
  });
});

jest.mock('@/lib/events/router/battle-router.js', () => {
  return jest.fn(function (options) {
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
  AudioEvents: jest.fn(() => ({
    PLAY_SOUND: 'audio:play:sound',
    STOP_BGM: 'audio:stop:bgm',
  })),
  BattleEvents: jest.fn(() => ({
    PROCESS_ATTACK: 'battle:process:attack',
    START_GARBAGE_FLY: 'battle:start:garbage:fly',
    FLUSH_GARBAGE: 'battle:flush:garbage',
    UPDATE_WINNER: 'battle:update:winner',
    SYNC_PAUSE: 'battle:sync:pause',
    SYNC_RESUME: 'battle:sync:resume',
    RESET: 'battle:reset',
    PLAYER_SURRENDER: 'battle:player:surrender',
  })),
}));

describe('BattleController', () => {
  // ==================== 辅助函数 ====================

  const createMockGame = (name, index, id) => ({
    id: id || `${name}-${index}`,
    Player: { name, index },
    Store: {
      getState: jest.fn(),
      setState: jest.fn(),
      getDifficulty: jest.fn(() => 'easy'),
    },
    Scheduler: {
      sequence: jest.fn((tasks) => {
        tasks.forEach((task) => task.fn && task.fn());
        return [];
      }),
      delay: jest.fn((fn) => {
        fn();
        return 1;
      }),
    },
    emit: jest.fn(),
    Animations: {
      clear: jest.fn(),
    },
    pause: jest.fn(),
    resume: jest.fn(),
  });

  const createController = (options = {}) => {
    const { games = [], elements = {}, players = [] } = options;
    return new BattleController({ games, elements, players });
  };

  const createCleanController = (options = {}) => {
    const controller = createController(options);
    controller.store.setRunning.mockClear();
    controller.store.setWinner.mockClear();
    controller.store.setScore.mockClear();
    controller.store.addGarbage.mockClear();
    controller.store.offsetGarbage.mockClear();
    controller.store.updateScores.mockClear();
    controller.store.clearGarbage.mockClear();
    controller.store.getPendingGarbage.mockClear();
    controller.store.increaseRound.mockClear();
    controller.store.getRoundId.mockClear();
    controller.store.getVictoryScore.mockClear();
    controller.hud.updateScores.mockClear();
    controller.router.subscribe.mockClear();
    controller.router.unsubscribe.mockClear();
    return controller;
  };

  // ==================== 构造函数测试 ====================

  describe('构造函数', () => {
    test('应该正确继承 Base 类', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createController({ games });
      expect(controller.games).toEqual(games);
    });

    test('应该自动调用 initialize 方法', () => {
      const initializeSpy = jest.spyOn(
        BattleController.prototype,
        'initialize',
      );
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      new BattleController({ games });
      expect(initializeSpy).toHaveBeenCalledTimes(1);
      initializeSpy.mockRestore();
    });

    test('应该接受空的 games 数组', () => {
      expect(() => new BattleController({ games: [] })).not.toThrow();
    });

    test('应该接受 elements 配置', () => {
      const games = [createMockGame('Alice', 0)];
      const elements = { overlay: 'test-overlay', winner: 'test-winner' };
      const controller = new BattleController({ games, elements });
      expect(controller.elements).toEqual(elements);
    });
  });

  // ==================== initialize 测试 ====================

  describe('initialize', () => {
    test('应该创建 BattleStore 实例并传入 games', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createController({ games });
      expect(BattleStore).toHaveBeenCalledWith({ games });
      expect(controller.store).toBeDefined();
    });

    test('应该创建 BattleHUD 实例并传入 games 和 store', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createController({ games });
      expect(BattleHUD).toHaveBeenCalledWith({
        games,
        store: controller.store,
      });
      expect(controller.hud).toBeDefined();
    });

    test('应该创建 BattleRouter 实例并传入自身引用', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createController({ games });
      expect(BattleRouter).toHaveBeenCalledWith({ battle: controller });
      expect(controller.router).toBeDefined();
    });

    test('应该创建 BattleUI 实例并传入 elements 和 players', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const elements = { overlay: 'battle-overlay', winner: 'battle-winner' };
      const players = ['Alice', 'Bob'];
      const controller = createController({ games, elements, players });
      expect(BattleUI).toHaveBeenCalledWith({ elements, players });
      expect(controller.ui).toBeDefined();
    });

    test('应该按依赖顺序创建子系统', () => {
      const callOrder = [];
      BattleStore.mockImplementationOnce(() => {
        callOrder.push('store');
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
      BattleUI.mockImplementationOnce(() => {
        callOrder.push('ui');
        return {};
      });

      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      createController({ games });

      expect(callOrder.indexOf('store')).toBeLessThan(callOrder.indexOf('hud'));
      expect(callOrder.indexOf('hud')).toBeLessThan(
        callOrder.indexOf('router'),
      );
      expect(callOrder.indexOf('router')).toBeLessThan(callOrder.indexOf('ui'));
    });

    test('应该自动调用 start 开始对战', () => {
      const startSpy = jest.spyOn(BattleController.prototype, 'start');
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      new BattleController({ games });
      expect(startSpy).toHaveBeenCalledTimes(1);
      startSpy.mockRestore();
    });
  });

  // ==================== start / stop 测试 ====================

  describe('start', () => {
    test('未运行时应该设置 running 为 true', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });
      controller.store.isRunning.mockReturnValue(false);
      controller.start();
      expect(controller.store.setRunning).toHaveBeenCalledWith(true);
    });

    test('已运行时不应该重复设置', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });
      controller.store.isRunning.mockReturnValue(true);
      controller.start();
      expect(controller.store.setRunning).not.toHaveBeenCalled();
    });

    test('多次调用 start 应该是幂等的', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });
      controller.store.isRunning.mockReturnValue(false);
      controller.start();
      expect(controller.store.setRunning).toHaveBeenCalledTimes(1);
      controller.store.isRunning.mockReturnValue(true);
      controller.start();
      expect(controller.store.setRunning).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    test('运行中时应该设置 running 为 false', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });
      controller.store.isRunning.mockReturnValue(true);
      controller.stop();
      expect(controller.store.setRunning).toHaveBeenCalledWith(false);
    });

    test('已停止时不应该重复设置', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });
      controller.store.isRunning.mockReturnValue(false);
      controller.stop();
      expect(controller.store.setRunning).not.toHaveBeenCalled();
    });

    test('多次调用 stop 应该是幂等的', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });
      controller.store.isRunning.mockReturnValue(true);
      controller.stop();
      expect(controller.store.setRunning).toHaveBeenCalledTimes(1);
      controller.store.isRunning.mockReturnValue(false);
      controller.stop();
      expect(controller.store.setRunning).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== getOpponent 测试 ====================

  describe('getOpponent', () => {
    test('应该返回对手的 Game 实例', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createController({ games: [alice, bob] });
      expect(controller.getOpponent(alice)).toBe(bob);
      expect(controller.getOpponent(bob)).toBe(alice);
    });

    test('所有玩家 id 相同时应返回 undefined', () => {
      const game1 = createMockGame('P1', 0, 'same-id');
      const game2 = createMockGame('P2', 1, 'same-id');
      const controller = createController({ games: [game1, game2] });
      expect(controller.getOpponent(game1)).toBeUndefined();
    });

    test('只有一个玩家时应该返回 undefined', () => {
      const game = createMockGame('Solo', 0, 'solo-id');
      const controller = createController({ games: [game] });
      expect(controller.getOpponent(game)).toBeUndefined();
    });

    test('空 games 数组时应该返回 undefined', () => {
      const controller = createController({ games: [] });
      expect(controller.getOpponent({ id: 'any' })).toBeUndefined();
    });
  });

  // ==================== update 测试 ====================

  describe('update', () => {
    test('未达到 victoryScore 时应该调用 restart 继续下一局', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      bob.Store.getDifficulty.mockReturnValue('easy');
      controller.store.getVictoryScore.mockReturnValue(5);
      controller.store.getScore.mockReturnValue(1);
      GameEvents.mockReturnValue({ RESTART: 'restart-event' });

      const restartSpy = jest.spyOn(controller, 'restart');
      const overSpy = jest.spyOn(controller, 'over');

      controller.update(alice);

      expect(restartSpy).toHaveBeenCalledWith(alice);
      expect(overSpy).not.toHaveBeenCalled();

      restartSpy.mockRestore();
      overSpy.mockRestore();
    });

    test('达到 victoryScore 时应该调用 over 结束整场对战', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      alice.Store.getDifficulty.mockReturnValue('expert');
      controller.store.getVictoryScore.mockReturnValue(15);
      controller.store.getScore.mockReturnValue(15);
      GameEvents.mockReturnValue({ RESTART: 'restart-event' });

      const restartSpy = jest.spyOn(controller, 'restart');
      const overSpy = jest.spyOn(controller, 'over');

      controller.update(bob);

      expect(overSpy).toHaveBeenCalledWith(alice, bob);
      expect(restartSpy).not.toHaveBeenCalled();

      restartSpy.mockRestore();
      overSpy.mockRestore();
    });

    test('应该先 stop、设置胜者、更新分数、更新 HUD，再做赛制判定', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      bob.Store.getDifficulty.mockReturnValue('easy');
      controller.store.getVictoryScore.mockReturnValue(5);
      controller.store.getScore.mockReturnValue(1);
      GameEvents.mockReturnValue({ RESTART: 'restart' });

      const stopSpy = jest.spyOn(controller, 'stop');
      const restartSpy = jest.spyOn(controller, 'restart');

      controller.update(alice);

      expect(stopSpy.mock.invocationCallOrder[0]).toBeLessThan(
        controller.store.setWinner.mock.invocationCallOrder[0],
      );
      expect(
        controller.store.setWinner.mock.invocationCallOrder[0],
      ).toBeLessThan(controller.store.updateScores.mock.invocationCallOrder[0]);
      expect(
        controller.store.updateScores.mock.invocationCallOrder[0],
      ).toBeLessThan(controller.hud.updateScores.mock.invocationCallOrder[0]);

      stopSpy.mockRestore();
      restartSpy.mockRestore();
    });

    test('应该正确识别胜者（Alice 失败，Bob 获胜）', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      bob.Store.getDifficulty.mockReturnValue('easy');
      controller.store.getVictoryScore.mockReturnValue(5);
      controller.store.getScore.mockReturnValue(1);
      GameEvents.mockReturnValue({ RESTART: 'restart' });

      controller.update(alice);
      expect(controller.store.setWinner).toHaveBeenCalledWith(bob);
    });

    test('应该正确识别胜者（Bob 失败，Alice 获胜）', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      alice.Store.getDifficulty.mockReturnValue('easy');
      controller.store.getVictoryScore.mockReturnValue(5);
      controller.store.getScore.mockReturnValue(1);
      GameEvents.mockReturnValue({ RESTART: 'restart' });

      controller.update(bob);
      expect(controller.store.setWinner).toHaveBeenCalledWith(alice);
    });

    test('应该使用败者的 id 初始化 GameEvents', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      bob.Store.getDifficulty.mockReturnValue('easy');
      controller.store.getVictoryScore.mockReturnValue(5);
      controller.store.getScore.mockReturnValue(1);

      GameEvents.mockClear();
      controller.update(alice);
      expect(GameEvents).toHaveBeenCalledWith('alice-id');

      GameEvents.mockClear();
      alice.Store.getDifficulty.mockReturnValue('easy');
      controller.update(bob);
      expect(GameEvents).toHaveBeenCalledWith('bob-id');
    });

    test('不同难度下 victoryScore 阈值应正确', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      const overSpy = jest.spyOn(controller, 'over');
      const restartSpy = jest.spyOn(controller, 'restart');

      const testCases = [
        {
          difficulty: 'easy',
          victoryScore: 5,
          score: 4,
          expectedRestart: true,
          expectedOver: false,
        },
        {
          difficulty: 'easy',
          victoryScore: 5,
          score: 5,
          expectedRestart: false,
          expectedOver: true,
        },
        {
          difficulty: 'normal',
          victoryScore: 8,
          score: 7,
          expectedRestart: true,
          expectedOver: false,
        },
        {
          difficulty: 'normal',
          victoryScore: 8,
          score: 8,
          expectedRestart: false,
          expectedOver: true,
        },
        {
          difficulty: 'hard',
          victoryScore: 12,
          score: 11,
          expectedRestart: true,
          expectedOver: false,
        },
        {
          difficulty: 'hard',
          victoryScore: 12,
          score: 12,
          expectedRestart: false,
          expectedOver: true,
        },
        {
          difficulty: 'expert',
          victoryScore: 15,
          score: 14,
          expectedRestart: true,
          expectedOver: false,
        },
        {
          difficulty: 'expert',
          victoryScore: 15,
          score: 15,
          expectedRestart: false,
          expectedOver: true,
        },
      ];

      testCases.forEach(
        ({
          difficulty,
          victoryScore,
          score,
          expectedRestart,
          expectedOver,
        }) => {
          overSpy.mockClear();
          restartSpy.mockClear();
          controller.store.setWinner.mockClear();
          controller.store.updateScores.mockClear();
          controller.hud.updateScores.mockClear();

          bob.Store.getDifficulty.mockReturnValue(difficulty);
          controller.store.getVictoryScore.mockReturnValue(victoryScore);
          controller.store.getScore.mockReturnValue(score);
          GameEvents.mockReturnValue({ RESTART: 'restart' });

          controller.update(alice);

          expect(restartSpy).toHaveBeenCalledTimes(expectedRestart ? 1 : 0);
          expect(overSpy).toHaveBeenCalledTimes(expectedOver ? 1 : 0);
        },
      );

      overSpy.mockRestore();
      restartSpy.mockRestore();
    });
  });

  // ==================== over 测试 ====================

  describe('over', () => {
    test('应该通知双方切换到 battle-over 模式并停止背景音乐', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      const winnerEvents = { UPDATE_MODE: 'winner:update:mode' };
      const loserEvents = { UPDATE_MODE: 'loser:update:mode' };

      GameEvents.mockReturnValueOnce(winnerEvents).mockReturnValueOnce(
        loserEvents,
      );

      controller.over(alice, bob);

      expect(alice.emit).toHaveBeenCalledWith('winner:update:mode', {
        mode: 'battle-over',
      });
      expect(bob.emit).toHaveBeenCalledWith('loser:update:mode', {
        mode: 'battle-over',
      });
      expect(alice.emit).toHaveBeenCalledWith('audio:stop:bgm');
    });

    test('应该在 120ms 延迟后播放 SWITCH_SCENE 音效', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      GameEvents.mockReturnValue({ UPDATE_MODE: 'update:mode' });

      controller.over(alice, bob);

      expect(alice.Scheduler.delay).toHaveBeenCalled();
      const delayFn = alice.Scheduler.delay.mock.calls[0][0];
      const delayMs = alice.Scheduler.delay.mock.calls[0][1];

      expect(delayMs).toBe(120);
      alice.emit.mockClear();
      delayFn();
      expect(alice.emit).toHaveBeenCalledWith('audio:play:sound', {
        sound: 'SWITCH_SCENE',
      });
    });

    test('应该显示胜者信息（传入 Player 对象）', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      GameEvents.mockReturnValue({ UPDATE_MODE: 'update:mode' });

      controller.over(alice, bob);

      expect(controller.ui.show).toHaveBeenCalledWith({
        winner: { name: 'Alice', index: 0 },
      });
    });

    test('胜者没有 Player 属性时应该传入 undefined', () => {
      const unknown = createMockGame('NoPlayer', 0, 'noplayer-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [unknown, bob] });

      GameEvents.mockReturnValue({ UPDATE_MODE: 'update:mode' });

      delete unknown.Player;

      controller.over(unknown, bob);

      expect(controller.ui.show).toHaveBeenCalledWith({
        winner: undefined,
      });
    });
  });

  // ==================== restart 测试 ====================

  describe('restart', () => {
    test('应该增加 roundId', () => {
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [createMockGame('Alice', 0), bob],
      });

      GameEvents.mockReturnValue({ RESTART: 'restart-event' });

      controller.restart(bob);

      expect(controller.store.increaseRound).toHaveBeenCalled();
    });

    test('应该清除双方动画', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      GameEvents.mockReturnValue({ RESTART: 'restart-event' });

      controller.restart(bob);

      expect(alice.Animations.clear).toHaveBeenCalled();
      expect(bob.Animations.clear).toHaveBeenCalled();
    });

    test('应该通知败者重新开始并启动对战', () => {
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [createMockGame('Alice', 0), bob],
      });

      GameEvents.mockReturnValue({ RESTART: 'restart-event' });

      const startSpy = jest.spyOn(controller, 'start');

      controller.restart(bob);

      expect(GameEvents).toHaveBeenCalledWith(bob.id);
      expect(bob.emit).toHaveBeenCalledWith('restart-event');
      expect(startSpy).toHaveBeenCalled();

      startSpy.mockRestore();
    });

    test('一方没有 Animations 时不应报错', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      delete alice.Animations;
      const controller = createCleanController({ games: [alice, bob] });

      GameEvents.mockReturnValue({ RESTART: 'restart-event' });

      expect(() => controller.restart(bob)).not.toThrow();
    });
  });

  // ==================== reset 测试 ====================

  describe('reset', () => {
    test('应该重置状态、HUD、隐藏 UI、通知双方重置', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      const fromEvents = { RESET: 'from:reset' };
      const opponentEvents = { RESET: 'opponent:reset' };

      GameEvents.mockReturnValueOnce(fromEvents).mockReturnValueOnce(
        opponentEvents,
      );

      controller.reset(alice);

      expect(controller.store.reset).toHaveBeenCalled();
      expect(controller.hud.updateScores).toHaveBeenCalledWith(alice, bob);
      expect(controller.ui.hide).toHaveBeenCalledWith({ over: true });
      expect(alice.emit).toHaveBeenCalledWith('from:reset');
      expect(bob.emit).toHaveBeenCalledWith('opponent:reset');
    });

    test('应该正确找到对手（Bob 发起重置，通知 Alice）', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      GameEvents.mockReturnValue({ RESET: 'reset-event' });

      controller.reset(bob);

      expect(alice.emit).toHaveBeenCalledWith('reset-event');
    });
  });

  // ==================== getRoundId 测试 ====================

  describe('getRoundId', () => {
    test('应该委托给 store.getRoundId', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });
      controller.store.getRoundId.mockReturnValue(5);

      expect(controller.getRoundId()).toBe(5);
      expect(controller.store.getRoundId).toHaveBeenCalled();
    });
  });

  // ==================== getOverlayFly 测试 ====================

  describe('getOverlayFly', () => {
    test('应该从 ui.$flies 中获取对应的 fly canvas', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });
      const mockCanvas = {};
      controller.ui.$flies['human-0'] = mockCanvas;

      expect(controller.getOverlayFly('human-0')).toBe(mockCanvas);
    });

    test('不存在的 index 应返回 undefined', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });

      expect(controller.getOverlayFly('nonexistent')).toBeUndefined();
    });
  });

  // ==================== surrender 测试 ====================

  describe('surrender', () => {
    test('应该将对手分数设为 victoryScore 并触发 over', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      bob.Store.getDifficulty.mockReturnValue('easy');
      controller.store.getVictoryScore.mockReturnValue(5);

      const overSpy = jest.spyOn(controller, 'over');

      controller.surrender(alice);

      expect(controller.store.setScore).toHaveBeenCalledWith('Bob-1', 5);
      expect(controller.store.setWinner).toHaveBeenCalledWith(bob);
      expect(controller.hud.updateScores).toHaveBeenCalledWith(bob, alice);
      expect(overSpy).toHaveBeenCalledWith(bob, alice);

      overSpy.mockRestore();
    });

    test('应该先停止对战', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      bob.Store.getDifficulty.mockReturnValue('easy');
      controller.store.getVictoryScore.mockReturnValue(5);

      const stopSpy = jest.spyOn(controller, 'stop');

      controller.surrender(bob);

      expect(stopSpy).toHaveBeenCalled();
      stopSpy.mockRestore();
    });

    test('认输时应根据难度获取对应的 victoryScore', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      bob.Store.getDifficulty.mockReturnValue('expert');
      controller.store.getVictoryScore.mockReturnValue(15);

      controller.surrender(alice);

      expect(controller.store.setScore).toHaveBeenCalledWith('Bob-1', 15);
    });
  });

  // ==================== processAttack 测试 ====================

  describe('processAttack', () => {
    test('应该计算攻击力并转发给对手', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      const lines = [{}, {}, {}, {}];
      garbageSystem.calculateGarbage.mockReturnValue(3);
      controller.store.offsetGarbage.mockReturnValue(3);

      const result = controller.processAttack(alice, lines);

      expect(garbageSystem.calculateGarbage).toHaveBeenCalledWith(4);
      expect(controller.store.offsetGarbage).toHaveBeenCalledWith(alice, 3);
      expect(controller.store.addGarbage).toHaveBeenCalledWith(bob, 3);
      expect(result).toBe(3);
    });

    test('攻击力为 0 时应直接返回 0', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController({ games: [alice] });

      garbageSystem.calculateGarbage.mockReturnValue(0);

      const result = controller.processAttack(alice, [{}]);

      expect(result).toBe(0);
      expect(controller.store.offsetGarbage).not.toHaveBeenCalled();
      expect(controller.store.addGarbage).not.toHaveBeenCalled();
    });

    test('抵消后无剩余不应发送垃圾行', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      garbageSystem.calculateGarbage.mockReturnValue(2);
      controller.store.offsetGarbage.mockReturnValue(0);

      const result = controller.processAttack(alice, [{}, {}, {}]);

      expect(result).toBe(0);
      expect(controller.store.addGarbage).not.toHaveBeenCalled();
    });

    test('应该找到正确的攻击目标', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      garbageSystem.calculateGarbage.mockReturnValue(2);
      controller.store.offsetGarbage.mockReturnValue(2);

      controller.processAttack(alice, [{}, {}]);
      expect(controller.store.addGarbage).toHaveBeenCalledWith(bob, 2);

      controller.store.addGarbage.mockClear();
      controller.processAttack(bob, [{}, {}]);
      expect(controller.store.addGarbage).toHaveBeenCalledWith(alice, 2);
    });

    test('应该传递正确的消行数给 calculateGarbage', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      [1, 2, 3, 4, 5].forEach((lineCount) => {
        const lines = Array(lineCount).fill({});
        garbageSystem.calculateGarbage.mockClear();
        controller.store.offsetGarbage.mockReturnValue(0);

        controller.processAttack(alice, lines);

        expect(garbageSystem.calculateGarbage).toHaveBeenCalledWith(lineCount);
      });
    });

    test('空消行数组应返回 0', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController({ games: [alice] });

      garbageSystem.calculateGarbage.mockReturnValue(0);
      const result = controller.processAttack(alice, []);
      expect(result).toBe(0);
      expect(garbageSystem.calculateGarbage).toHaveBeenCalledWith(0);
    });

    test('应该返回正确的剩余攻击力', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      garbageSystem.calculateGarbage.mockReturnValue(4);
      controller.store.offsetGarbage.mockReturnValue(4);
      expect(controller.processAttack(alice, [{}])).toBe(4);

      controller.store.offsetGarbage.mockReturnValue(2);
      expect(controller.processAttack(alice, [{}])).toBe(2);

      controller.store.offsetGarbage.mockReturnValue(0);
      expect(controller.processAttack(alice, [{}])).toBe(0);
    });

    test('应该先抵消自己的垃圾行再攻击', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      const callOrder = [];

      controller.store.offsetGarbage.mockImplementation(() => {
        callOrder.push('offset');
        return 2;
      });
      controller.store.addGarbage.mockImplementation(() => {
        callOrder.push('add');
      });
      garbageSystem.calculateGarbage.mockReturnValue(3);

      controller.processAttack(alice, [{}, {}, {}]);

      expect(callOrder.indexOf('offset')).toBeLessThan(
        callOrder.indexOf('add'),
      );
    });
  });

  // ==================== flushGarbage 测试 ====================

  describe('flushGarbage', () => {
    test('应该在棋盘上应用垃圾行', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController({ games: [game] });

      const mockBoard = [
        [0, 0],
        [0, 0],
      ];
      const mockNewBoard = [
        [1, 1],
        [1, 1],
      ];

      controller.store.getPendingGarbage.mockReturnValue(3);
      game.Store.getState.mockReturnValue({
        board: mockBoard,
        difficulty: 'normal',
      });
      garbageSystem.applyGarbage.mockReturnValue(mockNewBoard);

      controller.flushGarbage(game);

      expect(controller.store.getPendingGarbage).toHaveBeenCalledWith(game);
      expect(game.Store.getState).toHaveBeenCalled();
      expect(garbageSystem.applyGarbage).toHaveBeenCalledWith(
        mockBoard,
        3,
        'normal',
      );
      expect(game.Store.setState).toHaveBeenCalledWith({ board: mockNewBoard });
      expect(controller.store.clearGarbage).toHaveBeenCalledWith(game);
    });

    test('无待处理垃圾时应直接返回', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController({ games: [game] });

      game.Store.getState.mockClear();
      game.Store.setState.mockClear();
      garbageSystem.applyGarbage.mockClear();

      controller.store.getPendingGarbage.mockReturnValue(0);
      controller.flushGarbage(game);

      expect(game.Store.getState).not.toHaveBeenCalled();
      expect(garbageSystem.applyGarbage).not.toHaveBeenCalled();
      expect(game.Store.setState).not.toHaveBeenCalled();
    });

    test('待处理垃圾为负数时应直接返回', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController({ games: [game] });

      game.Store.getState.mockClear();
      game.Store.setState.mockClear();
      garbageSystem.applyGarbage.mockClear();

      controller.store.getPendingGarbage.mockReturnValue(-1);
      controller.flushGarbage(game);

      expect(game.Store.getState).not.toHaveBeenCalled();
      expect(garbageSystem.applyGarbage).not.toHaveBeenCalled();
      expect(game.Store.setState).not.toHaveBeenCalled();
    });

    test('应该传递正确的难度参数', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController({ games: [game] });

      ['easy', 'normal', 'hard', 'expert'].forEach((difficulty) => {
        controller.store.getPendingGarbage.mockReturnValue(2);
        game.Store.getState.mockReturnValue({ board: [], difficulty });
        garbageSystem.applyGarbage.mockClear();

        controller.flushGarbage(game);

        expect(garbageSystem.applyGarbage).toHaveBeenCalledWith(
          [],
          2,
          difficulty,
        );
      });
    });

    test('应该更新正确的棋盘状态', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController({ games: [game] });

      const originalBoard = [
        [1, 2],
        [3, 4],
      ];
      const newBoard = [
        [5, 6],
        [7, 8],
      ];

      controller.store.getPendingGarbage.mockReturnValue(1);
      game.Store.getState.mockReturnValue({
        board: originalBoard,
        difficulty: 'easy',
      });
      garbageSystem.applyGarbage.mockReturnValue(newBoard);

      controller.flushGarbage(game);

      expect(game.Store.setState).toHaveBeenCalledWith({ board: newBoard });
    });

    test('应用垃圾行后应该清空计数', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController({ games: [game] });

      controller.store.getPendingGarbage.mockReturnValue(2);
      game.Store.getState.mockReturnValue({ board: [], difficulty: 'easy' });
      garbageSystem.applyGarbage.mockReturnValue([]);

      controller.flushGarbage(game);

      expect(controller.store.clearGarbage).toHaveBeenCalledWith(game);
    });

    test('处理流程顺序验证', () => {
      const game = createMockGame('Alice', 0, 'alice-id');
      const controller = createCleanController({ games: [game] });

      const callOrder = [];

      controller.store.getPendingGarbage.mockImplementation(() => {
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
      controller.store.clearGarbage.mockImplementation(() => {
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

  // ==================== subscribe / unsubscribe ====================

  describe('subscribe', () => {
    test('应该委托给 router.subscribe', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });

      controller.subscribe();
      expect(controller.router.subscribe).toHaveBeenCalledTimes(1);
    });

    test('可以多次调用', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });

      controller.subscribe();
      controller.subscribe();
      controller.subscribe();

      expect(controller.router.subscribe).toHaveBeenCalledTimes(3);
    });
  });

  describe('unsubscribe', () => {
    test('应该委托给 router.unsubscribe', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });

      controller.unsubscribe();
      expect(controller.router.unsubscribe).toHaveBeenCalledTimes(1);
    });

    test('可以多次调用', () => {
      const games = [createMockGame('Alice', 0), createMockGame('Bob', 1)];
      const controller = createCleanController({ games });

      controller.unsubscribe();
      controller.unsubscribe();

      expect(controller.router.unsubscribe).toHaveBeenCalledTimes(2);
    });
  });

  // ==================== 集成测试 ====================

  describe('集成测试', () => {
    test('完整的对战生命周期（未达 victoryScore）', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      controller.start();

      garbageSystem.calculateGarbage.mockReturnValue(3);
      controller.store.offsetGarbage.mockReturnValue(3);

      const attackResult = controller.processAttack(alice, [{}, {}, {}, {}]);
      expect(attackResult).toBe(3);
      expect(controller.store.addGarbage).toHaveBeenCalledWith(bob, 3);

      controller.store.getPendingGarbage.mockReturnValue(3);
      bob.Store.getState.mockReturnValue({
        board: [
          [0, 0],
          [0, 0],
        ],
        difficulty: 'normal',
      });
      garbageSystem.applyGarbage.mockReturnValue([
        [1, 1],
        [1, 1],
      ]);
      controller.flushGarbage(bob);

      alice.Store.getDifficulty.mockReturnValue('easy');
      controller.store.getVictoryScore.mockReturnValue(5);
      controller.store.getScore.mockReturnValue(1);
      GameEvents.mockReturnValue({ RESTART: 'restart' });

      const restartSpy = jest.spyOn(controller, 'restart');
      controller.update(alice);

      expect(restartSpy).toHaveBeenCalledWith(alice);
      expect(controller.store.updateScores).toHaveBeenCalledWith({
        winner: bob,
        loser: alice,
      });

      restartSpy.mockRestore();
    });

    test('完整的对战生命周期（达到 victoryScore）', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      alice.Store.getDifficulty.mockReturnValue('expert');
      controller.store.getVictoryScore.mockReturnValue(15);
      controller.store.getScore.mockReturnValue(15);
      GameEvents.mockReturnValue({ UPDATE_MODE: 'update:mode' });

      const overSpy = jest.spyOn(controller, 'over');
      controller.update(bob);

      expect(overSpy).toHaveBeenCalledWith(alice, bob);
      expect(controller.ui.show).toHaveBeenCalledWith({
        winner: { name: 'Alice', index: 0 },
      });

      overSpy.mockRestore();
    });

    test('整场结束后重置再开始', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      GameEvents.mockReturnValue({ RESET: 'reset-event' });

      controller.reset(alice);

      expect(controller.store.reset).toHaveBeenCalled();
      expect(controller.hud.updateScores).toHaveBeenCalledWith(alice, bob);
      expect(controller.ui.hide).toHaveBeenCalledWith({ over: true });
      expect(alice.emit).toHaveBeenCalledWith('reset-event');
      expect(bob.emit).toHaveBeenCalledWith('reset-event');
    });

    test('攻防交互场景', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({ games: [alice, bob] });

      garbageSystem.calculateGarbage.mockReturnValue(2);
      controller.store.offsetGarbage.mockReturnValue(0);

      const bobAttack = controller.processAttack(bob, [{}, {}, {}]);
      expect(bobAttack).toBe(0);
      expect(controller.store.addGarbage).not.toHaveBeenCalled();

      garbageSystem.calculateGarbage.mockReturnValue(3);
      controller.store.offsetGarbage.mockReturnValue(3);
      controller.store.addGarbage.mockClear();

      const bobAttack2 = controller.processAttack(bob, [{}, {}, {}, {}]);
      expect(bobAttack2).toBe(3);
      expect(controller.store.addGarbage).toHaveBeenCalledWith(alice, 3);
    });

    test('多局对战分数累积', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      GameEvents.mockReturnValue({ RESTART: 'restart' });

      controller.store.getScore.mockReturnValue(1);

      bob.Store.getDifficulty.mockReturnValue('easy');
      controller.store.getVictoryScore.mockReturnValue(5);
      controller.update(bob);
      controller.update(bob);

      alice.Store.getDifficulty.mockReturnValue('easy');
      controller.update(alice);

      expect(controller.store.updateScores).toHaveBeenCalledTimes(3);
    });

    test('认输流程', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      const controller = createCleanController({
        games: [alice, bob],
      });

      bob.Store.getDifficulty.mockReturnValue('easy');
      controller.store.getVictoryScore.mockReturnValue(5);

      const overSpy = jest.spyOn(controller, 'over');

      controller.surrender(alice);

      expect(controller.store.setScore).toHaveBeenCalledWith('Bob-1', 5);
      expect(overSpy).toHaveBeenCalledWith(bob, alice);

      overSpy.mockRestore();
    });
  });

  // ==================== 边界测试 ====================

  describe('边界情况', () => {
    test('games 数组为空时不报错', () => {
      expect(() => {
        new BattleController({
          games: [],
          elements: {},
          players: [],
        });
      }).not.toThrow();
    });

    test('restart 时一方没有 Animations 不应报错', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      delete bob.Animations;
      const controller = createCleanController({ games: [alice, bob] });

      GameEvents.mockReturnValue({ RESTART: 'restart-event' });

      expect(() => controller.restart(alice)).not.toThrow();
    });

    test('双方都没有 Animations 时 restart 不应报错', () => {
      const alice = createMockGame('Alice', 0, 'alice-id');
      const bob = createMockGame('Bob', 1, 'bob-id');
      delete alice.Animations;
      delete bob.Animations;
      const controller = createCleanController({ games: [alice, bob] });

      GameEvents.mockReturnValue({ RESTART: 'restart-event' });

      expect(() => controller.restart(alice)).not.toThrow();
    });
  });
});
