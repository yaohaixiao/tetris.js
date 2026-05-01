import Canvas from '@/lib/ui/core/canvas.js';
import ScenesBackground from '@/lib/ui/constants/images/scenes-background.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';

/**
 * # 场景背景渲染器
 *
 * 根据当前游戏 scene 渲染不同背景图
 *
 * 支持场景：
 *
 * - Main-menu
 * - Countdown
 * - Playing
 * - Paused
 * - Game-over
 *
 * 同时 playing 场景会根据时间（0-23h）切换不同背景主题
 *
 * @param {string} scene - 当前场景名称
 */
const renderSceneBackground = (scene) => {
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  const hours = new Date().getHours();

  let icon;
  let img;
  let size;
  let x;
  let y;

  switch (scene) {
    /** 主菜单 / 倒计时场景 */
    case 'main-menu':
    case 'countdown': {
      img = getImage(ScenesBackground.tetris);

      size = width;
      x = width / 2 - size / 2;
      y = height - size;
      break;
    }

    /** 游戏进行中场景（根据时间切换主题背景） */
    case 'playing': {
      // 时间驱动的背景主题选择
      if (hours >= 0 && hours <= 8) {
        icon = 'pagoda';
        size = width * 1.4;
      } else if (hours > 8 && hours <= 14) {
        icon = 'temple';
        size = width * 1.1;
      } else {
        icon = 'tower';
        size = width * 1.6;
      }

      img = getImage(ScenesBackground[icon]);

      x = width / 2 - size / 2;
      y = height - size;
      break;
    }

    /** 暂停场景 */
    case 'paused': {
      img = getImage(ScenesBackground.coffee);

      size = width * 0.76;
      x = width / 2 - size / 2;
      y = height - size * 0.94;
      break;
    }

    /** 游戏结束场景 */
    case 'game-over': {
      img = getImage(ScenesBackground.happy);

      size = Math.floor(width * 0.42);
      x = width / 2 - size / 2;
      y = height / 2 - size * 1.35;
      break;
    }
  }

  // 执行最终渲染
  renderImage(img, x, y, size);
};

export default renderSceneBackground;
