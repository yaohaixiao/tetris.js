import Base from '@/lib/core';

/**
 * # 通用命令（Command）封装类
 *
 * 用于表示一个"可执行的游戏操作"，是输入系统和游戏逻辑之间的桥梁。
 *
 * ## 设计理念
 *
 * - **Input → Command → 执行**：键盘、手柄、AI 等输入源统一生成 Command， 由 dispatch 系统统一处理和分发
 * - **支持 Replay / AI / Macro**：Command 可被序列化存储，用于回放或 AI 训练
 * - **关注点分离**：Command 本身不包含业务逻辑，只描述"发生了什么操作"
 *
 * ## 常见的命令类型
 *
 * | action        | 说明      |
 * | ------------- | --------- |
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
   * ## 创建一个命令实例
   *
   * 通过父类 `Base` 的构造函数注入 payload 中的依赖， 然后调用 `initialize()` 设置命令的核心属性。
   *
   * @example
   *   // AI 发送左移命令
   *   const cmd = new Command('MOVE_LEFT', { Game: gameInstance });
   *
   *   // 键盘发送硬降命令
   *   const cmd = new Command('DROP', { Game: gameInstance });
   *
   * @param {string} action - 命令类型（如 MOVE_LEFT、ROTATE、DROP 等）
   * @param {object} [payload={}] - 命令携带的额外参数（如 Game 实例引用等）。默认值为 `{}`. Default
   *   is `{}`
   */
  constructor(action, payload) {
    // 将 payload 注入到实例上（如 Game 等依赖）
    super(payload);

    this.initialize(action, payload);
  }

  /**
   * ## 初始化命令的核心属性
   *
   * @param {string} action - 命令类型（如 MOVE_LEFT、ROTATE、DROP 等）
   * @param {object} [payload={}] - 命令携带的额外参数（如 Game 实例引用等）. Default is `{}`
   * @returns {void}
   */
  initialize(action, payload = {}) {
    /**
     * ## 命令的动作类型
     *
     * 标准动作包括：MOVE_LEFT、MOVE_RIGHT、MOVE_DOWN、ROTATE、DROP、
     * TOGGLE_PAUSED、RESTART、CONFIRM 等。
     *
     * @type {string}
     */
    this.action = action;

    /**
     * ## 命令携带的额外参数
     *
     * 通常包含 Game 实例引用，以便在执行时访问游戏状态。 通过父类 `Base` 的 `inject()` 方法，payload 中的属性
     * 也会被复制到实例上（如 `this.Game`）。
     *
     * @type {object}
     */
    this.payload = payload;
  }

  /**
   * ## 执行命令
   *
   * 将命令通过 `dispatch:command` 事件交给统一的 dispatch 系统处理。 Command
   * 本身不执行业务逻辑，只负责通知调度系统"有一个操作需要执行"。
   *
   * ### 执行流程
   *
   * 1. Command 通过 EventBus 发送 `dispatch:command` 事件
   * 2. Engine 层监听该事件，调用 `dispatchCommand` 函数
   * 3. `dispatchCommand` 根据当前游戏模式（mode）路由到对应的 action handler
   * 4. Action handler 执行业务逻辑（如移动方块、暂停游戏等）
   *
   * @example
   *   const cmd = new Command('ROTATE', { Game: game });
   *   cmd.execute(); // 触发一次旋转操作
   *
   * @returns {void}
   */
  execute() {
    const { action, payload } = this;

    /*
     * 通过 EventBus 发送 dispatch:command 事件：
     *
     * Engine._subscribe() 中监听此事件并调用 dispatchCommand 处理
     */
    this.emit('dispatch:command', {
      action,
      payload,
    });
  }
}

export default Command;
