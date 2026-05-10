import EventBus from '@/lib/core/event-bus';

const REPLAY_ACTIONS = {
  /** ## 向左移动 */
  MOVE_LEFT: () => {
    EventBus.emit('game:move', {
      ox: -1,
      oy: 0,
    });
  },

  /** ## 向右移动 */
  MOVE_RIGHT: () => {
    EventBus.emit('game:move', {
      ox: 1,
      oy: 0,
    });
  },

  /** ## 向下移动（软降） */
  MOVE_DOWN: () => {
    EventBus.emit('game:move', {
      ox: 0,
      oy: 1,
    });
  },

  /** ## 旋转方块 */
  ROTATE: () => {
    EventBus.emit('game:rotate');
  },

  /** ## 硬降（直接落地） */
  DROP: () => {
    EventBus.emit('game:drop');
  },

  /**
   * ## 自动下落
   *
   * @param {object} payload - 命令参数
   */
  AUTO_TICK: (payload) => {
    EventBus.emit('game:tick', payload);
  },

  /**
   * 确认操作（例如：Enter / Space / OK）
   *
   * 作用：
   *
   * - 重置游戏状态
   * - 返回主菜单
   */
  CONFIRM: () => {
    EventBus.emit('game:reset');
  },
};

export default REPLAY_ACTIONS;
