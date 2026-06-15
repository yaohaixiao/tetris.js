import Base from '@/lib/core';

const CLS_HIDDEN = 'tetris-hidden';

/**
 * # 对战结果界面
 *
 * 在整场对战结束时展示最终胜负结果。 界面极其简洁——只显示赢家名称，覆盖层出现/消失。
 *
 * ## 显示内容
 *
 * - 胜者名称（高亮显示在覆盖层中）
 * - "再来一局"操作提示
 *
 * ## DOM 结构约定
 *
 * ```html
 * <section
 *   id="tetris-battle-overlay"
 *   class="tetris-battle-overlay tetris-hidden"
 * >
 *   <h2 class="tetris-battle-title">BATTLE OVER</h2>
 *   <div class="tetris-battle-winner">
 *     WINNER IS
 *     <span id="tetris-battle-winner" class="tetris-highlight">HUMAN</span>
 *   </div>
 *   <footer class="tetris-battle-actions">
 *     <div id="tetris-battle-rematch">ENTER TO REMATCH</div>
 *   </footer>
 * </section>
 * ```
 *
 * ## 交互流程
 *
 *     整场对战结束
 *       → BattleController._onMatchOver()
 *         → BattleUI.show('Alice')
 *           → $overlay 移除 tetris-hidden 类
 *           → $winner 显示 "Alice"
 *       → 用户按 Enter
 *         → BattleUI.hide()
 *           → $overlay 添加 tetris-hidden 类
 *           → $winner 清空
 *
 * ## 典型使用场景
 *
 * ```js
 * const battleUI = new BattleUI({
 *   elements: {
 *     overlay: 'tetris-battle-overlay',
 *     winner: 'tetris-battle-winner',
 *   },
 * });
 *
 * // 显示胜者
 * battleUI.show('Alice');
 *
 * // 隐藏界面
 * battleUI.hide();
 * ```
 *
 * @augments Base
 * @class BattleUI
 */
class BattleUI extends Base {
  /**
   * ## 构造函数
   *
   * 接收 DOM 元素的 ID 配置，缓存元素引用。
   *
   * @param {object} options - 配置选项
   */
  constructor(options) {
    // 调用父类构造函数，注入依赖
    super(options);

    // 立即初始化：缓存 DOM 元素引用
    this.initialize();
  }

  /**
   * ## 初始化
   *
   * 根据配置中的元素 ID，通过 `document.querySelector` 查找并缓存 DOM 元素引用。
   *
   * ### 缓存内容
   *
   * - `$overlay`：覆盖层元素，控制整个结果界面的显示/隐藏
   * - `$winner`：胜者名称显示元素，用于展示赢家名称
   *
   * @returns {void}
   */
  initialize() {
    const { elements, players } = this;
    // 从配置中解构出 DOM 元素 ID
    const { overlay, over, winner, fly } = elements;

    /** 缓存覆盖层元素引用： 通过 ID 选择器查找 DOM 元素。 如果元素不存在，值为 null。 */
    this.$overlay = document.querySelector(`#${overlay}`);

    this.$over = document.querySelector(`#${over}`);

    /** 缓存胜者名称元素引用： 通过 ID 选择器查找 DOM 元素。 如果元素不存在，值为 null。 */
    this.$winner = document.querySelector(`#${winner}`);

    this.$flies = {};

    for (const [index, player] of players.entries()) {
      const id = `${player}-${index}`;
      this.$flies[id] = document.querySelector(`#${id}-${fly}`);
    }
  }

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
   * ## 显示对战结果
   *
   * 在覆盖层中展示胜者名称，并显示覆盖层。
   *
   * ### 操作步骤
   *
   * 1. 将胜者名称写入 `$winner` 元素的 textContent
   * 2. 移除 `$overlay` 的 `tetris-hidden` 类，使覆盖层可见
   *
   * ### 为什么用 class 控制显示？
   *
   * - `tetris-hidden` 类设置 `display: none`
   * - 移除该类后覆盖层恢复默认显示状态
   * - 比直接操作 `style.display` 更易维护，样式集中在 CSS 中
   *
   * @example
   *   battleUI.show('Alice');
   *   // → 覆盖层显示，内容为 "Alice"
   *
   * @param {object} options - 显示的配置信息
   */
  show(options) {
    const { winner, fly } = options;
    const { $over, $winner, $flies, $overlay } = this;

    if (winner) {
      const name = winner.name?.toUpperCase?.() || 'HUMAN';
      const index = winner.index + 1 || 1;

      // 将胜者名称写入 DOM 元素
      $winner.textContent = `${name} (${index}P)`;
      $over.classList.remove(CLS_HIDDEN);
    } else {
      $flies[fly].classList.remove(CLS_HIDDEN);
    }

    // 移除隐藏类，显示覆盖层
    $overlay.classList.remove(CLS_HIDDEN);
  }

  /**
   * ## 隐藏对战结果
   *
   * 清空胜者名称并隐藏覆盖层。
   *
   * ### 操作步骤
   *
   * 1. 清空 `$winner` 元素的 textContent
   * 2. 添加 `tetris-hidden` 类，隐藏覆盖层
   *
   * ### 为什么清空 textContent？
   *
   * - 防止下次 show 时短暂闪现旧内容
   * - 保持 DOM 清洁
   * - 避免屏幕阅读器读到过时的内容
   *
   * @example
   *   battleUI.hide();
   *   // → 覆盖层隐藏，胜者名称清空
   *
   * @param {object} options - 参数对象
   */
  hide(options) {
    const { over, fly } = options;

    const { $over, $winner, $flies, $overlay } = this;

    if (over) {
      $over.classList.add(CLS_HIDDEN);
      // 清空胜者名称
      $winner.textContent = '';
    } else {
      $flies[fly].classList.add(CLS_HIDDEN);
    }

    if (this.isOverlayShouldHide(options)) {
      // 添加隐藏类，隐藏覆盖层
      $overlay.classList.add(CLS_HIDDEN);
    }
  }
}

export default BattleUI;
