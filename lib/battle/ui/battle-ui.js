import Base from '@/lib/core/index.js';

// CSS 类名：隐藏元素。对应 CSS 中 .tetris-hidden { display: none; }。
const CLS_HIDDEN = 'tetris-hidden';

/**
 * ============================================================
 *
 * # 模块：BattleUI 对战结果界面
 *
 * ============================================================
 *
 * 在整场对战结束时展示最终胜负结果， 同时管理 fly canvas 的显示/隐藏。
 *
 * ## 显示内容
 *
 * - 胜者名称（高亮显示在覆盖层中）
 * - "再来一局"操作提示
 * - 垃圾行飞行动画的独立 fly canvas（每位玩家一个）
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
   * @param {object} options - 配置选项
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## initialize：初始化
   *
   * 根据配置中的元素 ID，查找并缓存所有 DOM 元素引用。
   *
   * @returns {void}
   */
  initialize() {
    const { elements, players } = this;
    const { overlay, over, winner, fly } = elements;

    /** @type {HTMLElement | null} 覆盖层容器元素 */
    this.$overlay = document.querySelector(`#${overlay}`);

    /** @type {HTMLElement | null} 胜者面板元素 */
    this.$over = document.querySelector(`#${over}`);

    /** @type {HTMLElement | null} 胜者名称显示元素 */
    this.$winner = document.querySelector(`#${winner}`);

    /**
     * 所有 fly canvas 元素引用。
     *
     * Key 格式：{player}-{index}，Value：对应的 canvas DOM 元素。
     *
     * @type {object}
     */
    this.$flies = {};

    for (const [index, player] of players.entries()) {
      const id = `${player}-${index}`;
      this.$flies[id] = document.querySelector(`#${id}-${fly}`);
    }
  }

  /**
   * ## isOverlayShouldHide：判断覆盖层是否应该隐藏
   *
   * 只有当需要隐藏的内容已处于隐藏状态， 且另一方也已隐藏时，才允许隐藏整个覆盖层。
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
      ? $over.classList.contains(CLS_HIDDEN)
      : Object.values($flies).every(($fly) =>
          $fly.classList.contains(CLS_HIDDEN),
        );
  }

  /**
   * ## show：显示对战结果或 fly canvas
   *
   * 根据 options 决定显示胜者面板还是某个 fly canvas。 两者互斥：显示胜者时所有 fly 隐藏，显示 fly 时胜者面板保持隐藏。
   *
   * @param {object} options - 显示的配置信息
   * @param {object} [options.winner] - 胜者信息
   * @param {string} options.winner.name - 胜者名称
   * @param {number} options.winner.index - 胜者索引（0=1P, 1=2P）
   * @param {string} [options.fly] - 要显示的 fly canvas 的 key
   */
  show(options) {
    const { winner, fly } = options;
    const { $over, $winner, $flies, $overlay } = this;

    if (winner) {
      // 显示胜者面板
      const name = winner.name?.toUpperCase?.() || 'HUMAN';
      const index = winner.index + 1 || 1;

      $winner.textContent = `${name} (${index}P)`;
      $over.classList.remove(CLS_HIDDEN);
    } else {
      // 显示指定玩家的 fly canvas
      $flies[fly].classList.remove(CLS_HIDDEN);
    }

    // 显示覆盖层容器
    $overlay.classList.remove(CLS_HIDDEN);
  }

  /**
   * ## hide：隐藏对战结果或 fly canvas
   *
   * 根据 options 决定隐藏胜者面板还是某个 fly canvas。 如果所有子元素都已隐藏，则同时隐藏覆盖层容器。
   *
   * @param {object} options - 参数对象
   * @param {boolean} [options.over] - 是否隐藏胜者面板
   * @param {string} [options.fly] - 要隐藏的 fly canvas 的 key
   */
  hide(options) {
    const { over, fly } = options;
    const { $over, $winner, $flies, $overlay } = this;

    if (over) {
      // 隐藏胜者面板
      $over.classList.add(CLS_HIDDEN);
      $winner.textContent = '';
    } else {
      // 隐藏指定玩家的 fly canvas
      $flies[fly].classList.add(CLS_HIDDEN);
    }

    // 所有子元素都已隐藏时，隐藏覆盖层容器
    if (this.isOverlayShouldHide(options)) {
      $overlay.classList.add(CLS_HIDDEN);
    }
  }
}

export default BattleUI;
