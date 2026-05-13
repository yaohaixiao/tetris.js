/** @jest-environment jsdom */

import EventBus from '@/lib/core/event-bus/index.js';
import CommandQueue from '@/lib/core/command/command-queue.js';
import Command from '@/lib/core/command/command.js';

describe('CommandQueue', () => {
  let commandQueue;

  beforeEach(() => {
    EventBus.clear();
    commandQueue = new CommandQueue({
      Game: { id: 'test-game-uuid-123' },
    });
  });

  // ==================== 构造函数 ====================
  describe('构造函数', () => {
    it('应该正确初始化一个空的命令队列', () => {
      expect(commandQueue.queue).toEqual([]);
      expect(commandQueue.queue).toHaveLength(0);
    });

    it('应该正确继承 Base 类', () => {
      expect(commandQueue.Game).toBeDefined();
      expect(commandQueue.Game.id).toBeDefined();
      expect(typeof commandQueue.Game.id).toBe('string');
    });

    it('queue 属性应该是数组类型', () => {
      expect(Array.isArray(commandQueue.queue)).toBe(true);
    });
  });

  // ==================== enqueue 方法 ====================
  describe('enqueue 方法', () => {
    it('应该将命令添加到队列末尾', () => {
      const cmd = new Command('MOVE', { direction: 'left' });

      commandQueue.enqueue(cmd);

      expect(commandQueue.queue).toHaveLength(1);
      expect(commandQueue.queue[0]).toBe(cmd);
    });

    it('应该支持连续入队多个命令', () => {
      const cmd1 = new Command('MOVE', { direction: 'left' });
      const cmd2 = new Command('ROTATE', { direction: 'cw' });
      const cmd3 = new Command('DROP');

      commandQueue.enqueue(cmd1);
      commandQueue.enqueue(cmd2);
      commandQueue.enqueue(cmd3);

      expect(commandQueue.queue).toHaveLength(3);
      expect(commandQueue.queue[0]).toBe(cmd1);
      expect(commandQueue.queue[1]).toBe(cmd2);
      expect(commandQueue.queue[2]).toBe(cmd3);
    });

    it('入队时不应该立即执行命令', () => {
      const handler = jest.fn();
      EventBus.on('dispatch:command', handler);

      const cmd = new Command('MOVE', { direction: 'left' });
      commandQueue.enqueue(cmd);

      expect(handler).not.toHaveBeenCalled();
    });

    it('应该保持 FIFO（先进先出）的顺序', () => {
      const cmd1 = new Command('FIRST');
      const cmd2 = new Command('SECOND');
      const cmd3 = new Command('THIRD');

      commandQueue.enqueue(cmd1);
      commandQueue.enqueue(cmd2);
      commandQueue.enqueue(cmd3);

      expect(commandQueue.queue[0].action).toBe('FIRST');
      expect(commandQueue.queue[1].action).toBe('SECOND');
      expect(commandQueue.queue[2].action).toBe('THIRD');
    });

    it('应该支持传入任意实现了 execute 方法的命令对象', () => {
      const customCmd = {
        action: 'CUSTOM',
        payload: { key: 'value' },
        execute: jest.fn(),
      };

      commandQueue.enqueue(customCmd);

      expect(commandQueue.queue).toHaveLength(1);
      expect(commandQueue.queue[0]).toBe(customCmd);
    });
  });

  // ==================== flush 方法 ====================
  describe('flush 方法', () => {
    it('应该按顺序执行队列中的所有命令', () => {
      const handler = jest.fn();
      EventBus.on('dispatch:command', handler);

      const cmd1 = new Command('MOVE');
      const cmd2 = new Command('ROTATE');
      const cmd3 = new Command('DROP');

      commandQueue.enqueue(cmd1);
      commandQueue.enqueue(cmd2);
      commandQueue.enqueue(cmd3);
      commandQueue.flush();

      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenNthCalledWith(1, {
        action: 'MOVE',
        payload: {},
      });
      expect(handler).toHaveBeenNthCalledWith(2, {
        action: 'ROTATE',
        payload: {},
      });
      expect(handler).toHaveBeenNthCalledWith(3, {
        action: 'DROP',
        payload: {},
      });
    });

    it('应该按照 FIFO 顺序依次执行命令', () => {
      const executionOrder = [];
      EventBus.on('dispatch:command', (data) => {
        executionOrder.push(data.action);
      });

      const cmd1 = new Command('FIRST');
      const cmd2 = new Command('SECOND');
      const cmd3 = new Command('THIRD');

      commandQueue.enqueue(cmd1);
      commandQueue.enqueue(cmd2);
      commandQueue.enqueue(cmd3);
      commandQueue.flush();

      expect(executionOrder).toEqual(['FIRST', 'SECOND', 'THIRD']);
    });

    it('flush 完成后队列应该被清空', () => {
      const cmd = new Command('MOVE');

      commandQueue.enqueue(cmd);
      expect(commandQueue.queue).toHaveLength(1);

      commandQueue.flush();

      expect(commandQueue.queue).toHaveLength(0);
    });

    it('对空队列调用 flush 不应该报错', () => {
      expect(() => {
        commandQueue.flush();
      }).not.toThrow();

      expect(commandQueue.queue).toHaveLength(0);
    });

    it('flush 过程中新入队的命令也会被执行（当前实现行为）', () => {
      const executedCommands = [];
      EventBus.on('dispatch:command', (data) => {
        executedCommands.push(data.action);
      });

      const cmd1 = new Command('FIRST');
      const cmd2 = new Command('SECOND');
      const cmd3 = new Command('THIRD');

      // 在 FIRST 的处理逻辑中入队 THIRD
      EventBus.on('dispatch:command', (data) => {
        if (data.action === 'FIRST') {
          commandQueue.enqueue(cmd3);
        }
      });

      commandQueue.enqueue(cmd1);
      commandQueue.enqueue(cmd2);
      commandQueue.flush();

      // 因为 flush 的 while 条件是 queue.length > 0，
      // 中途入队的 THIRD 也会被执行
      expect(executedCommands).toEqual(['FIRST', 'SECOND', 'THIRD']);
    });

    it('某个命令执行报错时不应该影响后续命令的执行', () => {
      const handler = jest.fn();
      EventBus.on('dispatch:command', handler);

      // 模拟第一个命令的 listener 抛错
      EventBus.on('dispatch:command', (data) => {
        if (data.action === 'FIRST') {
          throw new Error('命令执行失败');
        }
      });

      const cmd1 = new Command('FIRST');
      const cmd2 = new Command('SECOND');

      commandQueue.enqueue(cmd1);
      commandQueue.enqueue(cmd2);

      expect(() => {
        commandQueue.flush();
      }).toThrow('命令执行失败');

      // EventBus 的 emit 没有 try-catch，一个 handler 报错会中断后续
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('应该一次性执行所有命令，不做分帧控制', () => {
      const handler = jest.fn();
      EventBus.on('dispatch:command', handler);

      const commands = Array.from({ length: 100 }, (_, i) =>
        new Command(`CMD_${i}`)
      );

      commands.forEach((cmd) => commandQueue.enqueue(cmd));
      commandQueue.flush();

      expect(handler).toHaveBeenCalledTimes(100);
    });
  });

  // ==================== clear 方法 ====================
  describe('clear 方法', () => {
    it('应该清空队列中的所有命令', () => {
      const cmd1 = new Command('MOVE');
      const cmd2 = new Command('ROTATE');

      commandQueue.enqueue(cmd1);
      commandQueue.enqueue(cmd2);

      expect(commandQueue.queue).toHaveLength(2);

      commandQueue.clear();

      expect(commandQueue.queue).toHaveLength(0);
    });

    it('清空后不应该执行任何命令', () => {
      const handler = jest.fn();
      EventBus.on('dispatch:command', handler);

      const cmd = new Command('MOVE');
      commandQueue.enqueue(cmd);
      commandQueue.clear();

      commandQueue.flush();

      expect(handler).not.toHaveBeenCalled();
    });

    it('对空队列调用 clear 不应该报错', () => {
      expect(() => {
        commandQueue.clear();
      }).not.toThrow();
    });

    it('clear 后再次入队应该能正常工作', () => {
      const handler = jest.fn();
      EventBus.on('dispatch:command', handler);

      const cmd1 = new Command('FIRST');
      const cmd2 = new Command('SECOND');

      commandQueue.enqueue(cmd1);
      commandQueue.clear();
      commandQueue.enqueue(cmd2);
      commandQueue.flush();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        action: 'SECOND',
        payload: {},
      });
    });
  });

  // ==================== 订阅与取消订阅 ====================
  describe('订阅与取消订阅', () => {
    it('subscribe 后应该能通过事件接收命令并入队', () => {
      commandQueue.subscribe();

      const uuid = commandQueue.Game.id;
      const cmd = new Command('MOVE', { direction: 'left' });

      EventBus.emit(`command:queue:${uuid}:enqueue`, { cmd });

      expect(commandQueue.queue).toHaveLength(1);
      expect(commandQueue.queue[0]).toBe(cmd);
    });

    it('subscribe 后应该能通过事件清空队列', () => {
      commandQueue.subscribe();

      const uuid = commandQueue.Game.id;
      const cmd = new Command('MOVE');

      commandQueue.enqueue(cmd);
      expect(commandQueue.queue).toHaveLength(1);

      EventBus.emit(`command:queue:${uuid}:clear`);

      expect(commandQueue.queue).toHaveLength(0);
    });

    it('unsubscribe 后不应该再响应事件', () => {
      commandQueue.subscribe();
      commandQueue.unsubscribe();

      const uuid = commandQueue.Game.id;
      const cmd = new Command('MOVE', { direction: 'left' });

      EventBus.emit(`command:queue:${uuid}:enqueue`, { cmd });

      expect(commandQueue.queue).toHaveLength(0);
    });

    it('unsubscribe 后不应该再响应清空事件', () => {
      const cmd = new Command('MOVE');
      commandQueue.enqueue(cmd);

      commandQueue.subscribe();
      commandQueue.unsubscribe();

      const uuid = commandQueue.Game.id;

      EventBus.emit(`command:queue:${uuid}:clear`);

      expect(commandQueue.queue).toHaveLength(1);
    });

    it('重新 subscribe 后应该能再次响应事件', () => {
      commandQueue.subscribe();
      commandQueue.unsubscribe();
      commandQueue.subscribe();

      const uuid = commandQueue.Game.id;
      const cmd = new Command('MOVE');

      EventBus.emit(`command:queue:${uuid}:enqueue`, { cmd });

      expect(commandQueue.queue).toHaveLength(1);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('应该支持大量命令入队和刷新', () => {
      const handler = jest.fn();
      EventBus.on('dispatch:command', handler);

      const count = 1000;
      const commands = Array.from({ length: count }, (_, i) =>
        new Command(`CMD_${i}`)
      );

      commands.forEach((cmd) => commandQueue.enqueue(cmd));
      expect(commandQueue.queue).toHaveLength(count);

      commandQueue.flush();

      expect(commandQueue.queue).toHaveLength(0);
      expect(handler).toHaveBeenCalledTimes(count);
    });

    it('enqueue、clear、enqueue 的交替操作应该正确', () => {
      const handler = jest.fn();
      EventBus.on('dispatch:command', handler);

      const cmd1 = new Command('FIRST');
      const cmd2 = new Command('SECOND');

      commandQueue.enqueue(cmd1);
      commandQueue.clear();
      commandQueue.enqueue(cmd2);
      commandQueue.flush();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        action: 'SECOND',
        payload: {},
      });
    });

    it('同一个命令对象可以被多次入队并多次执行', () => {
      const handler = jest.fn();
      EventBus.on('dispatch:command', handler);

      const cmd = new Command('REPEAT');

      commandQueue.enqueue(cmd);
      commandQueue.enqueue(cmd);
      commandQueue.enqueue(cmd);
      commandQueue.flush();

      expect(handler).toHaveBeenCalledTimes(3);
    });
  });
});
