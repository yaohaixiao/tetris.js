import Canvas from '@/lib/ui/core/canvas.js';
import ChineseHourCharacters from '@/lib/ui/constants/images/chinese-hour-characters.js';
import { getImage } from '@/lib/ui/image/image-manager.js';
import renderImage from '@/lib/ui/image/render-image.js';
import getChineseHourCharacter from '@/lib/ui/image/utils/get-chinese-hour-character.js';

/**
 * # 时间段布局策略表（Strategy Map）
 *
 * 用于根据不同时间段返回对应的布局参数（size / x / y）
 *
 * 设计模式：
 *
 * - Strategy Pattern（策略模式）
 * - Key → Function 映射
 */
const LAYOUT_STRATEGIES = {
  // 深夜 0-3 点
  night_0_3: (width, height) => ({
    size: Math.floor(width * 0.48),
    x: width - Math.floor(width * 0.48) * 0.7,
    y: height / 2 - Math.floor(width * 0.48) * 1.4,
  }),

  // 清晨 4-7 点
  morning_4_7: (width, height) => {
    const size = Math.floor(width * 0.52);

    return {
      size,
      x: width - size * 1.1,
      y: height / 2 - size * 1.7,
    };
  },

  // 上午 8-11 点
  morning_8_11: (width, height) => {
    const size = Math.floor(width * 0.58);

    return {
      size,
      x: width - size * 1.2,
      y: height / 2 - size * 1.75,
    };
  },

  // 中午 12-14 点
  noon_12_14: (width) => {
    const size = Math.floor(width * 0.68);

    return {
      size,
      x: width / 2 - size / 2,
      y: -size * 0.1,
    };
  },

  // 下午 14-16 点
  afternoon_14_16: (width, height) => {
    const size = Math.floor(width * 0.58);

    return {
      size,
      x: size * 0.2,
      y: height / 2 - size * 1.75,
    };
  },

  // 傍晚 17-19 点
  evening_17_19: (width, height) => {
    const size = Math.floor(width * 0.52);

    return {
      size,
      x: size * 0.1,
      y: height / 2 - size * 1.7,
    };
  },

  // 夜晚 20-23 点
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
 * @param {number} hour - 当前小时（0-23）
 * @returns {string} 策略 key
 */
const getStrategyKey = (hour) => {
  if (hour <= 3) {
    return 'night_0_3';
  }

  if (hour <= 7) {
    return 'morning_4_7';
  }

  if (hour <= 11) {
    return 'morning_8_11';
  }

  if (hour <= 14) {
    return 'noon_12_14';
  }

  if (hour <= 16) {
    return 'afternoon_14_16';
  }

  if (hour <= 19) {
    return 'evening_17_19';
  }

  return 'night_20_23';
};

/**
 * # 渲染中国时辰字符（策略版）
 *
 * 根据当前时间：
 *
 * - 获取对应“时辰字符”
 * - 选择布局策略
 * - 渲染到画布
 */
const renderChineseHourCharacter = () => {
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  // 当前小时
  const hour = new Date().getHours();

  // 根据小时获取对应字符
  const character = getChineseHourCharacter(hour);

  // 获取对应图片资源
  const img = getImage(ChineseHourCharacters[character]);

  // 选择布局策略
  const key = getStrategyKey(hour);
  const strategy = LAYOUT_STRATEGIES[key];

  // 计算布局参数
  const { size, x, y } = strategy(width, height);

  // 渲染图片
  renderImage(img, x, y, size);
};

export default renderChineseHourCharacter;
