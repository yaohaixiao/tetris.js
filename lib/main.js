import Engine from '@/lib/engine';
import Images from '@/lib/services/ui/constants/scenes-background.js';
import { preloadImages } from './services/ui/image/image-manager.js';

/**
 * # 游戏主函数（入口）
 *
 * 在页面加载完成后执行，负责预加载资源并启动游戏引擎。
 *
 * ## 执行流程
 *
 * 1. **预加载图片资源**：将场景背景 SVG 图片提前加载到缓存，避免渲染时延迟
 * 2. **启动游戏引擎**：初始化 Engine、创建 Game 实例、绑定事件、启动主循环
 *
 * @function main
 * @returns {void}
 */
const main = () => {
  // 预加载所有场景背景图片（SVG → Image）
  preloadImages(Images);

  // 启动游戏引擎（初始化 → 订阅事件 → 启动主循环）
  Engine.launch();
};

export default main;
