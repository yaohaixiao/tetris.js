import Base from '@/lib/core/index.js';

/** CSS 类名：隐藏元素。 对应 CSS 中 `.tetris-hidden { display: none; }`。 */
const CLS_HIDDEN = 'tetris-hidden';

/**
 * # 对战结果界面
 *
 * 在整场对战结束时展示最终胜负结果，同时管理 fly canvas 的显示/隐藏。 界面极其简洁——只显示赢家名称，覆盖层出现/消失。
 *
 * ## 显示内容
 *
 * - 胜者名称（高亮显示在覆盖层中）
 * - "再来一局"操作提示
 * - 垃圾行飞行动画的独立 fly canvas（每位玩家一个）
 *
 * ## DOM 结构约定
 *
 * ```html
 * <section
 *   id="tetris-battle-overlay"
 *   class="tetris-battle-overlay tetris-hidden"
 * >
 *   <section
 *     id="tetris-battle-over"
 *     class="tetris-battle-over tetris-hidden"
 *   >
 *     <h2 class="tetris-battle-title">BATTLE OVER</h2>
 *     <div class="tetris-battle-winner">
 *       WINNER IS
 *       <span id="tetris-battle-winner" class="tetris-highlight"
 *         >HUMAN</span
 *       >
 *     </div>
 *     <footer class="tetris-battle-actions">
 *       <div class="tetris-battle-rematch">ENTER TO REMATCH</div>
 *     </footer>
 *   </section>
 *   <canvas
 *     id="human-0-tetris-battle-fly"
 *     class="tetris-battle-fly tetris-hidden"
 *   ></canvas>
 *   <canvas
 *     id="human-1-tetris-battle-fly"
 *     class="tetris-battle-fly tetris-hidden"
 *   ></canvas>
 * </section>
 * ```
 *
 * ## 交互流程
 *
 *     整场对战结束
 *       → BattleController.over()
 *         → BattleUI.show({ winner: Player })
 *           → $overlay 移除 tetris-hidden 类
 *           → $over 移除 tetris-hidden 类（显示胜者面板）
 *           → $winner 显示胜者名称
 *       → 用户按 Enter
 *         → BattleController.reset()
 *           → BattleUI.hide({ over: true })
 *             → $over 添加 tetris-hidden 类
 *             → $winner 清空
 *             → $overlay 添加 tetris-hidden 类
 *
 *     垃圾行攻击
 *       → BattleController.processAttack()
 *         → BattleUI.show({ fly: playerId })
 *           → 对应 fly canvas 移除 tetris-hidden 类
 *           → $overlay 移除 tetris-hidden 类
 *       → 动画结束后
 *         → BattleUI.hide({ fly: playerId })
 *           → 对应 fly canvas 添加 tetris-hidden 类
 *           → 所有 fly 都隐藏后，$overlay 添加 tetris-hidden 类
 *
 * ## 显示状态互斥
 *
 * $over（胜者面板）和 $flies（fly canvas）互斥显示：
 *
 * - 显示胜者时，fly 全部隐藏
 * - 显示 fly 时，胜者面板隐藏
 *
 * @augments Base
 * @class BattleUI
 */
class BattleUI extends Base {
  /**
   * ## 构造函数
   *
   * 接收 DOM 元素的 ID 配置和玩家列表，缓存元素引用。
   *
   * @param {object} options - 配置选项
   * @param {object} options.elements - DOM 元素 ID 配置
   * @param {string} options.elements.overlay - 覆盖层容器元素 ID
   * @param {string} options.elements.over - 胜者面板元素 ID
   * @param {string} options.elements.winner - 胜者名称显示元素 ID
   * @param {string} options.elements.fly - Fly canvas 元素 ID 前缀
   * @param {string[]} options.players - 玩家名称数组（如 ['human', 'human']）
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，将配置注入实例
    super(options);

    // 立即初始化：缓存 DOM 元素引用
    this.initialize();
  }

  /**
   * ## 初始化
   *
   * 根据配置中的元素 ID，通过 `document.querySelector` 查找并缓存所有 DOM 元素引用。
   *
   * ### 缓存内容
   *
   * - `$overlay`：覆盖层容器元素，控制整个结果界面的显示/隐藏
   * - `$over`：胜者面板元素，显示 BATTLE OVER 和胜者名称
   * - `$winner`：胜者名称显示元素，用于展示赢家名称
   * - `$flies`：fly canvas 映射表，key 为 `{player}-{index}`，value 为对应 canvas 元素
   *
   * @returns {void}
   */
  initialize() {
    // 从注入的配置中解构元素 ID 和玩家列表
    const { elements, players } = this;
    // 从 elements 中解构各 DOM 元素的 ID
    const { overlay, over, winner, fly } = elements;

    /** 缓存覆盖层容器元素引用。 覆盖层是包含胜者面板和所有 fly canvas 的父容器， 通过 tetris-hidden 类控制整体显示/隐藏。 */
    /** @type {HTMLElement | null} */
    this.$overlay = document.querySelector(`#${overlay}`);

    /** 缓存胜者面板元素引用。 仅在整场对战结束时显示，包含 BATTLE OVER 标题和胜者名称。 */
    /** @type {HTMLElement | null} */
    this.$over = document.querySelector(`#${over}`);

    /** 缓存胜者名称元素引用。 由 BattleUI.show({ winner }) 动态填充胜者名称文本。 */
    /** @type {HTMLElement | null} */
    this.$winner = document.querySelector(`#${winner}`);

    /**
     * 缓存所有 fly canvas 元素引用。
     *
     * Key 格式：`{player}-{index}`（如 "human-0"、"human-1"）。 Value：对应的 canvas DOM
     * 元素。
     *
     * 每位玩家拥有独立的 fly canvas，避免双方同时攻击时 共享 canvas 导致粒子互相覆盖。
     */
    /** @type {object} */
    this.$flies = {};

    // 遍历所有玩家，为每位玩家查找对应的 fly canvas
    for (const [index, player] of players.entries()) {
      // 构造玩家标识 key：如 "human-0"
      const id = `${player}-${index}`;
      // 通过 ID 选择器查找：如 #human-0-tetris-battle-fly
      this.$flies[id] = document.querySelector(`#${id}-${fly}`);
    }
  }

  /**
   * ## 判断覆盖层是否应该隐藏
   *
   * 覆盖层同时包含胜者面板和 fly canvas 两种内容。 只有当需要隐藏的内容（over 或 fly）已经处于隐藏状态，
   * 且另一方（如果存在）也已隐藏时，才允许隐藏整个覆盖层。
   *
   * ### 判断逻辑
   *
   * - 隐藏 over：检查 over 是否已含 CLS_HIDDEN
   * - 隐藏 fly：检查所有 fly canvas 是否都已含 CLS_HIDDEN
   *
   * @param {object} options - 参数对象
   * @param {boolean} [options.over] - 是否隐藏胜者面板
   * @param {string} [options.fly] - 要隐藏的 fly canvas 的 key
   * @returns {boolean} True 表示覆盖层应该隐藏
   */
  isOverlayShouldHide(options) {
    const { $over, $flies } = this;
    const { over } = options;

    return over
      ? // 如果要隐藏 over，检查 over 是否已经隐藏
        $over.classList.contains(CLS_HIDDEN)
      : // 如果要隐藏 fly，检查所有 fly 是否都已经隐藏
        Object.values($flies).every(($fly) =>
          $fly.classList.contains(CLS_HIDDEN),
        );
  }

  /**
   * ## 显示对战结果或 fly canvas
   *
   * 根据 options 中的参数决定显示胜者面板还是某个 fly canvas。 两者互斥：显示胜者时所有 fly 隐藏，显示 fly
   * 时胜者面板保持隐藏。
   *
   * ### 显示胜者
   *
   * - 将胜者名称（含 1P/2P 标识）写入 $winner 元素
   * - 显示胜者面板（$over 移除 tetris-hidden）
   * - 显示覆盖层容器（$overlay 移除 tetris-hidden）
   *
   * ### 显示 fly
   *
   * - 显示指定玩家的 fly canvas（移除 tetris-hidden）
   * - 显示覆盖层容器（$overlay 移除 tetris-hidden）
   *
   * @example
   *   // 显示胜者
   *   battleUI.show({ winner: { name: 'Alice', index: 0 } });
   *
   *   // 显示 P2 的 fly canvas
   *   battleUI.show({ fly: 'human-1' });
   *
   * @param {object} options - 显示的配置信息
   * @param {object} [options.winner] - 胜者信息
   * @param {string} options.winner.name - 胜者名称
   * @param {number} options.winner.index - 胜者索引（0=1P, 1=2P）
   * @param {string} [options.fly] - 要显示的 fly canvas 的 key
   */
  show(options) {
    // 解构参数
    const { winner, fly } = options;
    // 解构缓存的 DOM 引用
    const { $over, $winner, $flies, $overlay } = this;

    if (winner) {
      /**
       * 显示胜者面板：
       *
       * 1. 提取胜者名称并转为大写，不存在则默认 "HUMAN"
       * 2. 计算显示序号（index + 1 = 1P 或 2P）
       * 3. 写入 $winner 元素（如 "ALICE (1P)"）
       * 4. 显示胜者面板
       */
      const name = winner.name?.toUpperCase?.() || 'HUMAN';
      const index = winner.index + 1 || 1;

      // 将胜者名称和序号写入 DOM 元素
      $winner.textContent = `${name} (${index}P)`;
      // 移除隐藏类，显示胜者面板
      $over.classList.remove(CLS_HIDDEN);
    } else {
      /**
       * 显示指定玩家的 fly canvas：
       *
       * $flies[fly] 获取对应玩家的 canvas 元素， 移除 tetris-hidden 类使其可见。
       */
      $flies[fly].classList.remove(CLS_HIDDEN);
    }

    /** 显示覆盖层容器。 无论显示胜者还是 fly，覆盖层都需要可见， 因为 fly canvas 是覆盖层的子元素。 */
    $overlay.classList.remove(CLS_HIDDEN);
  }

  /**
   * ## 隐藏对战结果或 fly canvas
   *
   * 根据 options 决定隐藏胜者面板还是某个 fly canvas。 如果所有子元素都已隐藏，则同时隐藏覆盖层容器。
   *
   * ### 隐藏胜者面板
   *
   * - 清空 $winner 文本
   * - 隐藏胜者面板（$over 添加 tetris-hidden）
   * - 如果所有 fly 也已隐藏 → 隐藏覆盖层
   *
   * ### 隐藏 fly
   *
   * - 隐藏指定 fly canvas（添加 tetris-hidden）
   * - 如果所有 fly 和 over 都已隐藏 → 隐藏覆盖层
   *
   * @example
   *   // 隐藏胜者面板
   *   battleUI.hide({ over: true });
   *
   *   // 隐藏 P2 的 fly canvas
   *   battleUI.hide({ fly: 'human-1' });
   *
   * @param {object} options - 参数对象
   * @param {boolean} [options.over] - 是否隐藏胜者面板
   * @param {string} [options.fly] - 要隐藏的 fly canvas 的 key
   */
  hide(options) {
    // 解构参数
    const { over, fly } = options;
    // 解构缓存的 DOM 引用
    const { $over, $winner, $flies, $overlay } = this;

    if (over) {
      /**
       * 隐藏胜者面板：
       *
       * 1. 添加 tetris-hidden 类
       * 2. 清空胜者名称文本，防止下次显示时短暂闪现旧内容
       */
      $over.classList.add(CLS_HIDDEN);
      // 清空胜者名称
      $winner.textContent = '';
    } else {
      /**
       * 隐藏指定玩家的 fly canvas：
       *
       * 添加 tetris-hidden 类使其不可见。
       */
      $flies[fly].classList.add(CLS_HIDDEN);
    }

    /**
     * 检查覆盖层是否应该隐藏。
     *
     * 只有当所有子元素（over 和所有 fly）都已隐藏时， 才隐藏覆盖层容器。这确保了：
     *
     * - 双方同时有 fly 动画时，一方结束不会提前关闭覆盖层
     * - 胜者面板显示时，fly 不会干扰
     */
    if (this.isOverlayShouldHide(options)) {
      // 添加隐藏类，隐藏整个覆盖层容器
      $overlay.classList.add(CLS_HIDDEN);
    }
  }
}

export default BattleUI;
