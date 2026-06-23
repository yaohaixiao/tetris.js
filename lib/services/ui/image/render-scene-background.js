import ScenesBackground from '@/lib/services/ui/constants/scenes-background.js';
import { getImage } from '@/lib/services/ui/image/image-manager.js';
import renderImage from '@/lib/services/ui/image/render-image.js';

/**
 * # 场景背景渲染器
 *
 * 根据当前游戏场景和时间段渲染不同的背景图标。
 *
 * ## 场景背景对应
 *
 * | 场景        | 背景图标    | 说明                                             |
 * | ----------- | ----------- | ------------------------------------------------ |
 * | `main-menu` | Tetris 图标 | 主菜单和倒计时场景                               |
 * | `countdown` | Tetris 图标 | 同上                                             |
 * | `playing`   | 动态切换    | 根据时间切换：0-8h 宝塔、8-14h 寺庙、14-24h 塔楼 |
 * | `paused`    | 咖啡杯      | 暂停休息主题                                     |
 * | `game-over` | 笑脸        | 游戏结束                                         |
 *
 * ## playing 场景时间段
 *
 * | 时间段        | 背景图标       | 说明      |
 * | ------------- | -------------- | --------- |
 * | 0:00 - 8:00   | pagoda（宝塔） | 清晨/夜间 |
 * | 8:00 - 14:00  | temple（寺庙） | 上午      |
 * | 14:00 - 24:00 | tower（塔楼）  | 下午/晚上 |
 *
 * @function renderSceneBackground
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {string} scene - 当前场景名称
 * @returns {void}
 */
const renderSceneBackground = (canvas, scene) => {
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  // 获取当前小时（0-23），用于 playing 场景的时间主题切换
  const hours = new Date().getHours();

  let icon; // 图标名称
  let img; // 图片对象
  let size; // 渲染尺寸
  let x; // 渲染 X 坐标
  let y; // 渲染 Y 坐标

  switch (scene) {
    /** 主菜单 / 倒计时场景：使用 Tetris 图标 */
    case 'game-mode':
    case 'battle-mode':
    case 'main-menu':
    case 'countdown': {
      img = getImage(ScenesBackground.tetris);

      size = width;
      x = width / 2 - size / 2;
      y = height - size;
      break;
    }

    /** 游戏进行中场景：根据时间切换主题背景 */
    case 'playing': {
      // 时间驱动的背景主题选择
      if (hours >= 0 && hours <= 8) {
        icon = 'pagoda'; // 宝塔（清晨/夜间）
        size = width * 1.4;
      } else if (hours > 8 && hours <= 14) {
        icon = 'temple'; // 寺庙（上午）
        size = width * 1.1;
      } else {
        icon = 'tower'; // 塔楼（下午/晚上）
        size = width * 1.6;
      }

      img = getImage(ScenesBackground[icon]);

      x = width / 2 - size / 2;
      y = height - size;
      break;
    }

    /** 暂停场景：使用咖啡杯图标 */
    case 'paused': {
      img = getImage(ScenesBackground.coffee);

      size = width * 0.76;
      x = width / 2 - size / 2;
      y = height - size * 0.94;
      break;
    }

    /** 游戏结束场景：使用笑脸图标 */
    case 'game-over': {
      img = getImage(ScenesBackground.happy);

      size = Math.floor(width * 0.42);
      x = width / 2 - size / 2;
      y = height / 2 - size * 1.35;
      break;
    }
  }

  // 执行最终渲染
  renderImage(canvas, { img, x, y, size });
};

export default renderSceneBackground;
