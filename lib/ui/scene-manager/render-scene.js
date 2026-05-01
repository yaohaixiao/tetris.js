import Scenes from '@/lib/ui/scenes/index.js';

/**
 * # 场景渲染调度器（Scene Renderer Dispatcher）
 *
 * 根据当前 Index 的运行模式（mode）， 从 Scenes 注册表中获取对应场景并执行渲染。
 *
 * 职责：
 *
 * - 从 Index 获取当前模式（mode）
 * - 查找对应 Scene
 * - 执行 Scene 渲染逻辑
 *
 * 架构意义： 这是整个 UI 渲染系统的“分发中心（dispatcher）”， 相当于游戏渲染管线的入口层。
 *
 * 特点：
 *
 * - 解耦 Index 状态 与 Scene 实现
 * - 支持多场景切换（menu / playing / paused / game-over）
 * - 可扩展为 Scene registry / plugin system
 *
 * @function renderScene
 * @param {object} state - 当前游戏状态对象
 * @returns {void}
 */
const renderScene = (state) => {
  // ======== 获取当前运行模式 ========
  const { mode } = state;

  // ======== 查找对应场景 ========
  const scene = Scenes[mode];

  // ======== 安全检查：无场景直接退出 ========
  if (!scene) return;

  // ======== 执行场景渲染 ========
  scene(state);

  /*
   * ======== 未来扩展点 ========
   * - scene lifecycle hooks
   * - debug logging
   * - performance profiling
   * - transition effects
   */
};

export default renderScene;
