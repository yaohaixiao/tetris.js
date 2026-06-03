import COLORS from '@/lib/constants/colors.js';

/**
 * # 方块配色方案表
 *
 * 游戏共 256 关，每 32 关切换一套配色，共 8 套配色方案。 全部保持鲜艳，每套方案有独立的色调主题，随关卡推进逐步解锁。
 *
 * ## 配色方案索引
 *
 * | 关卡段  | 方案   | 主题     | 索引 |
 * | ------- | ------ | -------- | ---- |
 * | 0-31    | 基础   | 经典鲜艳 | 0    |
 * | 32-63   | WARM   | 暖色系   | 1    |
 * | 64-95   | COOL   | 冷色系   | 2    |
 * | 96-127  | CANDY  | 糖果色   | 3    |
 * | 128-159 | FOREST | 森林色   | 4    |
 * | 160-191 | SUNSET | 日落色   | 5    |
 * | 192-223 | NEON   | 霓虹色   | 6    |
 * | 224-255 | JEWEL  | 宝石色   | 7    |
 *
 * ## 颜色顺序
 *
 * 每个方案包含 8 种颜色，按以下顺序对应方块类型： TEAL → GREEN → ORANGE → YELLOW → BLUE → PINK → RED
 * → VIOLET
 *
 * @constant {string[][]} PALETTES - 8 套配色方案，每套包含 8 个十六进制颜色值
 */
const PALETTES = [
  /*
   * ==================== 方案 0：基础经典（关卡 0-31） ====================
   */
  [
    COLORS.TEAL,
    COLORS.GREEN,
    COLORS.ORANGE,
    COLORS.YELLOW,
    COLORS.BLUE,
    COLORS.PINK,
    COLORS.RED,
    COLORS.VIOLET,
  ],

  /*
   * ==================== 方案 1：暖色系（关卡 32-63） ====================
   */
  [
    COLORS.WARM_TEAL,
    COLORS.WARM_GREEN,
    COLORS.WARM_ORANGE,
    COLORS.WARM_YELLOW,
    COLORS.WARM_BLUE,
    COLORS.WARM_PINK,
    COLORS.WARM_RED,
    COLORS.WARM_VIOLET,
  ],

  /*
   * ==================== 方案 2：冷色系（关卡 64-95） ====================
   */
  [
    COLORS.COOL_TEAL,
    COLORS.COOL_GREEN,
    COLORS.COOL_ORANGE,
    COLORS.COOL_YELLOW,
    COLORS.COOL_BLUE,
    COLORS.COOL_PINK,
    COLORS.COOL_RED,
    COLORS.COOL_VIOLET,
  ],

  /*
   * ==================== 方案 3：糖果色（关卡 96-127） ====================
   */
  [
    COLORS.CANDY_TEAL,
    COLORS.CANDY_GREEN,
    COLORS.CANDY_ORANGE,
    COLORS.CANDY_YELLOW,
    COLORS.CANDY_BLUE,
    COLORS.CANDY_PINK,
    COLORS.CANDY_RED,
    COLORS.CANDY_VIOLET,
  ],

  /*
   * ==================== 方案 4：森林色（关卡 128-159） ====================
   */
  [
    COLORS.FOREST_TEAL,
    COLORS.FOREST_GREEN,
    COLORS.FOREST_ORANGE,
    COLORS.FOREST_YELLOW,
    COLORS.FOREST_BLUE,
    COLORS.FOREST_PINK,
    COLORS.FOREST_RED,
    COLORS.FOREST_VIOLET,
  ],

  /*
   * ==================== 方案 5：日落色（关卡 160-191） ====================
   */
  [
    COLORS.SUNSET_TEAL,
    COLORS.SUNSET_GREEN,
    COLORS.SUNSET_ORANGE,
    COLORS.SUNSET_YELLOW,
    COLORS.SUNSET_BLUE,
    COLORS.SUNSET_PINK,
    COLORS.SUNSET_RED,
    COLORS.SUNSET_VIOLET,
  ],

  /*
   * ==================== 方案 6：霓虹色（关卡 192-223） ====================
   */
  [
    COLORS.NEON_TEAL,
    COLORS.NEON_GREEN,
    COLORS.NEON_ORANGE,
    COLORS.NEON_YELLOW,
    COLORS.NEON_BLUE,
    COLORS.NEON_PINK,
    COLORS.NEON_RED,
    COLORS.NEON_VIOLET,
  ],

  /*
   * ==================== 方案 7：宝石色（关卡 224-255） ====================
   */
  [
    COLORS.JEWEL_TEAL,
    COLORS.JEWEL_GREEN,
    COLORS.JEWEL_ORANGE,
    COLORS.JEWEL_YELLOW,
    COLORS.JEWEL_BLUE,
    COLORS.JEWEL_PINK,
    COLORS.JEWEL_RED,
    COLORS.JEWEL_VIOLET,
  ],
];

export default PALETTES;
