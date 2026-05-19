/* ==================== 游戏使用的所有颜色 ==================== */

/**
 * ## 青色（Teal）
 *
 * @type {string}
 */
const TEAL = '#00c8ff';

/**
 * ## 青色（半透明）
 *
 * @type {string}
 */
const RGBA_TEAL = 'rgba(0, 200, 255, 0.3)';

/**
 * ## 黄色（Yellow）
 *
 * @type {string}
 */
const YELLOW = '#f1fa04';

/**
 * ## 黄色（半透明）
 *
 * @type {string}
 */
const RGBA_YELLOW = 'rgba(255, 255, 0, 0.3)';

/**
 * ## 紫色（Purple）
 *
 * @type {string}
 */
const PURPLE = '#d31ac1';

/**
 * ## 紫色（半透明）
 *
 * @type {string}
 */
const RGBA_PURPLE = 'rgba(211, 26, 193, 0.3)';

/**
 * ## 蓝色（Blue）
 *
 * @type {string}
 */
const BLUE = '#5050ff';

/**
 * ## 蓝色（半透明）
 *
 * @type {string}
 */
const RGBA_BLUE = 'rgba(80, 80, 255, 0.3)';

/**
 * ## 橙色（Orange）
 *
 * @type {string}
 */
const ORANGE = '#ffa500';

/**
 * ## 橙色（半透明）
 *
 * @type {string}
 */
const RGBA_ORANGE = 'rgba(255, 127, 0, 0.3)';

/**
 * ## 绿色（Green）
 *
 * @type {string}
 */
const GREEN = '#0afa04';

/**
 * ## 深绿色（Dark Green）
 *
 * @type {string}
 */
const DARK_GREEN = '#5c9d31';

/**
 * ## 绿色（半透明）
 *
 * @type {string}
 */
const RGBA_GREEN = 'rgba(0, 255, 0, 0.3)';

/**
 * ## 红色（Red）
 *
 * @type {string}
 */
const RED = '#ff3b30';

/**
 * ## 红色（半透明）
 *
 * @type {string}
 */
const RGBA_RED = 'rgba(255, 59, 48, 0.3)';

/**
 * ## 珊瑚红（Coral）
 *
 * @type {string}
 */
const CORAL = '#e64a19';

/**
 * ## 珊瑚红（半透明）
 *
 * @type {string}
 */
const RGBA_CORAL = 'rgba(230, 74, 25, 0.3)';

/**
 * ## 黑色（Black）
 *
 * @type {string}
 */
const BLACK = '#444';

/**
 * ## 黑色（半透明）
 *
 * 用于遮罩层和方块边框。
 *
 * @type {string}
 */
const RGBA_BLACK = 'rgba(0, 0, 0, 0.3)';

/**
 * ## 白色（White）
 *
 * @type {string}
 */
const WHITE = '#fff';

/**
 * ## 白色（半透明）
 *
 * @type {string}
 */
const RGBA_WHITE = 'rgba(255, 255, 255, 0.3)';

/**
 * ## 粉色（Pink）
 *
 * @type {string}
 */
const PINK = '#ff4fa3';

/**
 * ## 粉色（半透明）
 *
 * @type {string}
 */
const RGBA_PINK = 'rgba(255, 79, 163, 0.3)';

/**
 * ## 电光蓝紫（Violet）
 *
 * @type {string}
 */
const VIOLET = '#7b34eb';

/**
 * ## 电光蓝紫（半透明）
 *
 * @type {string}
 */
const RGBA_VIOLET = 'rgba(123, 52, 235, 0.3)';

/**
 * ## 湖青蓝（Cyan）
 *
 * @type {string}
 */
const CYAN = '#0cc0df';

/**
 * ## 湖青蓝（半透明）
 *
 * @type {string}
 */
const RGBA_CYAN = 'rgba(12, 192, 223, 0.3)';

/**
 * # 游戏颜色常量集合
 *
 * 集中管理游戏中使用的所有颜色值， 每种颜色提供标准色和对应的半透明版本（RGBA）。
 *
 * ## 颜色列表
 *
 * | 颜色       | 标准色  | 半透明                | 用途示例     |
 * | ---------- | ------- | --------------------- | ------------ |
 * | TEAL       | #00c8ff | rgba(0,200,255,0.3)   | I 型方块     |
 * | YELLOW     | #f1fa04 | rgba(255,255,0,0.3)   | T 型方块     |
 * | PURPLE     | #d31ac1 | rgba(211,26,193,0.3)  | 时钟主题     |
 * | BLUE       | #5050ff | rgba(80,80,255,0.3)   | L 型方块     |
 * | ORANGE     | #ffa500 | rgba(255,127,0,0.3)   | O 型方块     |
 * | GREEN      | #0afa04 | rgba(0,255,0,0.3)     | I 加长型方块 |
 * | DARK_GREEN | #5c9d31 | -                     | 备用         |
 * | RED        | #ff3b30 | rgba(255,59,48,0.3)   | S 型方块     |
 * | CORAL      | #e64a19 | rgba(230,74,25,0.3)   | 时钟主题     |
 * | BLACK      | #444    | rgba(0,0,0,0.3)       | 遮罩层、边框 |
 * | WHITE      | #fff    | rgba(255,255,255,0.3) | 时钟主题     |
 * | PINK       | #ff4fa3 | rgba(255,79,163,0.3)  | J 型方块     |
 * | VIOLET     | #7b34eb | rgba(123,52,235,0.3)  | Z 型方块     |
 * | CYAN       | #0cc0df | rgba(12,192,223,0.3)  | 时钟主题     |
 *
 * @constant {object} COLORS
 */
const COLORS = {
  TEAL,
  RGBA_TEAL,

  YELLOW,
  RGBA_YELLOW,

  PURPLE,
  RGBA_PURPLE,

  BLUE,
  RGBA_BLUE,

  ORANGE,
  RGBA_ORANGE,

  GREEN,
  DARK_GREEN,
  RGBA_GREEN,

  RED,
  RGBA_RED,

  CORAL,
  RGBA_CORAL,

  BLACK,
  RGBA_BLACK,

  WHITE,
  RGBA_WHITE,

  PINK,
  RGBA_PINK,

  VIOLET,
  RGBA_VIOLET,

  CYAN,
  RGBA_CYAN,
};

export default COLORS;
