import Images from '@/lib/ui/constants/images/scenes-background.js';
import Engine from '@/lib/engine';
import { preloadImages } from '@/lib/ui/image/image-manager.js';

/**
 * # 游戏主函数（页面加载时执行）
 *
 * 重置棋盘、加载数据、设置初始状态、适配窗口、绑定事件
 *
 * @function main
 * @returns {void}
 */
const main = () => {
  preloadImages(Images);
  Engine.launch();
};

export default main;
