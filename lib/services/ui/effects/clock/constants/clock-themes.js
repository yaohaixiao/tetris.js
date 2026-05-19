import COLORS from '@/lib/constants/colors.js';

const {
  CORAL,
  RGBA_CORAL,
  WHITE,
  RGBA_WHITE,
  PURPLE,
  RGBA_PURPLE,
  TEAL,
  RGBA_TEAL,
  PINK,
  RGBA_PINK,
  ORANGE,
  RGBA_ORANGE,
  GREEN,
  RGBA_GREEN,
  BLUE,
  RGBA_BLUE,
  YELLOW,
  RGBA_YELLOW,
  RED,
  RGBA_RED,
  VIOLET,
  RGBA_VIOLET,
  CYAN,
  RGBA_CYAN,
} = COLORS;

/**
 * # 模拟时钟主题配置表
 *
 * 定义 12 种时钟主题色，每种主题包含表盘颜色和指针颜色。 主题与中国十二时辰对应，每小时自动切换。
 *
 * ## 主题结构
 *
 * | 属性         | 说明                       |
 * | ------------ | -------------------------- |
 * | `stroke`     | 表盘边框和刻度颜色         |
 * | `face`       | 表盘底色（半透明）         |
 * | `secondHand` | 秒针颜色（与主题形成对比） |
 *
 * ## 主题与时辰对应
 *
 * | 主题   | 时辰 | 小时  |
 * | ------ | ---- | ----- |
 * | Red    | 子时 | 23, 0 |
 * | White  | 丑时 | 1-2   |
 * | Orange | 寅时 | 3-4   |
 * | Cyan   | 卯时 | 5-6   |
 * | Blue   | 辰时 | 7-8   |
 * | Coral  | 巳时 | 9-10  |
 * | Purple | 午时 | 11-12 |
 * | Green  | 未时 | 13-14 |
 * | Yellow | 申时 | 15-16 |
 * | Pink   | 酉时 | 17-18 |
 * | Teal   | 戌时 | 19-20 |
 * | Violet | 亥时 | 21-22 |
 *
 * @constant {object} ClockThemes
 */
const ClockThemes = {
  /** 戌时 (19-20) */
  Teal: { stroke: TEAL, face: RGBA_TEAL, secondHand: VIOLET },

  /** 亥时 (21-22) */
  Violet: { stroke: VIOLET, face: RGBA_VIOLET, secondHand: TEAL },

  /** 申时 (15-16) */
  Yellow: { stroke: YELLOW, face: RGBA_YELLOW, secondHand: PINK },

  /** 酉时 (17-18) */
  Pink: { stroke: PINK, face: RGBA_PINK, secondHand: YELLOW },

  /** 午时 (11-12) */
  Purple: { stroke: PURPLE, face: RGBA_PURPLE, secondHand: GREEN },

  /** 未时 (13-14) */
  Green: { stroke: GREEN, face: RGBA_GREEN, secondHand: CYAN },

  /** 辰时 (7-8) */
  Blue: { stroke: BLUE, face: RGBA_BLUE, secondHand: CORAL },

  /** 巳时 (9-10) */
  Coral: { stroke: CORAL, face: RGBA_CORAL, secondHand: BLUE },

  /** 寅时 (3-4) */
  Orange: { stroke: ORANGE, face: RGBA_ORANGE, secondHand: CYAN },

  /** 卯时 (5-6) */
  Cyan: { stroke: CYAN, face: RGBA_CYAN, secondHand: ORANGE },

  /** 丑时 (1-2) */
  White: { stroke: WHITE, face: RGBA_WHITE, secondHand: RED },

  /** 子时 (23, 0) */
  Red: { stroke: RED, face: RGBA_RED, secondHand: WHITE },
};

export default ClockThemes;
