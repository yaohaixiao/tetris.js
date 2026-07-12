import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：UIRouter UI 事件路由器
 *
 * ============================================================
 *
 * 负责处理所有与用户界面（UI）相关的事件路由。 作为 UI 系统和游戏事件系统之间的桥梁，将外部事件转换为对 UI 类的方法调用。
 *
 * ## 核心职责
 *
 * - 事件监听：监听所有与 UI 渲染相关的事件
 * - 事件分发：根据事件类型调用 UI 的相应渲染方法
 * - 视图更新：确保游戏状态变化时界面能够及时响应
 *
 * ## 处理的事件类型
 *
 * | 事件类别 | 事件名称                    | 处理方法                      | 说明                     |
 * | :------- | :-------------------------- | :---------------------------- | :----------------------- |
 * | HUD 绘制 | UPDATE_MODE                 | \_onUpdateMode                | 更新游戏模式显示         |
 * | HUD 绘制 | UPDATE_HUD                  | \_onUpdateHud                 | 更新分数、等级等抬头显示 |
 * | HUD 绘制 | UPDATE_CONTROLLER           | \_onUpdateController          | 更新控制器类型           |
 * | 画布绘制 | RESIZE                      | \_onResize                    | 响应窗口大小变化         |
 * | 画布绘制 | RENDER_NEXT_PIECE           | \_onRenderNextPiece           | 渲染下一个方块预览       |
 * | 画布绘制 | RENDER_HOLD_PIECE           | \_onRenderHoldPiece           | 渲染暂存方块预览         |
 * | 画布绘制 | CLEAR_NEXT_PIECE            | \_onClearNextPiece            | 清空下一个方块预览       |
 * | 画布绘制 | CLEAR_HOLD_PIECE            | \_onClearHoldPiece            | 清空暂存方块预览         |
 * | 画布绘制 | RENDER_GHOST_PIECE          | \_onRenderGhostPiece          | 绘制 ghost 方块          |
 * | 动画特效 | RENDER_COUNTDOWN            | \_onRenderCountdown           | 渲染倒计时特效           |
 * | 动画特效 | RENDER_CLEAR_LINES          | \_onRenderClearLines          | 渲染消行闪烁特效         |
 * | 动画特效 | RENDER_CLEAR_SCORE          | \_onRenderClearScore          | 渲染消除得分动画         |
 * | 动画特效 | RENDER_LEVEL_UP             | \_onRenderLevelUp             | 渲染升级烟花特效         |
 * | 动画特效 | RENDER_LANDING_FLASH        | \_onRenderLandingFlash        | 渲染落地高亮动画         |
 * | 动画特效 | RENDER_GARBAGE_WARNING      | \_onRenderGarbageWarning      | 渲染垃圾行预警特效       |
 * | 动画特效 | RENDER_GARBAGE_PUSH         | \_onRenderGarbagePush         | 渲染垃圾行推入动画       |
 * | 动画特效 | RENDER_GAMEPAD_NOTIFICATION | \_onRenderGamepadNotification | 渲染手柄连接/断开通知    |
 *
 * @augments Base
 * @class UIRouter
 */
class UIRouter extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## subscribe：订阅 UI 事件
   *
   * 绑定所有 UI 相关的渲染事件。
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    const events = UIEvents(Game.id);

    // HUD 绘制
    this.on(events.UPDATE_MODE, this._onUpdateMode);
    this.on(events.UPDATE_HUD, this._onUpdateHud);
    this.on(events.UPDATE_CONTROLLER, this._onUpdateController);

    // 画布绘制
    this.on(events.RESIZE, this._onResize);
    this.on(events.RENDER_NEXT_PIECE, this._onRenderNextPiece);
    this.on(events.RENDER_HOLD_PIECE, this._onRenderHoldPiece);
    this.on(events.CLEAR_NEXT_PIECE, this._onClearNextPiece);
    this.on(events.CLEAR_HOLD_PIECE, this._onClearHoldPiece);
    this.on(events.RENDER_GHOST_PIECE, this._onRenderGhostPiece);

    // 动画特效
    this.on(events.RENDER_COUNTDOWN, this._onRenderCountdown);
    this.on(events.RENDER_CLEAR_LINES, this._onRenderClearLines);
    this.on(events.RENDER_CLEAR_SCORE, this._onRenderClearScore);
    this.on(events.RENDER_LEVEL_UP, this._onRenderLevelUp);
    this.on(events.RENDER_LANDING_FLASH, this._onRenderLandingFlash);
    this.on(events.RENDER_GARBAGE_WARNING, this._onRenderGarbageWarning);
    this.on(events.RENDER_GARBAGE_PUSH, this._onRenderGarbagePush);
    this.on(
      events.RENDER_GAMEPAD_NOTIFICATION,
      this._onRenderGamepadNotification,
    );
  }

  /**
   * ## unsubscribe：取消订阅 UI 事件
   *
   * 移除所有已注册的 UI 事件监听器。
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    const events = UIEvents(Game.id);

    // HUD 绘制
    this.off(events.UPDATE_MODE, this._onUpdateMode);
    this.off(events.UPDATE_HUD, this._onUpdateHud);
    this.off(events.UPDATE_CONTROLLER, this._onUpdateController);

    // 画布绘制
    this.off(events.RESIZE, this._onResize);
    this.off(events.RENDER_NEXT_PIECE, this._onRenderNextPiece);
    this.off(events.RENDER_HOLD_PIECE, this._onRenderHoldPiece);
    this.off(events.CLEAR_NEXT_PIECE, this._onClearNextPiece);
    this.off(events.CLEAR_HOLD_PIECE, this._onClearHoldPiece);
    this.off(events.RENDER_GHOST_PIECE, this._onRenderGhostPiece);

    // 动画特效
    this.off(events.RENDER_COUNTDOWN, this._onRenderCountdown);
    this.off(events.RENDER_CLEAR_LINES, this._onRenderClearLines);
    this.off(events.RENDER_CLEAR_SCORE, this._onRenderClearScore);
    this.off(events.RENDER_LEVEL_UP, this._onRenderLevelUp);
    this.off(events.RENDER_LANDING_FLASH, this._onRenderLandingFlash);
    this.off(events.RENDER_GARBAGE_WARNING, this._onRenderGarbageWarning);
    this.off(events.RENDER_GARBAGE_PUSH, this._onRenderGarbagePush);
    this.off(
      events.RENDER_GAMEPAD_NOTIFICATION,
      this._onRenderGamepadNotification,
    );
  }

  /*
   * ============================================================
   * 事件处理器
   * ============================================================
   */

  /**
   * ## _onUpdateMode：处理模式更新事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.mode - 游戏模式
   * @returns {void}
   */
  _onUpdateMode = ({ mode }) => {
    this.UI.updateMode(mode);
  };

  /**
   * ## _onUpdateController：处理控制者更新事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.controller - 控制者身份
   * @returns {void}
   */
  _onUpdateController = ({ controller }) => {
    this.UI.updateController(controller);
  };

  /**
   * ## _onUpdateHud：处理 HUD 更新事件
   *
   * @private
   * @returns {void}
   */
  _onUpdateHud = () => {
    this.UI.updateHud();
  };

  /**
   * ## _onResize：处理画布自适应事件
   *
   * @private
   * @returns {void}
   */
  _onResize = () => {
    this.UI.resize();
  };

  /**
   * ## _onRenderNextPiece：处理渲染预览方块事件
   *
   * @private
   * @returns {void}
   */
  _onRenderNextPiece = () => {
    this.UI.renderNextPiece();
  };

  /**
   * ## _onRenderHoldPiece：处理渲染暂存方块事件
   *
   * @private
   * @returns {void}
   */
  _onRenderHoldPiece = () => {
    this.UI.renderHoldPiece();
  };

  /**
   * ## _onClearNextPiece：处理清空预览方块事件
   *
   * @private
   * @returns {void}
   */
  _onClearNextPiece = () => {
    this.UI.clearNextPiece();
  };

  /**
   * ## _onClearHoldPiece：处理清空暂存方块事件
   *
   * @private
   * @returns {void}
   */
  _onClearHoldPiece = () => {
    this.UI.clearHoldPiece();
  };

  /**
   * ## _onRenderGhostPiece：绘制 ghost 方块
   *
   * Level <= 9 时才绘制，高等级不显示落点预览增加难度。
   *
   * @private
   * @param {object} payload - 参数对象
   * @param {object} payload.ghost - Ghost 方块数据
   * @returns {void}
   */
  _onRenderGhostPiece = (payload) => {
    this.UI.renderGhostPiece(payload.ghost);
  };

  /**
   * ## _onRenderCountdown：处理渲染倒计时事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 倒计时动画状态
   * @returns {void}
   */
  _onRenderCountdown = (payload) => {
    this.UI.renderCountdown(payload.state);
  };

  /**
   * ## _onRenderClearLines：处理渲染消行闪烁事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 消行动画状态
   * @returns {void}
   */
  _onRenderClearLines = (payload) => {
    this.UI.renderClearLines(payload.state);
  };

  /**
   * ## _onRenderClearScore：处理渲染消除得分事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 得分动画状态
   * @returns {void}
   */
  _onRenderClearScore = (payload) => {
    this.UI.renderClearScore(payload.state);
  };

  /**
   * ## _onRenderLevelUp：处理渲染升级烟花事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {number} payload.level - 新等级
   * @param {object[]} payload.fireworks - 烟花粒子数组
   * @returns {void}
   */
  _onRenderLevelUp = (payload) => {
    const { level, fireworks } = payload;
    this.UI.renderLevelUp(level, fireworks);
  };

  /**
   * ## _onRenderLandingFlash：处理渲染落地高亮事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 高亮动画状态
   * @returns {void}
   */
  _onRenderLandingFlash = (payload) => {
    this.UI.renderLandingFlash(payload.state);
  };

  /**
   * ## _onRenderGarbageWarning：处理渲染垃圾行预警事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {number} payload.amount - 即将到来的垃圾行数量
   * @returns {void}
   */
  _onRenderGarbageWarning = (payload) => {
    this.UI.renderGarbageWarning(payload.amount);
  };

  /**
   * ## _onRenderGarbagePush：处理渲染垃圾行推入事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {number[][]} payload.rows - 垃圾行数据
   * @param {boolean} payload.visible - 当前帧是否可见
   * @returns {void}
   */
  _onRenderGarbagePush = (payload) => {
    const { rows, visible } = payload;
    this.UI.renderGarbagePush(rows, visible);
  };

  /**
   * ## _onRenderGamepadNotification：处理渲染手柄通知事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {boolean} payload.connected - 手柄是否已连接
   * @returns {void}
   */
  _onRenderGamepadNotification = (payload) => {
    this.UI.renderGamepadNotification(payload.connected);
  };
}

export default UIRouter;
