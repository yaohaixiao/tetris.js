import Base from '@/lib/core';
import CanvasRenderer from '@/lib/services/ui/core/canvas-renderer.js';
import UIRouter from '@/lib/events/router/ui-router.js';

/**
 * ============================================================
 *
 * # UI（界面渲染调度器）
 *
 * ============================================================
 *
 * 统一管理游戏的所有视觉呈现。作为**调度层**， 不直接操作 Canvas 或 DOM，而是将所有渲染请求委托给 `CanvasRenderer`。
 *
 * ## 架构定位
 *
 *     EventBus → UIRouter → UI（本模块）→ CanvasRenderer → Canvas / Hud
 *
 * - **UIRouter**：监听 `ui:*` 事件，路由到 UI 方法
 * - **UI**：渲染调度器，负责协调渲染时机，不关心具体绘制细节
 * - **CanvasRenderer**：渲染执行者，持有 Canvas 和 Hud，负责实际绘制
 *
 * ## 核心职责
 *
 * | 职责       | 说明                                       |
 * | ---------- | ------------------------------------------ |
 * | 渲染调度   | 接收 Router 回调，委托给 Renderer 执行     |
 * | 模式切换   | 更新棋盘 `data-mode` 属性                  |
 * | HUD 更新   | 委托 Renderer 更新分数、等级、控制者标识等 |
 * | 动画特效   | 消行闪烁、倒计时、升级烟花、垃圾行预警等   |
 * | 画布自适应 | 响应窗口尺寸变化                           |
 * | 场景切换   | 主菜单、游戏界面等场景的渲染               |
 *
 * ## 设计特点
 *
 * - **不持有 Canvas / Hud**：全部交给 Renderer，UI 只是一个代理层
 * - **可替换渲染器**：只需替换 `this.Renderer` 即可切换渲染策略（如 Canvas → Terminal 命令行渲染）
 * - **不订阅事件**：事件路由在 `UIRouter` 中处理，UI 只暴露公开方法
 * - **多实例支持**：对战模式可创建多个 UI 实例，各自绑定独立的 Renderer
 *
 * ## 事件映射
 *
 * | 事件                                  | 方法                          | 说明             |
 * | ------------------------------------- | ----------------------------- | ---------------- |
 * | `ui:<id>:update:controller`           | `updateController()`          | 更新控制者标识   |
 * | `ui:<id>:update:mode`                 | `updateMode()`                | 更新游戏模式标识 |
 * | `ui:<id>:update:hud`                  | `updateHud()`                 | 更新 HUD 数据    |
 * | `ui:<id>:resize`                      | `resize()`                    | 画布自适应       |
 * | `ui:<id>:render:next:piece`           | `renderNextPiece()`           | 渲染预览方块     |
 * | `ui:<id>:render:hold:piece`           | `renderHoldPiece()`           | 渲染缓存方块     |
 * | `ui:<id>:clear:next:piece`            | `clearNextPiece()`            | 清空预览方块     |
 * | `ui:<id>:clear:hold:piece`            | `clearHoldPiece()`            | 清空缓存方块     |
 * | `ui:<id>:render:ghost:piece`          | `renderGhostPiece()`          | 渲染幽灵方块     |
 * | `ui:<id>:render:countdown`            | `renderCountdown()`           | 渲染倒计时       |
 * | `ui:<id>:render:clear:lines`          | `renderClearLines()`          | 渲染消行闪烁     |
 * | `ui:<id>:render:clear:score`          | `renderClearScore()`          | 渲染消除得分动画 |
 * | `ui:<id>:render:level:up`             | `renderLevelUp()`             | 渲染升级烟花     |
 * | `ui:<id>:render:landing:flash`        | `renderLandingFlash()`        | 渲染落地高亮     |
 * | `ui:<id>:render:garbage:warning`      | `renderGarbageWarning()`      | 渲染垃圾行预警   |
 * | `ui:<id>:render:garbage:push`         | `renderGarbagePush()`         | 渲染垃圾行闪烁   |
 * | `ui:<id>:render:gamepad:notification` | `renderGamepadNotification()` | 渲染手柄通知     |
 *
 * @augments Base
 * @class UI
 */
class UI extends Base {
  /**
   * ## 构造函数
   *
   * 接收依赖配置，创建 Renderer 和 Router 实例。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Store - 游戏状态存储
   * @param {object} options.Elements - DOM 元素 ID 配置
   * @param {object} options.Block - 方块数据模块
   * @param {object} options.Player - 玩家信息对象
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，将配置注入实例
    super(options);

    // 初始化子模块
    this.initialize(options);
  }

  /**
   * ## 初始化 UI
   *
   * 创建 CanvasRenderer 和 UIRouter 实例。 CanvasRenderer 持有 Canvas 和 Hud，负责所有实际渲染。
   * UIRouter 监听 `ui:*` 事件并路由到 UI 方法。
   *
   * @param {object} options - 配置对象
   * @param {object} options.Game - 游戏主实例
   * @returns {void}
   */
  initialize(options) {
    const { Game } = this;

    /**
     * ## 渲染器实例
     *
     * 负责所有实际的 Canvas 绘制和 HUD 更新。 未来可替换为 TerminalRenderer 等不同渲染策略。
     *
     * @type {CanvasRenderer}
     */
    this.Renderer = new CanvasRenderer(options);

    /**
     * ## UI 事件路由器
     *
     * 监听所有 `ui:*` 事件，回调中调用 UI 的对应方法。 UI 本身不直接订阅事件，完全通过 Router 解耦。
     *
     * @type {UIRouter}
     */
    this.Router = new UIRouter({
      UI: this,
      Game,
    });
  }

  /**
   * ## 获取 Canvas 画布元素
   *
   * 供外部模块（如 FlyAnimation）获取棋盘的 DOM 元素引用。
   *
   * @param {boolean} [isNext=false] - 是否获取预览方块 Canvas. Default is `false`
   * @returns {HTMLCanvasElement} Canvas DOM 元素
   */
  getCanvas(isNext = false) {
    return this.Renderer.getCanvas(isNext);
  }

  // ==================== 状态更新方法 ====================

  /**
   * ## 更新游戏模式标识
   *
   * 修改棋盘 Canvas 的 `data-mode` 属性，用于 CSS 样式切换。 不同模式对应不同边框颜色（如 playing=白色,
   * paused=黄色, game-over=红色）。 通过 `ui:<id>:update:mode` 事件触发。
   *
   * @param {string} mode - 游戏模式（main-menu / playing / paused / game-over /
   *   replay）
   * @returns {void}
   */
  updateMode(mode) {
    this.Renderer.updateMode(mode);
  }

  /**
   * ## 更新控制者标识
   *
   * 在 HUD 上显示当前控制者身份（HUMAN 或 AI）。 对战模式下 P1 和 P2 各自独立显示。 通过
   * `ui:<id>:update:controller` 事件触发。
   *
   * @param {string} controller - 当前控制者（'human' 或 'ai'），显示时转为大写
   * @returns {void}
   */
  updateController(controller) {
    this.Renderer.updateController(controller);
  }

  /**
   * ## 更新 HUD 显示
   *
   * 从 Store 读取最新状态（分数、行数、等级、最高分、连击数）， 更新 HUD 的数字显示。 主菜单模式下会先重置 HUD 为初始值。 通过
   * `ui:<id>:update:hud` 事件触发。
   *
   * @returns {void}
   */
  updateHud() {
    this.Renderer.updateHud();
  }

  /**
   * ## 更新 HUD 动画
   *
   * 每帧调用，驱动 HUD 数字（分数、最高分）的平滑过渡动画。 数字变化时不是瞬间跳变，而是逐帧递增/递减到目标值。 在游戏主循环中每帧调用。
   *
   * @returns {void}
   */
  tickHud() {
    this.Renderer.tickHud();
  }

  // ==================== 场景渲染方法 ====================

  /**
   * ## 延迟渲染场景
   *
   * 等待像素字体 "Press Start 2P" 加载完成后渲染主菜单场景。 使用 `document.fonts.ready` Promise
   * 确保字体可用后再绘制， 避免主菜单文字因字体未加载而使用 fallback 字体。 在 Engine 初始化时调用一次。
   *
   * @returns {void}
   */
  lazyRender() {
    this.Renderer.lazyRender();
  }

  /**
   * ## 渲染游戏场景
   *
   * 每帧调用，根据当前游戏模式（mode）路由到对应场景渲染：
   *
   * - Main-menu：主菜单
   * - Difficulty：难度选择
   * - Playing：棋盘 + 方块 + 幽灵方块
   * - Paused：暂停覆盖层
   * - Game-over：游戏结束画面
   * - Replay：回放界面
   *
   * 在游戏主循环中每帧调用。
   *
   * @returns {void}
   */
  render() {
    this.Renderer.render();
  }

  /**
   * ## 画布自适应
   *
   * 根据窗口尺寸重新计算棋盘和预览画布的大小。 重新计算 `blockSize`（每格像素尺寸）和 `fontSize` 等全局参数。 通过
   * `ui:<id>:resize` 事件触发。
   *
   * @returns {void}
   */
  resize() {
    this.Renderer.resize();
  }

  // ==================== 预览方块方法 ====================

  /**
   * ## 渲染下一个方块预览
   *
   * 在预览画布中居中绘制下一个方块的形状。 通过 `ui:<id>:render:next:piece` 事件触发。
   *
   * @returns {void}
   */
  renderNextPiece() {
    this.Renderer.renderNextPiece();
  }

  /**
   * ## 渲染 Hold 方块预览
   *
   * 在缓存画布中居中绘制缓存（Hold）方块的形状。 如果缓存为空则不绘制。 通过 `ui:<id>:render:hold:piece` 事件触发。
   *
   * @returns {void}
   */
  renderHoldPiece() {
    this.Renderer.renderHoldPiece();
  }

  /**
   * ## 清除下一个方块预览
   *
   * 清空 Next 预览画布的 Canvas 内容。 切换模式或重置时调用。
   *
   * @returns {void}
   */
  clearNextPiece() {
    this.Renderer.clearNextPiece();
  }

  /**
   * ## 清除 Hold 方块预览
   *
   * 清空 Hold 预览画布的 Canvas 内容。 切换模式或重置时调用。
   *
   * @returns {void}
   */
  clearHoldPiece() {
    this.Renderer.clearHoldPiece();
  }

  /**
   * ## 渲染 Ghost 方块（半透明落点预览）
   *
   * 在当前方块正下方的投影位置绘制半透明 Ghost， 帮助玩家预判硬降后的落点位置。 仅在 level ≤ 9 时显示，高等级不显示落点预览增加难度。
   * 通过每帧主循环直接调用（非事件驱动）。
   *
   * @param {object} ghost - Ghost 定位数据
   * @param {object} ghost.curr - 当前活动方块对象
   * @param {number} ghost.cx - Ghost 的 X 坐标
   * @param {number} ghost.ghostY - Ghost 的 Y 坐标
   * @returns {void}
   */
  renderGhostPiece(ghost) {
    this.Renderer.renderGhostPiece(ghost);
  }

  // ==================== 动画特效方法 ====================

  /**
   * ## 渲染倒计时特效
   *
   * 在游戏开始前显示 3、2、1 的倒计时数字和缩放动画。 通过 `ui:<id>:render:countdown` 事件触发。
   *
   * @param {object} state - 倒计时动画状态
   * @param {number} state.number - 当前倒计时数字（3/2/1）
   * @param {number} state.scale - 数字缩放比例
   * @returns {void}
   */
  renderCountdown(state) {
    this.Renderer.renderCountdown(state);
  }

  /**
   * ## 渲染消行闪烁特效
   *
   * 在消除满行时，将待消除的行以白色高亮闪烁。 动画由 `ClearLinesAnimation` 控制（120ms 切换一次，共 6 次），
   * 本方法只负责将动画状态传递给 Renderer。 通过 `ui:<id>:render:clear:lines` 事件触发。
   *
   * @param {object} state - 消行动画状态
   * @param {{ y: number; alpha: number }[]} state.lines - 待消除行的动画数据
   * @returns {void}
   */
  renderClearLines(state) {
    this.Renderer.renderClearLines(state);
  }

  /**
   * ## 渲染消除得分动画
   *
   * 在消除行的位置绘制上浮渐隐的得分数字和 Combo 提示。 动画由 `ClearScoreAnimation` 控制。 通过
   * `ui:<id>:render:clear:score` 事件触发。
   *
   * @param {object} state - 得分动画状态
   * @param {number} state.score - 消除得分
   * @param {number} state.y - 消除行号
   * @param {number} state.alpha - 透明度（1 → 0）
   * @param {number} state.offsetY - Y 轴上浮偏移量
   * @param {number} state.combo - 当前连击次数
   * @param {number} state.comboScore - 连击额外加分
   * @returns {void}
   */
  renderClearScore(state) {
    this.Renderer.renderClearScore(state);
  }

  /**
   * ## 渲染升级烟花特效
   *
   * 在玩家升级时显示烟花粒子动画和 "LEVEL UP" 文字。 烟花粒子从棋盘中心向外爆发。 通过 `ui:<id>:render:level:up`
   * 事件触发。
   *
   * @param {number} level - 升级后的新等级
   * @param {object[]} fireworks - 烟花粒子数组
   * @returns {void}
   */
  renderLevelUp(level, fireworks) {
    this.Renderer.renderLevelUp(level, fireworks);
  }

  /**
   * ## 渲染落地高亮特效
   *
   * 方块硬降或落底锁定时，在落点位置短暂显示白色高亮闪烁。 动画由 `LandingFlashAnimation` 控制（约 200ms）。 通过
   * `ui:<id>:render:landing:flash` 事件触发。
   *
   * @param {object} flashData - 落地高亮数据
   * @returns {void}
   */
  renderLandingFlash(flashData) {
    this.Renderer.renderLandingFlash(flashData);
  }

  /**
   * ## 渲染垃圾行预警特效
   *
   * 在棋盘上绘制橙色网格覆盖 + "INCOMING ATTACK" 警告文字。 根据 amount 显示不同颜色（2行黄色/3行橙色/4行红色）。
   * 动画由 `GarbageWarningAnimation` 控制（5 次闪烁，共 600ms）。 通过
   * `ui:<id>:render:garbage:warning` 事件触发。
   *
   * @param {number} amount - 即将到来的垃圾行数量
   * @returns {void}
   */
  renderGarbageWarning(amount) {
    this.Renderer.renderGarbageWarning(amount);
  }

  /**
   * ## 渲染垃圾行闪烁特效
   *
   * 垃圾行中非空洞的方块在灰色和白色之间交替闪烁。 动画由 `GarbagePushAnimation` 控制（5 次闪烁，共
   * 600ms，blocking=true）。 通过 `ui:<id>:render:garbage:push` 事件触发。
   *
   * @param {number[][]} rows - 垃圾行数据（二维数组，0=空洞，非0=垃圾方块）
   * @param {boolean} visible - 当前帧是否可见（true=灰色, false=白色）
   * @returns {void}
   */
  renderGarbagePush(rows, visible) {
    this.Renderer.renderGarbagePush(rows, visible);
  }

  /**
   * ## 渲染手柄连接/断开通知
   *
   * 在棋盘上显示半透明遮罩 + 手柄图标 + 状态文字。 连接时显示绿色 "CONNECTED"，断开时显示橙色 "DISCONNECTED"。 动画由
   * `GamepadNotificationAnimation` 控制（6 次闪烁，共 1200ms）。 通过
   * `ui:<id>:render:gamepad:notification` 事件触发。
   *
   * @param {boolean} connected - 手柄是否已连接（true=连接，false=断开）
   * @returns {void}
   */
  renderGamepadNotification(connected) {
    this.Renderer.renderGamepadNotification(connected);
  }

  // ==================== 事件订阅管理 ====================

  /**
   * ## 订阅 UI 事件
   *
   * 委托给 UIRouter 绑定所有 `ui:*` 事件监听。 在 `Game.subscribe()` 中调用。
   *
   * @returns {void}
   */
  subscribe() {
    this.Router.subscribe();
  }

  /**
   * ## 取消订阅 UI 事件
   *
   * 委托给 UIRouter 解绑所有 `ui:*` 事件监听。 在 `Game.unsubscribe()` 中调用。
   *
   * @returns {void}
   */
  unsubscribe() {
    this.Router.unsubscribe();
  }
}

export default UI;
