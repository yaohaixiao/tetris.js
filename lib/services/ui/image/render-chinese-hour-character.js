import ChineseHourCharacters from '@/lib/services/ui/constants/images/chinese-hour-characters.js';
import { getImage } from '@/lib/services/ui/image/image-manager.js';
import renderImage from '@/lib/services/ui/image/render-image.js';
import getChineseHourCharacter from '@/lib/services/ui/image/utils/get-chinese-hour-character.js';

/**
 * # 时间段布局策略表（Strategy Map）
 *
 * 使用**策略模式**，根据不同时间段返回对应的布局参数。 每天分为 7 个时段，每个时段有独特的字符位置和大小。
 *
 * | 时段            | 小时范围 | 说明 |
 * | --------------- | -------- | ---- |
 * | night_0_3       | 0-3      | 深夜 |
 * | morning_4_7     | 4-7      | 清晨 |
 * | morning_8_11    | 8-11     | 上午 |
 * | noon_12_14      | 12-14    | 中午 |
 * | afternoon_14_16 | 14-16    | 下午 |
 * | evening_17_19   | 17-19    | 傍晚 |
 * | night_20_23     | 20-23    | 夜晚 |
 *
 * @constant {object} LAYOUT_STRATEGIES
 */
const LAYOUT_STRATEGIES = {
  /** 深夜 0-3 点：右侧偏大 */
  night_0_3: (width, height) => ({
    size: Math.floor(width * 0.48),
    x: width - Math.floor(width * 0.48) * 0.7,
    y: height / 2 - Math.floor(width * 0.48) * 1.4,
  }),

  /** 清晨 4-7 点：右侧偏中 */
  morning_4_7: (width, height) => {
    const size = Math.floor(width * 0.52);
    return {
      size,
      x: width - size * 1.1,
      y: height / 2 - size * 1.7,
    };
  },

  /** 上午 8-11 点：右侧较大 */
  morning_8_11: (width, height) => {
    const size = Math.floor(width * 0.58);
    return {
      size,
      x: width - size * 1.2,
      y: height / 2 - size * 1.75,
    };
  },

  /** 中午 12-14 点：居中最大 */
  noon_12_14: (width) => {
    const size = Math.floor(width * 0.68);
    return {
      size,
      x: width / 2 - size / 2,
      y: -size * 0.1,
    };
  },

  /** 下午 14-16 点：左侧较大 */
  afternoon_14_16: (width, height) => {
    const size = Math.floor(width * 0.58);
    return {
      size,
      x: size * 0.2,
      y: height / 2 - size * 1.75,
    };
  },

  /** 傍晚 17-19 点：左侧偏中 */
  evening_17_19: (width, height) => {
    const size = Math.floor(width * 0.52);
    return {
      size,
      x: size * 0.1,
      y: height / 2 - size * 1.7,
    };
  },

  /** 夜晚 20-23 点：左侧偏小 */
  night_20_23: (width, height) => {
    const size = Math.floor(width * 0.48);
    return {
      size,
      x: -size * 0.3,
      y: height / 2 - size * 1.4,
    };
  },
};

/**
 * # 根据小时获取策略 key
 *
 * 将 0-23 小时映射到 7 个策略时段。
 *
 * @param {number} hour - 当前小时（0-23）
 * @returns {string} 策略 key
 */
const getStrategyKey = (hour) => {
  if (hour <= 3) return 'night_0_3';
  if (hour <= 7) return 'morning_4_7';
  if (hour <= 11) return 'morning_8_11';
  if (hour <= 14) return 'noon_12_14';
  if (hour <= 16) return 'afternoon_14_16';
  if (hour <= 19) return 'evening_17_19';
  return 'night_20_23';
};

/**
 * # 渲染中国时辰字符（策略版）
 *
 * 根据当前时间：
 *
 * - 获取对应的"时辰字符"（如子、丑、寅等）
 * - 选择对应时段的布局策略
 * - 渲染到画布上
 *
 * ## 视觉效果
 *
 * 字符在一天中从右向左移动，大小在中午达到最大， 模拟太阳在天空中的运行轨迹。
 *
 * @function renderChineseHourCharacter
 * @param {object} canvas - Canvas 画布管理器对象
 * @returns {void}
 */
const renderChineseHourCharacter = (canvas) => {
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  // 获取当前小时
  const hour = new Date().getHours();

  // 根据小时获取对应的时辰字符
  const character = getChineseHourCharacter(hour);

  // 获取对应的图片资源
  const img = getImage(ChineseHourCharacters[character]);

  // 根据小时选择布局策略
  const key = getStrategyKey(hour);
  const strategy = LAYOUT_STRATEGIES[key];

  // 计算布局参数（尺寸、位置）
  const { size, x, y } = strategy(width, height);

  // 渲染图片到画布
  renderImage(canvas, { img, x, y, size });
};

export default renderChineseHourCharacter;
