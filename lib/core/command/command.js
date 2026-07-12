import Base from '@/lib/core';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：Command 通用命令封装类
 *
 * ============================================================
 *
 * 用于表示一个"可执行的游戏操作"， 是输入系统和游戏逻辑之间的桥梁。
 *
 * ## 设计理念
 *
 * - Input → Command → 执行：键盘、手柄、AI 等输入源统一生成 Command， 由 dispatch 系统统一处理和分发
 * - 支持 Replay / AI：Command 可被序列化存储，用于回放或 AI 训练
 * - 关注点分离：Command 本身不包含业务逻辑，只描述"发生了什么操作"
 *
 * ## 常见的命令类型
 *
 * | action        | 说明      |
 * | :------------ | :-------- |
 * | MOVE_LEFT     | 左移      |
 * | MOVE_RIGHT    | 右移      |
 * | MOVE_DOWN     | 软降      |
 * | ROTATE        | 旋转      |
 * | DROP          | 硬降      |
 * | TOGGLE_PAUSED | 暂停/继续 |
 * | RESTART       | 重新开始  |
 * | CONFIRM       | 确认      |
 *
 * @augments Base
 * @class Command
 */
class Command extends Base {
  /**
   * ## 构造函数
   *
   * @param {string} action - 命令类型
   * @param {object} [payload={}] - 命令携带的额外参数. Default is `{}`
   */
  constructor(action, payload) {
    super(payload);
    this.initialize(action, payload);
  }

  /**
   * ## initialize：初始化命令的核心属性
   *
   * @param {string} action - 命令类型
   * @param {object} [payload={}] - 命令携带的额外参数. Default is `{}`
   * @returns {void}
   */
  initialize(action, payload = {}) {
    /**
     * 命令的动作类型。
     *
     * @type {string}
     */
    this.action = action;

    /**
     * 命令携带的额外参数。
     *
     * 通常包含 Game 实例引用，通过 Base 的 inject() 方法， payload 中的属性也会被复制到实例上。
     *
     * @type {object}
     */
    this.payload = payload;
  }

  /**
   * ## execute：执行命令
   *
   * 将命令通过 dispatch:command 事件交给统一的 dispatch 系统处理。 Command 本身不执行业务逻辑，只负责通知调度系统。
   *
   * @returns {void}
   */
  execute() {
    const { action, payload } = this;
    const { Game } = payload;
    const events = GameEvents(Game.id);

    this.emit(events.DISPATCH_COMMAND, { action, payload });
  }
}

export default Command;
