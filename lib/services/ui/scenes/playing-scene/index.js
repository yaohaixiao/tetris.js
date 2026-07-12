import renderPlaying from '@/lib/services/ui/scenes/playing-scene/render-playing.js';

/**
 * ============================================================
 *
 * # 游戏进行中场景入口
 *
 * ============================================================
 *
 * 该函数是 playing scene 的统一入口层， 当前仅负责转发渲染逻辑，保留该层用于未来扩展。
 *
 * ## 扩展预留
 *
 * - 场景进入 / 退出生命周期（enter / exit）
 * - UI 或特效叠加层（overlay）
 * - 调试信息 / devtools 输出
 * - 条件渲染控制（暂停子模块、节流渲染等）
 *
 * ## 设计目的
 *
 * - 保持 Scene 层作为控制层，而非直接渲染层
 * - 避免 render 层与状态控制逻辑耦合
 *
 * @function playingScene
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const playingScene = (canvas, state) => {
  // 转发到渲染层完成绘制
  renderPlaying(canvas, state);
};

export default playingScene;
