import Base from '@/lib/core';

/* ---------- 子模块 ---------- */
// Canvas 画布管理器 — 持有主棋盘、预览方块、缓存方块的 Canvas 元素和渲染上下文
import CanvasManager from '@/lib/services/ui/core/canvas-manager.js';
// HUD 显示管理器 — 管理分数、最高分、行数、等级、控制者标识的 DOM 显示和动画
import HudManager from '@/lib/services/ui/hud/hud-manager.js';

/* ---------- 场景绘制 ---------- */
// 延迟渲染场景 — 等待字体加载后渲染主菜单
import lazyRenderScene from '@/lib/services/ui/scene-manager/lazy-render-scene.js';
// 场景渲染路由 — 根据 mode 路由到对应场景渲染函数
import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';

/* ---------- 画布绘制 ---------- */
// 渲染下一个方块预览
import renderNextPiece from '@/lib/services/ui/next/render-next-piece.js';
// 渲染缓存（Hold）方块预览
import renderHoldPiece from '@/lib/services/ui/hold/render-hold-piece.js';
// 清空预览方块画布
import clearNextPiece from '@/lib/services/ui/next/clear-next-piece.js';
// 清空缓存方块画布
import clearHoldPiece from '@/lib/services/ui/hold/clear-hold-piece.js';
// 渲染幽灵方块（落点预览）
import renderGhostPiece from '@/lib/services/ui/board/render-ghost-piece.js';
// 画布自适应 — 响应窗口尺寸变化，重新计算 blockSize 和 fontSize
import resize from '@/lib/services/ui/core/resize.js';

/* ---------- 特效绘制 ---------- */
// 消行闪烁特效
import renderClearLines from '../effects/render-clear-lines.js';
// 消除得分弹出动画
import renderClearScore from '@/lib/services/ui/effects/render-clear-score.js';
// 倒计时动画
import renderCountdown from '@/lib/services/ui/effects/render-countdown.js';
// 升级烟花特效
import renderLevelUp from '@/lib/services/ui/effects/render-level-up.js';
// 落地高亮特效
import renderLandingFlash from '@/lib/services/ui/effects/render-landing-flash.js';
// 垃圾行预警特效
import renderGarbageWarning from '@/lib/services/ui/effects/render-garbage-warning.js';
// 垃圾行推入动画
import renderGarbagePush from '@/lib/services/ui/effects/render-garbage-push.js';
// 手柄连接/断开通知
import renderGamepadNotification from '@/lib/services/ui/effects/render-gamepad-notification.js';

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
 * | 函数                        | 用途                         |
 * | --------------------------- | ---------------------------- |
 * | `renderScene`               | 根据 mode 路由到对应场景渲染 |
 * | `lazyRenderScene`           | 等待字体加载后渲染主菜单     |
 * | `renderNextPiece`           | 绘制预览方块                 |
 * | `resize`                    | 自适应画布尺寸               |
 * | `renderClearLines`          | 消行闪烁特效                 |
 * | `renderClearScore`          | 消除得分弹出动画             |
 * | `renderCountdown`           | 倒计时动画                   |
 * | `renderLevelUp`             | 升级烟花特效                 |
 * | `renderLandingFlash`        | 落地高亮特效                 |
 * | `renderGarbageWarning`      | 垃圾行预警特效               |
 * | `renderGarbagePush`         | 垃圾行推入动画               |
 * | `renderGamepadNotification` | 手柄连接/断开通知            |
 *
 * @augments Base
 * @class CanvasRenderer
 */
class CanvasRenderer extends Base {
  /**
   * ## 构造函数
   *
   * 接收依赖配置，调用 `initialize()` 创建子模块。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，将配置对象中的所有属性注入实例
    super(options);
    // 所有配置就绪后，立即初始化子模块
    this.initialize();
  }

  /**
   * ## 初始化渲染器
   *
   * 创建 HudManager（HUD 显示管理器）和 CanvasManager（Canvas 画布管理器）实例。
   * 这两个管理器是渲染器的基础依赖，后续所有渲染操作都通过它们进行。
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
     * 通过数字平滑过渡动画提升视觉体验。
     *
     * @type {HudManager}
     */
    this.Hud = new HudManager({ Hud, Player });

    /**
     * ## Canvas 画布管理器
     *
     * 持有主游戏棋盘（gameBoard）、预览方块（nextPiece）、缓存方块（holdPiece） 三个 Canvas 元素及其 2D
     * 渲染上下文。 同时管理 blockSize、fontSize 等全局渲染参数。
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

  /**
   * ## 获取 Canvas 画布管理器
   *
   * 供外部模块（如 FlyAnimation）获取棋盘的 DOM 元素引用。
   *
   * @param {boolean} [isNext=false] - 是否获取预览方块 Canvas. Default is `false`
   * @returns {HTMLCanvasElement} Canvas DOM 元素
   */
  getCanvas(isNext = false) {
    return this.Canvas.getCanvas(isNext);
  }

  // ==================== 状态更新方法 ====================

  /**
   * ## 更新游戏模式标识
   *
   * 修改棋盘 Canvas 的 `data-mode` 属性，用于 CSS 样式切换。 不同模式对应不同的视觉风格（如主菜单、游戏中、暂停）。
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
   * 在 HUD 上显示当前控制者身份（HUMAN 或 AI）。 控制者切换时自动更新 DOM 文本。
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
   * 从 Store 读取最新状态（分数、行数、等级、最高分、连击数）， 更新 HUD 的数字显示。
   *
   * ### 特殊处理
   *
   * - 主菜单模式（main-menu）或需要重置（needReset）时，先归零所有 HUD 显示
   * - 通过 HudManager.update() 平滑过渡数字动画
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

    // 更新 HUD 数字显示（含平滑过渡动画）
    this.Hud.update({ score, lines, level, highScore, combo });
  }

  /**
   * ## 更新 HUD 动画
   *
   * 每帧调用，驱动 HUD 数字（分数、最高分）的平滑过渡动画。 由 Engine 的游戏循环在每帧中调用。
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
   * 等待像素字体 "Press Start 2P" 加载完成后渲染主菜单场景。 使用 document.fonts.ready 检测字体加载状态。
   * 在游戏首次启动时调用一次。
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
   * ### 模式路由
   *
   * - Main-menu → 主菜单场景
   * - Playing → 游戏主场景（棋盘 + 当前方块 + ghost）
   * - Paused → 暂停场景
   * - Game-over → 游戏结束场景
   * - Replay → 回放场景
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
   * 根据窗口尺寸调整棋盘和预览画布的大小。 重新计算 `blockSize` 和 `fontSize` 等全局参数，
   * 确保游戏界面在不同屏幕尺寸下保持正确的比例。
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
   * 在预览画布中居中绘制下一个方块的形状。 使用当前关卡的配色方案。
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
   * 在缓存画布中居中绘制缓存（Hold）方块的形状。 如果 Hold 槽为空，显示灰色半透明方块。
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
   * 清除下一个方块预览区域的 Canvas 内容。 在方块生成失败或游戏结束时调用。
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
   * 清除缓存（Hold）方块预览区域的 Canvas 内容。 在游戏重置时调用。
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
   * 在当前方块的正下方绘制半透明的"幽灵"方块， 显示如果直接硬降（Hard Drop）方块将落到的位置。 Level <= 9
   * 时才绘制，高等级不显示落点预览增加难度。
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
   * 在游戏开始前显示 3、2、1 的倒计时数字和缩放动画。 动画由 `CountdownAnimation` 控制，本方法只负责根据状态绘制。
   *
   * @param {object} state - 倒计时动画状态
   * @param {number} state.number - 当前倒计时数字（3/2/1）
   * @param {number} state.scale - 数字缩放比例（1.0 → 1.5 → 1.0）
   * @returns {void}
   */
  renderCountdown(state) {
    renderCountdown(this.Canvas, state);
  }

  /**
   * ## 渲染消行闪烁特效
   *
   * 在消除满行时，将待消除的行以白色高亮闪烁。 闪烁由 `ClearLinesAnimation` 控制（6 次切换，共 720ms），
   * 本方法只负责在可见帧绘制白色覆盖。
   *
   * @param {object} state - 消行动画状态
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
   * @param {number} state.y - 消除行的 Y 坐标
   * @param {number} state.alpha - 当前透明度（1.0 → 0）
   * @param {number} state.offsetY - Y 轴上浮偏移量
   * @returns {void}
   */
  renderClearScore(state) {
    renderClearScore(this.Canvas, state);
  }

  /**
   * ## 渲染升级烟花特效
   *
   * 在玩家升级时显示烟花粒子动画和 "LEVEL UP" 文字。 动画由 `LevelUpAnimation` 控制，本方法只负责绘制。
   *
   * @param {number} level - 升级后的新等级
   * @param {object[]} fireworks - 烟花粒子数组，每个粒子包含 x、y、vx、vy、color、life
   * @returns {void}
   */
  renderLevelUp(level, fireworks) {
    renderLevelUp(this.Canvas, level, fireworks);
  }

  /**
   * ## 渲染落地高亮特效
   *
   * 方块落地的瞬间在落地格子上显示半透明（60% 透明度）白色覆盖。 动画由 `LandingFlashAnimation` 控制（约 200ms），
   * 本方法只负责绘制。
   *
   * @param {object} flashData - 高亮数据
   * @param {object[]} flashData.cells - 需要高亮的格子数组
   * @returns {void}
   */
  renderLandingFlash(flashData) {
    renderLandingFlash(this.Canvas, flashData);
  }

  /**
   * ## 渲染垃圾行预警特效
   *
   * 在棋盘上绘制半透明橙色覆盖层 + 网格线 + "INCOMING ATTACK" 警告文字。 根据 amount
   * 显示不同颜色（2行黄色/3行橙色/4行红色）。 动画由 `GarbageWarningAnimation` 控制（5 次闪烁共 600ms），
   * 本方法只负责绘制。
   *
   * @param {number} amount - 即将到来的垃圾行数量
   * @returns {void}
   */
  renderGarbageWarning(amount) {
    renderGarbageWarning(this.Canvas, amount);
  }

  /**
   * ## 渲染垃圾行推入动画
   *
   * 垃圾行插入后，垃圾方块在灰色和白色之间交替闪烁。 动画由 `GarbagePushAnimation` 控制（5 次闪烁共 600ms），
   * 本方法只负责绘制。
   *
   * @param {number[][]} rows - 垃圾行数据（二维数组，0=空洞，非0=垃圾方块）
   * @param {boolean} visible - 当前帧是否可见（true=绘制灰色，false=绘制白色）
   * @returns {void}
   */
  renderGarbagePush(rows, visible) {
    renderGarbagePush(this.Canvas, rows, visible);
  }

  /**
   * ## 渲染手柄连接/断开通知
   *
   * 在棋盘上显示半透明遮罩 + 手柄图标 + 状态文字。 连接时显示绿色 "CONNECTED"，断开时显示橙色 "DISCONNECTED"。 动画由
   * `GamepadNotificationAnimation` 控制（6 次闪烁共 1200ms）， 本方法只负责绘制。
   *
   * @param {boolean} connected - 手柄是否已连接（true=连接，false=断开）
   * @returns {void}
   */
  renderGamepadNotification(connected) {
    renderGamepadNotification(this.Canvas, connected);
  }
}

export default CanvasRenderer;
