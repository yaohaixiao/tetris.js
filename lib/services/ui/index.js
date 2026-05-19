import Base from '@/lib/core';
import Canvas from '@/lib/services/ui/core/canvas.js';
import HudElements from '@/lib/services/ui/hud/hud-elements.js';
import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';
import lazyRenderScene from '@/lib/services/ui/scene-manager/lazy-render-scene.js';
import renderClear from '@/lib/services/ui/board/render-clear.js';
import renderCountdown from '@/lib/services/ui/effects/render-countdown.js';
import renderLevelUp from '@/lib/services/ui/effects/render-level-up.js';
import renderNextPiece from '@/lib/services/ui/next/render-next-piece.js';
import resize from '@/lib/services/ui/core/resize.js';
import createHud from '@/lib/services/ui/hud/create-hud.js';

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
 * | `ui:<id>:render:clear`      | `renderClear()`      | 渲染消行闪烁     |
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
   * @param {object} options.Elements - UI 元素配置（含 Hud 和 Main）
   * @returns {void}
   */
  initialize(options) {
    const { Elements } = options;
    const { Hud, Main } = Elements;

    /**
     * ## HUD 显示管理器
     *
     * @type {object}
     */
    this.Hud = createHud(HudElements(Hud));

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
   * ## 更新 HUD 显示
   *
   * 从 Store 读取最新状态并更新 HUD 数字显示。
   *
   * @returns {void}
   */
  updateHud() {
    const state = this.Store.getState();
    const { mode, score, lines, level, highScore, needReset = false } = state;

    // 主菜单或需要重置时，重置 HUD 为初始值
    if (mode === 'main-menu' || needReset) {
      this.Hud.reset();
    }

    // 更新分数、行数、等级、最高分
    this.Hud.update({ score, lines, level, highScore });
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
    const state = this.Store.getState();
    lazyRenderScene(this.Canvas, state);
  }

  /**
   * ## 渲染游戏场景
   *
   * 每帧调用，绘制棋盘和当前方块。
   *
   * @returns {void}
   */
  render() {
    const state = this.Store.getState();
    renderScene(this.Canvas, state);
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

  /**
   * ## 订阅 UI 事件
   *
   * 绑定所有 UI 相关的渲染事件。
   *
   * @returns {void}
   */
  subscribe() {
    const uuid = this.Game.id;

    /* ---------- 更新游戏控制者 ---------- */
    this.on(`ui:${uuid}:update:controller`, this._onUpdateController);

    /* ---------- DOM 绘制 ---------- */
    this.on(`ui:${uuid}:update:mode`, this._onUpdateMode);
    this.on(`ui:${uuid}:update:hud`, this._onUpdateHud);
    this.on(`ui:${uuid}:resize`, this._onResize);

    /* ---------- 动画特效 ---------- */
    this.on(`ui:${uuid}:render:next:piece`, this._onRenderNextPiece);
    this.on(`ui:${uuid}:render:countdown`, this._onRenderCountdown);
    this.on(`ui:${uuid}:render:clear`, this._onRenderClear);
    this.on(`ui:${uuid}:render:level:up`, this._onRenderLevelUp);
  }

  /**
   * ## 取消订阅 UI 事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const uuid = this.Game.id;

    /* ---------- 更新游戏控制者 ---------- */
    this.off(`ui:${uuid}:update:controller`, this._onUpdateController);

    /* ---------- DOM 绘制 ---------- */
    this.off(`ui:${uuid}:update:mode`, this._onUpdateMode);
    this.off(`ui:${uuid}:update:hud`, this._onUpdateHud);
    this.off(`ui:${uuid}:resize`, this._onResize);

    /* ---------- 动画特效 ---------- */
    this.off(`ui:${uuid}:render:next:piece`, this._onRenderNextPiece);
    this.off(`ui:${uuid}:render:countdown`, this._onRenderCountdown);
    this.off(`ui:${uuid}:render:clear`, this._onRenderClear);
    this.off(`ui:${uuid}:render:level:up`, this._onRenderLevelUp);
  }

  /**
   * ## 处理控制者更新事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.controller - 控制者身份
   * @returns {void}
   */
  _onUpdateController = ({ controller }) => {
    this.updateController(controller);
  };

  /**
   * ## 处理模式更新事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.mode - 游戏模式
   * @returns {void}
   */
  _onUpdateMode = ({ mode }) => {
    this.updateMode(mode);
  };

  /**
   * ## 处理 HUD 更新事件
   *
   * @private
   * @returns {void}
   */
  _onUpdateHud = () => {
    this.updateHud(this.Store.getState());
  };

  /**
   * ## 处理画布自适应事件
   *
   * @private
   * @returns {void}
   */
  _onResize = () => {
    this.resize();
  };

  /**
   * ## 处理渲染预览方块事件
   *
   * @private
   * @returns {void}
   */
  _onRenderNextPiece = () => {
    renderNextPiece(this.Canvas, this.Store.getState());
  };

  /**
   * ## 处理渲染倒计时事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 倒计时状态
   * @returns {void}
   */
  _onRenderCountdown = ({ state }) => {
    renderCountdown(this.Canvas, state);
  };

  /**
   * ## 处理渲染消行闪烁事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 消行动画状态
   * @returns {void}
   */
  _onRenderClear = ({ state }) => {
    renderClear(this.Canvas, state);
  };

  /**
   * ## 处理渲染升级烟花事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {number} payload.level - 新等级
   * @param {object[]} payload.fireworks - 烟花粒子数组
   * @returns {void}
   */
  _onRenderLevelUp = ({ level, fireworks }) => {
    renderLevelUp(this.Canvas, level, fireworks);
  };
}

export default UI;
