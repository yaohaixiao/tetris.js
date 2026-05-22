import Base from '@/lib/core';
import CanvasRenderer from '@/lib/services/ui/core/canvas-renderer.js';
import UIRouter from '@/lib/events/router/ui-router.js';

/**
 * # UI（界面渲染管理器）
 *
 * 统一管理游戏的所有视觉呈现，包括棋盘渲染、HUD 显示、动画特效等。 通过事件驱动的方式响应游戏状态变化和动画渲染请求。
 *
 * ## 核心职责
 *
 * - **棋盘渲染**：绘制游戏主棋盘和预览方块
 * - **HUD 管理**：更新分数、等级、最高分等数据显示
 * - **动画特效**：消行闪烁、倒计时、升级烟花等
 * - **画布自适应**：响应窗口尺寸变化
 * - **场景切换**：主菜单、游戏界面等场景的延迟渲染
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
 * @class UI
 */
class UI extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Store - 游戏状态存储
   * @param {object} options.Elements - UI 元素配置
   */
  constructor(options) {
    super(options);

    this.initialize(options);
  }

  /**
   * ## 初始化 UI
   *
   * 创建 Canvas 和 HUD 实例。
   *
   * @param {object} options - 配置对象
   * @returns {void}
   */
  initialize(options) {
    const { Game } = this;

    this.Renderer = new CanvasRenderer(options);

    this.Router = new UIRouter({
      UI: this,
      Game,
    });
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
    this.Renderer.updateMode(mode);
  }

  /**
   * ## 更新控制者标识
   *
   * @param {string} controller - 当前控制者（human / ai）
   * @returns {void}
   */
  updateController(controller) {
    this.Renderer.updateController(controller);
  }

  /**
   * ## 更新 HUD 显示
   *
   * 从 Store 读取最新状态并更新 HUD 数字显示。
   *
   * @returns {void}
   */
  updateHud() {
    this.Renderer.updateHud();
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
    this.Renderer.tickHud(delta);
  }

  /**
   * ## 延迟渲染场景
   *
   * 等待字体等资源加载完成后渲染主菜单场景。
   *
   * @returns {void}
   */
  lazyRender() {
    this.Renderer.lazyRender();
  }

  /**
   * ## 渲染游戏场景
   *
   * 每帧调用，绘制棋盘和当前方块。
   *
   * @returns {void}
   */
  render() {
    this.Renderer.render();
  }

  /**
   * ## 画布自适应
   *
   * 根据窗口尺寸调整棋盘大小。
   *
   * @returns {void}
   */
  resize() {
    this.Renderer.resize();
  }

  /** ## 处理渲染下一个方块 */
  renderNextPiece() {
    this.Renderer.renderNextPiece();
  }

  /**
   * ## 处理渲染倒计时事件
   *
   * @param {object} state - 游戏状态信息
   * @returns {void}
   */
  renderCountdown(state) {
    this.Renderer.renderCountdown(state);
  }

  /**
   * ## 处理渲染消行闪烁事件
   *
   * @param {object} state - 游戏状态信息
   * @returns {void}
   */
  renderClearLines(state) {
    this.Renderer.renderClearLines(state);
  }

  /**
   * ## 处理渲染升级烟花事件
   *
   * @param {number} level - 新等级
   * @param {object[]} fireworks - 烟花粒子数组
   * @returns {void}
   */
  renderLevelUp(level, fireworks) {
    this.Renderer.renderLevelUp(level, fireworks);
  }

  /**
   * ## 订阅 UI 事件
   *
   * 绑定所有 UI 相关的渲染事件。
   *
   * @returns {void}
   */
  subscribe() {
    this.Router.subscribe();
  }

  /**
   * ## 取消订阅 UI 事件
   *
   * @returns {void}
   */
  unsubscribe() {
    this.Router.unsubscribe();
  }
}

export default UI;
