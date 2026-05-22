import Images from '@/lib/services/ui/constants/scenes-background.js';
import { getImage } from '@/lib/services/ui/image/image-manager.js';
import renderImage from '@/lib/services/ui/image/render-image.js';

/**
 * # 渲染游戏手柄背景元素（Gamepad Scene Element）
 *
 * 在游戏场景中渲染手柄装饰图像，作为背景 UI 元素。 用于提示玩家可以使用手柄操作。
 *
 * ## 布局计算
 *
 * - **尺寸**：画布宽度的 54%
 * - **水平**：居中
 * - **垂直**：略微上移（`height / 2 - size × 1.2`）
 *
 * @function renderGamepad
 * @param {object} canvas - Canvas 画布管理器对象
 * @returns {void}
 */
const renderGamepad = (canvas) => {
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  // 获取手柄图片（带缓存机制）
  const img = getImage(Images.gamepad);

  // 渲染尺寸：画布宽度的 54%
  const size = Math.floor(width * 0.54);

  // 水平居中
  const x = width / 2 - size / 2;

  // 垂直位置：中点上移 1.2 倍尺寸
  const y = height / 2 - size * 1.2;

  // 执行渲染
  renderImage(canvas, { img, x, y, size });
};

export default renderGamepad;
