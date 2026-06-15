import Base from '@/lib/core';

/* ---------- 子模块 ---------- */
import CanvasManager from '@/lib/services/ui/core/canvas-manager.js';
import HudManager from '@/lib/services/ui/hud/hud-manager.js';

/* ---------- 场景绘制 ---------- */
import lazyRenderScene from '@/lib/services/ui/scene-manager/lazy-render-scene.js';
import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';

/* ---------- 画布绘制 ---------- */
import renderNextPiece from '@/lib/services/ui/next/render-next-piece.js';
import renderHoldPiece from '@/lib/services/ui/hold/render-hold-piece.js';
import clearNextPiece from '@/lib/services/ui/next/clear-next-piece.js';
import clearHoldPiece from '@/lib/services/ui/hold/clear-hold-piece.js';
import renderGhostPiece from '@/lib/services/ui/board/render-ghost-piece.js';
import resize from '@/lib/services/ui/core/resize.js';

/* ---------- 特效绘制 ---------- */
import renderClearLines from '../effects/render-clear-lines.js';
import renderClearScore from '@/lib/services/ui/effects/render-clear-score.js';
import renderCountdown from '@/lib/services/ui/effects/render-countdown.js';
import renderLevelUp from '@/lib/services/ui/effects/render-level-up.js';
import renderLandingFlash from '@/lib/services/ui/effects/render-landing-flash.js';
import renderGarbageWarning from '@/lib/services/ui/effects/render-garbage-warning.js';
import renderGarbagePush from '@/lib/services/ui/effects/render-garbage-push.js';

/**
 * # CanvasRenderer（Canvas 渲染器）
 *
 * UI 层的**渲染执行者**，负责所有基于 Canvas 的实际绘制操作。 持有 `Canvas` 画布管理器和 `HudManager` HUD
 * 管理器， 是 UI 调度器与底层渲染函数之间的桥梁。
 *
 * ## 架构定位
 *
 *     UI（调度器）→ CanvasRenderer（本模块）→ Canvas / Hud
 *        → renderXxx() 渲染函数
 *
 * - **UI**：渲染调度器，只负责协调时机，不关心绘制细节
 * - **CanvasRenderer**：渲染执行者，持有 Canvas 和 Hud，调用底层渲染函数
 * - **可替换性**：未来可创建 `TerminalRenderer` 等实现相同接口的渲染器
 *
 * ## 核心职责
 *
 * | 职责       | 说明                                           |
 * | ---------- | ---------------------------------------------- |
 * | 棋盘渲染   | 绘制游戏主棋盘和当前活动方块                   |
 * | HUD 管理   | 更新分数、等级、最高分等 DOM 显示              |
 * | 场景渲染   | 主菜单、游戏中、暂停等场景切换                 |
 * | 动画特效   | 消行闪烁、得分弹出、倒计时、升级烟花、落地高亮 |
 * | 画布自适应 | 响应窗口尺寸变化                               |
 * | 预览方块   | 绘制下一个方块的预览                           |
 *
 * ## 依赖的底层渲染函数
 *
 * | 函数                 | 用途                         |
 * | -------------------- | ---------------------------- |
 * | `renderScene`        | 根据 mode 路由到对应场景渲染 |
 * | `lazyRenderScene`    | 等待字体加载后渲染主菜单     |
 * | `renderNextPiece`    | 绘制预览方块                 |
 * | `resize`             | 自适应画布尺寸               |
 * | `renderClearLines`   | 消行闪烁特效                 |
 * | `renderClearScore`   | 消除得分弹出动画             |
 * | `renderCountdown`    | 倒计时动画                   |
 * | `renderLevelUp`      | 升级烟花特效                 |
 * | `renderLandingFlash` | 落地高亮特效                 |
 *
 * @augments Base
 * @class CanvasRenderer
 */
class CanvasRenderer extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    // 调用父类构造函数，将配置注入实例
    super(options);
    // 立即初始化子模块
    this.initialize();
  }

  /**
   * ## 初始化渲染器
   *
   * 创建 HudManager 和 Canvas 实例。
   *
   * @returns {void}
   */
  initialize() {
    // 从注入的依赖中解构所需配置
    const { Game, Elements, Block, Player } = this;
    const { Hud, Canvas } = Elements;

    /**
     * ## HUD 显示管理器
     *
     * 管理分数、最高分、行数、等级、控制者标识的 DOM 显示和动画。 每个实例维护独立的追踪器，支持多实例（对战模式）。
     *
     * @type {HudManager}
     */
    this.Hud = new HudManager({ Hud, Player });

    /**
     * ## Canvas 画布管理器
     *
     * 持有主游戏棋盘和预览方块两个 Canvas 元素及其渲染上下文。
     *
     * @type {CanvasManager}
     */
    this.Canvas = new CanvasManager({
      uuid: Game.id,
      ...Canvas,
      ...Block,
      ...Player,
    });
  }

  getCanvas(isNext = false) {
    return this.Canvas.getCanvas(isNext);
  }

  // ==================== 状态更新方法 ====================

  /**
   * ## 更新游戏模式标识
   *
   * 修改棋盘 Canvas 的 `data-mode` 属性，用于 CSS 样式切换。
   *
   * @param {string} mode - 游戏模式（main-menu / playing / paused / game-over /
   *   replay）
   * @returns {void}
   */
  updateMode(mode) {
    this.Canvas.gameBoard.dataset.mode = mode;
  }

  /**
   * ## 更新控制者标识
   *
   * 在 HUD 上显示当前控制者身份（HUMAN 或 AI）。
   *
   * @param {string} controller - 当前控制者（'human' 或 'ai'），会转为大写显示
   * @returns {void}
   */
  updateController(controller) {
    this.Hud.updateController(controller);
  }

  /**
   * ## 更新 HUD 显示
   *
   * 从 Store 读取最新状态（分数、行数、等级、最高分），更新 HUD 的数字显示。 主菜单模式下会先重置 HUD 为初始值。
   *
   * @returns {void}
   */
  updateHud() {
    // 从 Store 获取当前游戏状态
    const { Store } = this;
    const state = Store.getState();
    const {
      mode,
      score,
      lines,
      level,
      highScore,
      combo = 0,
      needReset = false,
    } = state;

    // 主菜单模式或需要重置时，先归零所有 HUD 显示
    if (mode === 'main-menu' || needReset) {
      this.Hud.reset();
    }

    // 更新 HUD 数字显示
    this.Hud.update({ score, lines, level, highScore, combo });
  }

  /**
   * ## 更新 HUD 动画
   *
   * 每帧调用，驱动 HUD 数字（分数、最高分）的平滑过渡动画。
   *
   * @returns {void}
   */
  tickHud() {
    this.Hud.tick();
  }

  // ==================== 场景渲染方法 ====================

  /**
   * ## 延迟渲染场景
   *
   * 等待像素字体 "Press Start 2P" 加载完成后渲染主菜单场景。
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
   * 每帧调用，根据当前游戏模式（mode）路由到对应场景渲染函数。
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
   * 根据窗口尺寸调整棋盘和预览画布的大小。 重新计算 `blockSize` 和 `fontSize` 等全局参数。
   *
   * @returns {void}
   */
  resize() {
    resize(this.Canvas);
  }

  // ==================== 动画特效方法 ====================

  /**
   * ## 渲染下一个方块预览
   *
   * 在预览画布中居中绘制下一个方块的形状。
   *
   * @returns {void}
   */
  renderNextPiece() {
    const { Canvas, Store } = this;
    renderNextPiece(Canvas, Store.getState());
  }

  /**
   * ## 渲染缓存方块预览
   *
   * 在缓存画布中居中绘制缓存（Hold）方块的形状。
   *
   * @returns {void}
   */
  renderHoldPiece() {
    const { Canvas, Store } = this;
    renderHoldPiece(Canvas, Store.getState());
  }

  /**
   * ## 清空预览方块画布
   *
   * 清除下一个方块预览区域的 Canvas 内容。
   *
   * @returns {void}
   */
  clearNextPiece() {
    const { Canvas } = this;
    clearNextPiece(Canvas);
  }

  /**
   * ## 清空缓存方块画布
   *
   * 清除缓存（Hold）方块预览区域的 Canvas 内容。
   *
   * @returns {void}
   */
  clearHoldPiece() {
    const { Canvas } = this;
    clearHoldPiece(Canvas);
  }

  /**
   * ## 渲染幽灵方块（落点预览）
   *
   * 在当前方块的正下方绘制半透明的"幽灵"方块， 显示如果直接硬降（Hard Drop）方块将落到的位置。
   *
   * @param {object} ghost - 幽灵方块数据
   * @returns {void}
   */
  renderGhostPiece(ghost) {
    const { Canvas } = this;
    renderGhostPiece(Canvas, ghost);
  }

  /**
   * ## 渲染倒计时特效
   *
   * 在游戏开始前显示 3、2、1 的倒计时数字和缩放动画。
   *
   * @param {object} state - 倒计时动画状态
   * @param {number} state.number - 当前倒计时数字（3/2/1）
   * @param {number} state.scale - 数字缩放比例
   * @returns {void}
   */
  renderCountdown(state) {
    renderCountdown(this.Canvas, state);
  }

  /**
   * ## 渲染消行闪烁特效
   *
   * 在消除满行时，将待消除的行以白色高亮闪烁。 闪烁由 `ClearLinesAnimation` 控制，本方法只负责绘制。
   *
   * @param {object} state - 消行动画状态（含 lines 数组）
   * @returns {void}
   */
  renderClearLines(state) {
    renderClearLines(this.Canvas, state);
  }

  /**
   * ## 渲染消除得分弹出动画
   *
   * 在消除行的位置绘制上浮渐隐的得分数字。 动画由 `ClearScoreAnimation` 控制，本方法只负责绘制。
   *
   * @param {object} state - 得分动画状态
   * @param {number} state.score - 本次消除得分
   * @param {number} state.y - 消除行号
   * @param {number} state.alpha - 当前透明度
   * @param {number} state.offsetY - Y 轴上浮偏移量
   * @returns {void}
   */
  renderClearScore(state) {
    renderClearScore(this.Canvas, state);
  }

  /**
   * ## 渲染升级烟花特效
   *
   * 在玩家升级时显示烟花粒子动画和 "LEVEL UP" 文字。
   *
   * @param {number} level - 升级后的新等级
   * @param {object[]} fireworks - 烟花粒子数组
   * @returns {void}
   */
  renderLevelUp(level, fireworks) {
    renderLevelUp(this.Canvas, level, fireworks);
  }

  /**
   * ## 渲染落地高亮特效
   *
   * 方块落地的瞬间在落地格子上显示半透明白色覆盖。 动画由 `LandingFlashAnimation` 控制，本方法只负责绘制。
   *
   * @param {object} flashData - 高亮数据
   * @returns {void}
   */
  renderLandingFlash(flashData) {
    renderLandingFlash(this.Canvas, flashData);
  }

  /**
   * ## 渲染垃圾行预警特效
   *
   * 在棋盘顶部绘制红色半透明警告条，提示即将受到垃圾行攻击。 动画由 `GarbageWarningAnimation` 控制，本方法只负责绘制。
   *
   * @param {number} amount - 消减行数
   * @returns {void}
   */
  renderGarbageWarning(amount) {
    renderGarbageWarning(this.Canvas, amount);
  }

  /**
   * ## 渲染垃圾行推入动画
   *
   * 垃圾行插入后，棋盘整体下移的过渡动画。 动画由 `GarbagePushAnimation` 控制，本方法只负责绘制。
   *
   * @param {number[][]} rows - 垃圾行数据，二维数组
   * @param {boolean} visible - 是否可见
   * @returns {void}
   */
  renderGarbagePush(rows, visible) {
    renderGarbagePush(this.Canvas, rows, visible);
  }
}

export default CanvasRenderer;
