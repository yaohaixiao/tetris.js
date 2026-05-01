import Canvas from '@/lib/ui/core/canvas.js';
import Images from '@/lib/ui/constants/images/scenes-background.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';

/**
 * # 渲染游戏手柄背景元素（Gamepad Scene Element）
 *
 * 用于在游戏场景中渲染手柄装饰图像（背景 UI 元素）
 *
 * 职责：
 *
 * - 获取画布尺寸
 * - 加载缓存图片资源
 * - 计算居中布局
 * - 渲染到画布
 */
const renderGamepad = () => {
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  // 获取手柄图片（带缓存机制）
  const img = getImage(Images.gamepad);

  /**
   * 计算渲染尺寸：
   *
   * - 宽度的 54% 作为缩放基准
   */
  const size = Math.floor(width * 0.54);

  /** 居中水平对齐 */
  const x = width / 2 - size / 2;

  /** 垂直略微上移（1.2 倍高度偏移） */
  const y = height / 2 - size * 1.2;

  // 执行渲染
  renderImage(img, x, y, size);
};

export default renderGamepad;
