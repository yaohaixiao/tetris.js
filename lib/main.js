import Engine from '@/lib/engine/engine.js';

/**
 * # 游戏主函数（页面加载时执行）
 *
 * 重置棋盘、加载数据、设置初始状态、适配窗口、绑定事件
 *
 * @function main
 * @returns {void}
 */
const main = () => {
  Engine.launch();
};

export default main;
