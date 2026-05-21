import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

class UIRouter extends Base {
  constructor(options) {
    super(options);
  }

  /**
   * ## 订阅 UI 事件
   *
   * 绑定所有 UI 相关的渲染事件。
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    const events = UIEvents(Game.id);

    /* ---------- HUD 绘制 ---------- */
    this.on(events.UPDATE_MODE, this._onUpdateMode);
    this.on(events.UPDATE_HUD, this._onUpdateHud);
    this.on(events.UPDATE_CONTROLLER, this._onUpdateController);

    /* ---------- 画布绘制 ---------- */
    this.on(events.RESIZE, this._onResize);

    /* ---------- 动画特效 ---------- */
    this.on(events.RENDER_NEXT_PIECE, this._onRenderNextPiece);
    this.on(events.RENDER_COUNTDOWN, this._onRenderCountdown);
    this.on(events.RENDER_CLEAR_LINES, this._onRenderClearLines);
    this.on(events.RENDER_LEVEL_UP, this._onRenderLevelUp);
  }

  /**
   * ## 取消订阅 UI 事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    const events = UIEvents(Game.id);

    /* ---------- HUD 绘制 ---------- */
    this.off(events.UPDATE_MODE, this._onUpdateMode);
    this.off(events.UPDATE_HUD, this._onUpdateHud);
    this.off(events.UPDATE_CONTROLLER, this._onUpdateController);

    /* ---------- 画布绘制 ---------- */
    this.off(events.RESIZE, this._onResize);

    /* ---------- 动画特效 ---------- */
    this.off(events.RENDER_NEXT_PIECE, this._onRenderNextPiece);
    this.off(events.RENDER_COUNTDOWN, this._onRenderCountdown);
    this.off(events.RENDER_CLEAR_LINES, this._onRenderClearLines);
    this.off(events.RENDER_LEVEL_UP, this._onRenderLevelUp);
  }

  /**
   * ## 处理模式更新事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.mode - 游戏模式
   * @returns {void}
   */
  _onUpdateMode = ({ mode }) => {
    const { UI } = this;
    UI.updateMode(mode);
  };

  /**
   * ## 处理控制者更新事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.controller - 控制者身份
   * @returns {void}
   */
  _onUpdateController = ({ controller }) => {
    const { UI } = this;
    UI.updateController(controller);
  };

  /**
   * ## 处理 HUD 更新事件
   *
   * @private
   * @returns {void}
   */
  _onUpdateHud = () => {
    const { UI } = this;
    UI.updateHud();
  };

  /**
   * ## 处理画布自适应事件
   *
   * @private
   * @returns {void}
   */
  _onResize = () => {
    const { UI } = this;
    UI.resize();
  };

  /**
   * ## 处理渲染预览方块事件
   *
   * @private
   * @returns {void}
   */
  _onRenderNextPiece = () => {
    const { UI } = this;
    UI.renderNextPiece();
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
    const { UI } = this;
    UI.renderCountdown(state);
  };

  /**
   * ## 处理渲染消行闪烁事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 消行动画状态
   * @returns {void}
   */
  _onRenderClearLines = ({ state }) => {
    const { UI } = this;
    UI.renderClearLines(state);
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
    const { UI } = this;
    UI.renderLevelUp(level, fireworks);
  };
}

export default UIRouter;
