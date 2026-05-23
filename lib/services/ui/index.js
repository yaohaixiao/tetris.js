import Base from '@/lib/core';
import CanvasRenderer from '@/lib/services/ui/core/canvas-renderer.js';
import UIRouter from '@/lib/events/router/ui-router.js';

/**
 * # UI（界面渲染调度器）
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
 * | 动画特效   | 消行闪烁、倒计时、升级烟花等               |
 * | 画布自适应 | 响应窗口尺寸变化                           |
 * | 场景切换   | 主菜单、游戏界面等场景的渲染               |
 *
 * ## 设计特点
 *
 * - **不持有 Canvas / Hud**：全部交给 Renderer，UI 只是一个代理层
 * - **可替换渲染器**：只需替换 `this.Renderer` 即可切换渲染策略 （如 Canvas → Terminal 命令行渲染）
 * - **不订阅事件**：事件路由在 `UIRouter` 中处理，UI 只暴露公开方法
 * - **多实例支持**：对战模式可创建多个 UI 实例，各自绑定独立的 Renderer
 *
 * ## 事件映射
 *
 * | 事件                        | 方法                 | 说明             |
 * | --------------------------- | -------------------- | ---------------- |
 * | `ui:<id>:update:controller` | `updateController()` | 更新控制者标识   |
 * | `ui:<id>:update:mode`       | `updateMode()`       | 更新游戏模式标识 |
 * | `ui:<id>:update:hud`        | `updateHud()`        | 更新 HUD 数据    |
 * | `ui:<id>:resize`            | `resize()`           | 画布自适应       |
 * | `ui:<id>:render:next:piece` | `renderNextPiece()`  | 渲染预览方块     |
 * | `ui:<id>:render:countdown`  | `renderCountdown()`  | 渲染倒计时       |
 * | `ui:<id>:render:clear`      | `renderClearLines()` | 渲染消行闪烁     |
 * | `ui:<id>:render:level:up`   | `renderLevelUp()`    | 渲染升级烟花     |
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
   * @param {object} options.Game - 游戏主实例（用于传递给 Router）
   * @param {object} options.Store - 游戏状态存储（用于传递给 Renderer）
   * @param {object} options.Elements - UI 元素配置（含 Hud 和 Main）
   */
  constructor(options) {
    super(options);

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

  // ==================== 状态更新方法 ====================

  /**
   * ## 更新游戏模式标识
   *
   * 修改棋盘 Canvas 的 `data-mode` 属性，用于 CSS 样式切换。 通过 `ui:<id>:update:mode` 事件触发。
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
   * 在 HUD 上显示当前控制者身份（HUMAN 或 AI）。 通过 `ui:<id>:update:controller` 事件触发。
   *
   * @param {string} controller - 当前控制者（'human' 或 'ai'）
   * @returns {void}
   */
  updateController(controller) {
    this.Renderer.updateController(controller);
  }

  /**
   * ## 更新 HUD 显示
   *
   * 从 Store 读取最新状态（分数、行数、等级、最高分）， 更新 HUD 的数字显示。主菜单模式下会先重置 HUD。 通过
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
   * 每帧调用，驱动 HUD 数字（分数、最高分）的平滑过渡动画。 在游戏主循环 `startGameLoop` 中每帧调用。
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
   * 等待像素字体 "Press Start 2P" 加载完成后渲染主菜单场景。 在 Engine 初始化时调用一次。
   *
   * @returns {void}
   */
  lazyRender() {
    this.Renderer.lazyRender();
  }

  /**
   * ## 渲染游戏场景
   *
   * 每帧调用，绘制棋盘和当前活动方块。 在游戏主循环 `startGameLoop` 中每帧调用。
   *
   * @returns {void}
   */
  render() {
    this.Renderer.render();
  }

  /**
   * ## 画布自适应
   *
   * 根据窗口尺寸调整棋盘大小。 通过 `ui:<id>:resize` 事件触发。
   *
   * @returns {void}
   */
  resize() {
    this.Renderer.resize();
  }

  // ==================== 动画特效方法 ====================

  /**
   * ## 渲染下一个方块预览
   *
   * 在预览画布中绘制下一个方块的形状。 通过 `ui:<id>:render:next:piece` 事件触发。
   *
   * @returns {void}
   */
  renderNextPiece() {
    this.Renderer.renderNextPiece();
  }

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
   * 在消除满行时，将待消除的行以白色高亮闪烁 3 次。 通过 `ui:<id>:render:clear` 事件触发。
   *
   * @param {object} state - 消行动画状态
   * @param {{ y: number; alpha: number }[]} state.lines - 待消除行的动画数据
   * @returns {void}
   */
  renderClearLines(state) {
    this.Renderer.renderClearLines(state);
  }

  renderClearScore(state) {
    this.Renderer.renderClearScore(state);
  }

  /**
   * ## 渲染升级烟花特效
   *
   * 在玩家升级时显示烟花粒子动画和 "LEVEL UP" 文字。 通过 `ui:<id>:render:level:up` 事件触发。
   *
   * @param {number} level - 升级后的新等级
   * @param {object[]} fireworks - 烟花粒子数组
   * @returns {void}
   */
  renderLevelUp(level, fireworks) {
    this.Renderer.renderLevelUp(level, fireworks);
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
