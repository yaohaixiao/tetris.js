import resize from '@/lib/ui/core/resize.js';
import renderScene from '@/lib/ui/scene-manager/render-scene.js';

/**
 * # 窗口变化大小时
 *
 * 根据新的窗口大小，重新游戏绘制界面
 *
 * @function onResize
 * @returns {void}
 */
const onResize = () => {
  resize();
  renderScene();
};

export default onResize;
