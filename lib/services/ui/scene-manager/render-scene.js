import Scenes from '@/lib/services/ui/scenes';

/**
 * ============================================================
 *
 * # 场景渲染调度器
 *
 * ============================================================
 *
 * 根据当前游戏的运行模式（mode）， 从 Scenes 注册表中获取对应场景并执行渲染。 这是整个 UI 渲染系统的分发中心，
 * 相当于游戏渲染管线的入口层。
 *
 * ## 核心职责
 *
 * - 从游戏状态获取当前模式（mode）
 * - 查找对应的场景渲染函数
 * - 执行场景渲染逻辑
 *
 * ## 架构意义
 *
 * - 解耦状态与实现：Game 状态变化不影响 Scene 实现
 * - 支持多场景切换：menu / playing / paused / game-over
 * - 可扩展：可发展为 Scene registry / plugin system
 * - 统一入口：所有场景渲染都通过此函数分发
 *
 * ## 模式与场景对应
 *
 * | mode       | 场景         | 说明            |
 * | :--------- | :----------- | :-------------- |
 * | main-menu  | 主菜单场景   | 等级选择界面    |
 * | difficulty | 难度选择场景 | 难度配置界面    |
 * | playing    | 游戏进行场景 | 棋盘 + 活动方块 |
 * | paused     | 暂停场景     | 暂停遮罩 + 时钟 |
 * | game-over  | 游戏结束场景 | 结束画面        |
 * | replay     | 回放场景     | 回放画面 + 提示 |
 *
 * ## 示例
 *
 * ```javascript
 * const state = { mode: 'playing', board: [...], curr: {...} };
 * renderScene(canvas, state);
 * // 自动路由到 playing 场景的渲染函数
 * ```
 *
 * @function renderScene
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const renderScene = (canvas, state) => {
  // 获取当前游戏运行模式
  const { mode } = state;

  // 从场景注册表中查找对应场景
  const scene = Scenes[mode];

  // 无对应场景则直接退出
  if (!scene) {
    return;
  }

  // 执行场景渲染
  scene(canvas, state);
};

export default renderScene;
