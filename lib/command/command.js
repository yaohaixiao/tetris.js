import dispatchCommand from '@/lib/command/dispatch-command.js';

/**
 * # 通用命令（Command）封装类
 *
 * 用于表示一个“可执行的游戏操作”，例如：
 *
 * - MOVE
 * - ROTATE
 * - DROP
 * - START_GAME
 *
 * 设计理念：
 *
 * - Input → Command → Engine 执行
 * - 支持 Replay / AI / Macro
 *
 * 关键原则： Command 本身不包含业务逻辑，只描述“发生了什么”
 */
class Command {
  /**
   * ## 创建一个命令实例
   *
   * @param {string} type - 命令类型（如 MOVE / ROTATE）
   * @param {object} [payload={}] - 命令参数（如方向、等级等）. Default is `{}`
   */
  constructor(type, payload = {}) {
    this.type = type;
    this.payload = payload;
  }

  /**
   * ## 执行命令
   *
   * 将命令交给统一的 dispatch 系统处理， 而不是在 Command 内部写逻辑。
   *
   * @param {object} engine - 游戏引擎实例
   */
  execute(engine) {
    dispatchCommand(this, engine);
  }
}

export default Command;
