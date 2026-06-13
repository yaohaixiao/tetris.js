import Base from '@/lib/core';
import { UIEvents } from '@/lib/events/event-catalog.js';

/**
 * # UIRouter（UI 事件路由器）
 *
 * 负责处理所有与用户界面（UI）相关的事件路由。 作为 UI 系统和游戏事件系统之间的桥梁，将外部事件转换为对 UI 类的方法调用。
 *
 * ## 核心职责
 *
 * - **事件监听**：监听所有与 UI 渲染相关的事件
 * - **事件分发**：根据事件类型调用 UI 的相应渲染方法
 * - **视图更新**：确保游戏状态变化时界面能够及时响应和更新
 *
 * ## 设计说明
 *
 * - **职责分离**：将事件路由逻辑从 UI 类中分离出来，保持 UI 类专注于渲染逻辑
 * - **事件集中管理**：所有 UI 相关的事件处理逻辑都集中在此类中，便于维护和理解
 * - **解耦设计**：UI 组件不需要知道事件系统的细节，只需提供清晰的渲染接口
 *
 * ## 处理的事件类型
 *
 * | 事件类别 | 事件名称               | 处理方法                  | 说明                      |
 * | -------- | ---------------------- | ------------------------- | ------------------------- |
 * | HUD 绘制 | UPDATE_MODE            | `_onUpdateMode`           | 更新游戏模式显示          |
 * | HUD 绘制 | UPDATE_HUD             | `_onUpdateHud`            | 更新分数、等级等抬头显示  |
 * | HUD 绘制 | UPDATE_CONTROLLER      | `_onUpdateController`     | 更新控制器类型（玩家/AI） |
 * | 画布绘制 | RESIZE                 | `_onResize`               | 响应窗口大小变化          |
 * | 画布绘制 | RENDER_NEXT_PIECE      | `_onRenderNextPiece`      | 渲染下一个方块预览        |
 * | 画布绘制 | RENDER_HOLD_PIECE      | `_onRenderHoldPiece`      | 渲染暂存方块预览          |
 * | 画布绘制 | CLEAR_NEXT_PIECE       | `_onClearNextPiece`       | 清空下一个方块预览        |
 * | 画布绘制 | CLEAR_HOLD_PIECE       | `_onClearHoldPiece`       | 清空暂存方块预览          |
 * | 画布绘制 | RENDER_GHOST_PIECE     | `_onRenderGhostPiece`     | 绘制 ghost 方块           |
 * | 动画特效 | RENDER_COUNTDOWN       | `_onRenderCountdown`      | 渲染倒计时特效            |
 * | 动画特效 | RENDER_CLEAR_LINES     | `_onRenderClearLines`     | 渲染消行闪烁特效          |
 * | 动画特效 | RENDER_CLEAR_SCORE     | `_onRenderClearScore`     | 渲染消除得分动画          |
 * | 动画特效 | RENDER_LEVEL_UP        | `_onRenderLevelUp`        | 渲染升级烟花特效          |
 * | 动画特效 | RENDER_LANDING_FLASH   | `_onRenderLandingFlash`   | 渲染落地高亮动画          |
 * | 动画特效 | RENDER_GARBAGE_WARNING | `_onRenderGarbageWarning` | 渲染垃圾行预警特效        |
 * | 动画特效 | RENDER_GARBAGE_PUSH    | `_onRenderGarbagePush`    | 渲染垃圾行推入动画        |
 *
 * @augments Base
 * @class UIRouter
 */
class UIRouter extends Base {
  /**
   * ## 构造函数
   *
   * 创建 UIRouter 实例。 注意：构造函数不会自动订阅事件，需要手动调用 `subscribe()`。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.UI - UI 实例，负责实际的渲染工作
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## 订阅 UI 事件
   *
   * 绑定所有 UI 相关的渲染事件。 在游戏初始化或 UI 系统启动时调用。
   *
   * ### 监听的事件分类
   *
   * 1. **HUD 绘制事件**：模式更新、控制者更新、抬头显示更新
   * 2. **画布绘制事件**：窗口大小调整、预览方块渲染、暂存方块渲染
   * 3. **动画特效事件**：倒计时、消行、得分、升级、落地高亮、垃圾行预警、垃圾行推入
   *
   * @returns {void}
   */
  subscribe() {
    // 获取当前 Game 实例对应的 UI 事件常量
    const { Game } = this;
    const events = UIEvents(Game.id);

    /* ---------- HUD 绘制 ---------- */
    this.on(events.UPDATE_MODE, this._onUpdateMode);
    this.on(events.UPDATE_HUD, this._onUpdateHud);
    this.on(events.UPDATE_CONTROLLER, this._onUpdateController);

    /* ---------- 画布绘制 ---------- */
    this.on(events.RESIZE, this._onResize);
    this.on(events.RENDER_NEXT_PIECE, this._onRenderNextPiece);
    this.on(events.RENDER_HOLD_PIECE, this._onRenderHoldPiece);
    this.on(events.CLEAR_NEXT_PIECE, this._onClearNextPiece);
    this.on(events.CLEAR_HOLD_PIECE, this._onClearHoldPiece);
    this.on(events.RENDER_GHOST_PIECE, this._onRenderGhostPiece);

    /* ---------- 动画特效 ---------- */
    this.on(events.RENDER_COUNTDOWN, this._onRenderCountdown);
    this.on(events.RENDER_CLEAR_LINES, this._onRenderClearLines);
    this.on(events.RENDER_CLEAR_SCORE, this._onRenderClearScore);
    this.on(events.RENDER_LEVEL_UP, this._onRenderLevelUp);
    this.on(events.RENDER_LANDING_FLASH, this._onRenderLandingFlash);
    this.on(events.RENDER_GARBAGE_WARNING, this._onRenderGarbageWarning);
    this.on(events.RENDER_GARBAGE_PUSH, this._onRenderGarbagePush);
  }

  /**
   * ## 取消订阅 UI 事件
   *
   * 移除所有已注册的 UI 事件监听器。 在组件销毁或 UI 系统关闭时调用，避免内存泄漏。
   *
   * @returns {void}
   */
  unsubscribe() {
    // 获取当前 Game 实例对应的 UI 事件常量
    const { Game } = this;
    const events = UIEvents(Game.id);

    /* ---------- HUD 绘制 ---------- */
    this.off(events.UPDATE_MODE, this._onUpdateMode);
    this.off(events.UPDATE_HUD, this._onUpdateHud);
    this.off(events.UPDATE_CONTROLLER, this._onUpdateController);

    /* ---------- 画布绘制 ---------- */
    this.off(events.RESIZE, this._onResize);
    this.off(events.RENDER_NEXT_PIECE, this._onRenderNextPiece);
    this.off(events.RENDER_HOLD_PIECE, this._onRenderHoldPiece);
    this.off(events.CLEAR_NEXT_PIECE, this._onClearNextPiece);
    this.off(events.CLEAR_HOLD_PIECE, this._onClearHoldPiece);
    this.off(events.RENDER_GHOST_PIECE, this._onRenderGhostPiece);

    /* ---------- 动画特效 ---------- */
    this.off(events.RENDER_COUNTDOWN, this._onRenderCountdown);
    this.off(events.RENDER_CLEAR_LINES, this._onRenderClearLines);
    this.off(events.RENDER_CLEAR_SCORE, this._onRenderClearScore);
    this.off(events.RENDER_LEVEL_UP, this._onRenderLevelUp);
    this.off(events.RENDER_LANDING_FLASH, this._onRenderLandingFlash);
    this.off(events.RENDER_GARBAGE_WARNING, this._onRenderGarbageWarning);
    this.off(events.RENDER_GARBAGE_PUSH, this._onRenderGarbagePush);
  }

  // ==================== 事件处理器（私有） ====================

  /**
   * ## 处理模式更新事件
   *
   * 当游戏模式发生变化时触发（如从主菜单切换到游戏中）。 通知 UI 更新当前显示的模式，切换不同的界面布局。
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.mode - 游戏模式（main-menu / difficulty / playing /
   *   replay / game-over）
   * @returns {void}
   */
  _onUpdateMode = ({ mode }) => {
    const { UI } = this;
    UI.updateMode(mode);
  };

  /**
   * ## 处理控制者更新事件
   *
   * 当游戏控制器类型发生变化时触发（玩家控制 ↔ AI 控制）。 通知 UI 更新控制器显示标识。
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.controller - 控制者身份（human / ai）
   * @returns {void}
   */
  _onUpdateController = ({ controller }) => {
    const { UI } = this;
    UI.updateController(controller);
  };

  /**
   * ## 处理 HUD 更新事件
   *
   * 当游戏数据发生变化时触发（如分数增加、等级提升等）。 通知 UI 刷新抬头显示（Heads-Up Display）的所有数据。
   *
   * ### 更新的数据包括
   *
   * - 当前得分
   * - 历史最高分
   * - 当前等级
   * - 消除行数
   * - 连击数
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
   * 当浏览器窗口大小发生变化时触发。 通知 UI 重新计算画布尺寸并调整游戏区域的布局。
   *
   * ### 自适应内容
   *
   * - 主游戏画布的尺寸
   * - 预览方块的显示区域
   * - 暂存方块的显示区域
   * - UI 元素的相对位置
   * - 字体大小的缩放
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
   * 当预览方块发生变化时触发。 通知 UI 重新渲染下一个方块的预览图像。
   *
   * @private
   * @returns {void}
   */
  _onRenderNextPiece = () => {
    const { UI } = this;
    UI.renderNextPiece();
  };

  /**
   * ## 处理渲染暂存方块事件
   *
   * 当暂存方块发生变化时（首次暂存或交换）触发。 通知 UI 重新渲染暂存方块的预览图像。
   *
   * @private
   * @returns {void}
   */
  _onRenderHoldPiece = () => {
    const { UI } = this;
    UI.renderHoldPiece();
  };

  /**
   * ## 处理清空预览方块事件
   *
   * 当需要清空下一个方块预览时触发。
   *
   * @private
   * @returns {void}
   */
  _onClearNextPiece = () => {
    const { UI } = this;
    UI.clearNextPiece();
  };

  /**
   * ## 处理清空暂存方块事件
   *
   * 当需要清空暂存方块预览时触发。
   *
   * @private
   * @returns {void}
   */
  _onClearHoldPiece = () => {
    const { UI } = this;
    UI.clearHoldPiece();
  };

  /**
   * ## 绘制 ghost 方块（落点预览）
   *
   * Level <= 9 时才绘制 ghost 方块，高等级不显示落点预览增加难度。
   *
   * @private
   * @param {object} payload - 参数对象
   * @param {object} payload.ghost - Ghost 方块数据（cx, cy, shape, color）
   * @returns {void}
   */
  _onRenderGhostPiece = (payload) => {
    const { UI } = this;
    const { ghost } = payload;
    UI.renderGhostPiece(ghost);
  };

  /**
   * ## 处理渲染倒计时事件
   *
   * 当游戏开始倒计时特效运行时触发。 通知 UI 根据当前倒计时状态渲染数字和缩放动画。
   *
   * ### 倒计时流程
   *
   * - 显示 "3" → "2" → "1"
   * - 每个数字持续约 1 秒
   * - 配合缩放和透明度动画效果
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 倒计时动画状态（含 number、scale）
   * @returns {void}
   */
  _onRenderCountdown = (payload) => {
    const { state } = payload;
    const { UI } = this;
    UI.renderCountdown(state);
  };

  /**
   * ## 处理渲染消行闪烁事件
   *
   * 当消除行特效动画运行时触发。 通知 UI 根据消行动画状态渲染闪烁效果。
   *
   * ### 消行动画效果
   *
   * - 被消除的行会闪烁白色
   * - 闪烁 6 个阶段（显→隐→显→隐→显→隐），共 720ms
   * - 闪烁后行消失，上方行下落
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 消行动画状态（含 lines 数组）
   * @returns {void}
   */
  _onRenderClearLines = (payload) => {
    const { state } = payload;
    const { UI } = this;
    UI.renderClearLines(state);
  };

  /**
   * ## 处理渲染消除得分事件
   *
   * 当消除得分动画运行时触发。 通知 UI 在消除行位置绘制上浮渐隐的得分数字。
   *
   * ### 动画效果
   *
   * - 得分数字从消除行位置持续上浮
   * - 透明度从 1 逐渐衰减到 0
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 得分动画状态（含 score、y、alpha、offsetY）
   * @returns {void}
   */
  _onRenderClearScore = (payload) => {
    const { state } = payload;
    const { UI } = this;
    UI.renderClearScore(state);
  };

  /**
   * ## 处理渲染升级烟花事件
   *
   * 当等级提升特效动画运行时触发。 通知 UI 根据等级和烟花粒子数组渲染庆祝效果。
   *
   * ### 升级特效效果
   *
   * - 屏幕中央显示 "LEVEL UP!" 文字
   * - 彩色烟花粒子从中心向外扩散
   * - 粒子有重力、速度和生命周期
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {number} payload.level - 新等级
   * @param {object[]} payload.fireworks - 烟花粒子数组
   * @returns {void}
   */
  _onRenderLevelUp = (payload) => {
    const { level, fireworks } = payload;
    const { UI } = this;
    UI.renderLevelUp(level, fireworks);
  };

  /**
   * ## 处理渲染落地高亮事件
   *
   * 方块落地的瞬间在落地格子上显示半透明白色高亮。 动画由 `LandingFlashAnimation` 控制，持续约 200ms。
   *
   * ### 动画效果
   *
   * - 落地格子上覆盖 60% 透明度白色
   * - 短暂的"高亮一闪"视觉反馈
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {object} payload.state - 高亮动画状态（含 cells 数组）
   * @returns {void}
   */
  _onRenderLandingFlash = (payload) => {
    const { state } = payload;
    const { UI } = this;
    UI.renderLandingFlash(state);
  };

  /**
   * ## 处理渲染垃圾行预警事件
   *
   * 当玩家即将受到垃圾行攻击时触发。 通知 UI 在棋盘顶部绘制红色半透明警告条。 动画由 `GarbageWarningAnimation` 控制，3
   * 次闪烁共 300ms。
   *
   * @private
   * @returns {void}
   */
  _onRenderGarbageWarning = () => {
    const { UI } = this;
    UI.renderGarbageWarning();
  };

  /**
   * ## 处理渲染垃圾行推入事件
   *
   * 当垃圾行实际插入棋盘后触发。 通知 UI 渲染棋盘整体下移的过渡动画。 动画由 `GarbagePushAnimation` 控制，5 步共
   * 200ms。
   *
   * @private
   * @param {object} payload - 事件参数
   * @returns {void}
   */
  _onRenderGarbagePush = (payload) => {
    const { rows, visible } = payload;
    const { UI } = this;
    UI.renderGarbagePush(rows, visible);
  };
}

export default UIRouter;
