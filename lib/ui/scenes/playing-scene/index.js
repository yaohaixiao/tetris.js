import renderPlaying from '@/lib/ui/scenes/playing-scene/render-playing.js';

/**
 * # 游戏“进行中”场景入口（Playing Scene Controller）
 *
 * 该函数是 playing scene 的统一入口层（scene wrapper）， 当前仅负责转发渲染逻辑，但保留该层是为了未来扩展场景级能力，例如：
 *
 * - 场景进入 / 退出生命周期（enter / exit）
 * - UI 或特效叠加层（overlay）
 * - 调试信息 / devtools 输出
 * - 条件渲染控制（暂停子模块、节流渲染等）
 *
 * 当前结构设计目的：
 *
 * - 保持 Scene 层作为“控制层”，而不是直接渲染层
 * - 避免 render 层与状态控制逻辑耦合
 *
 * @function playingScene
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const playingScene = (state) => {
  // 目前仅调用 render 层完成绘制
  renderPlaying(state);
};

export default playingScene;
