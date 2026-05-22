import Base from '@/lib/core';

/* ---------- 子模块 ---------- */
import Canvas from '@/lib/services/ui/core/canvas.js';
import HudManager from '@/lib/services/ui/hud/hud-manager.js';

/* ---------- 场景绘制 ---------- */
import lazyRenderScene from '@/lib/services/ui/scene-manager/lazy-render-scene.js';
import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';

/* ---------- 画布绘制 ---------- */
import renderNextPiece from '@/lib/services/ui/next/render-next-piece.js';
import resize from '@/lib/services/ui/core/resize.js';

/* ---------- 特效绘制 ---------- */
import renderClearLines from '@/lib/services/ui/board/render-clear-lines.js';
import renderCountdown from '@/lib/services/ui/effects/render-countdown.js';
import renderLevelUp from '@/lib/services/ui/effects/render-level-up.js';

class CanvasRenderer extends Base {
  constructor(options) {
    super(options);

    this.initialize(options);
  }

  initialize(options) {
    const { Elements } = options;
    const { Hud, Main } = Elements;

    /**
     * ## HUD 显示管理器
     *
     * @type {object}
     */
    this.Hud = new HudManager(Hud);

    /**
     * ## Canvas 画布管理器
     *
     * @type {Canvas}
     */
    this.Canvas = new Canvas(Main);
  }

  /**
   * ## 更新游戏模式标识
   *
   * 修改棋盘 Canvas 的 `data-mode` 属性，用于 CSS 样式切换。
   *
   * @param {string} mode - 游戏模式
   * @returns {void}
   */
  updateMode(mode) {
    this.Canvas.gameBoard.dataset.mode = mode;
  }

  /**
   * ## 更新控制者标识
   *
   * @param {string} controller - 当前控制者（human / ai）
   * @returns {void}
   */
  updateController(controller) {
    this.Hud.updateController(controller);
  }

  /**
   * ## 更新 HUD 显示
   *
   * 从 Store 读取最新状态并更新 HUD 数字显示。
   *
   * @returns {void}
   */
  updateHud() {
    const { Store } = this;
    const state = Store.getState();
    const { mode, score, lines, level, highScore, needReset = false } = state;

    // 主菜单或需要重置时，重置 HUD 为初始值
    if (mode === 'main-menu' || needReset) {
      this.Hud.reset();
    }

    // 更新分数、行数、等级、最高分
    this.Hud.update({ score, lines, level, highScore });
  }

  /**
   * ## 更新 HUD 动画
   *
   * 每帧调用，驱动 HUD 数字的平滑过渡动画。
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {void}
   */
  tickHud(delta) {
    this.Hud.tick(delta);
  }

  /**
   * ## 延迟渲染场景
   *
   * 等待字体等资源加载完成后渲染主菜单场景。
   *
   * @returns {void}
   */
  lazyRender() {
    const { Store } = this;
    lazyRenderScene(this.Canvas, Store.getState());
  }

  /**
   * ## 渲染游戏场景
   *
   * 每帧调用，绘制棋盘和当前方块。
   *
   * @returns {void}
   */
  render() {
    const { Store } = this;
    renderScene(this.Canvas, Store.getState());
  }

  /**
   * ## 画布自适应
   *
   * 根据窗口尺寸调整棋盘大小。
   *
   * @returns {void}
   */
  resize() {
    resize(this.Canvas);
  }

  /** ## 处理渲染下一个方块 */
  renderNextPiece() {
    const { Canvas, Store } = this;
    renderNextPiece(Canvas, Store.getState());
  }

  /**
   * ## 处理渲染倒计时事件
   *
   * @param {object} state - 游戏状态信息
   * @returns {void}
   */
  renderCountdown(state) {
    renderCountdown(this.Canvas, state);
  }

  /**
   * ## 处理渲染消行闪烁事件
   *
   * @param {object} state - 游戏状态信息
   * @returns {void}
   */
  renderClearLines(state) {
    renderClearLines(this.Canvas, state);
  }

  /**
   * ## 处理渲染升级烟花事件
   *
   * @param {number} level - 新等级
   * @param {object[]} fireworks - 烟花粒子数组
   * @returns {void}
   */
  renderLevelUp(level, fireworks) {
    renderLevelUp(this.Canvas, level, fireworks);
  }
}

export default CanvasRenderer;
