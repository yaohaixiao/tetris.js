/**
 * ## AI 允许执行的操作列表
 *
 * AI 对战时，只允许执行这些元操作（不包含具体的方块移动/旋转）。 防止 AI 直接操控游戏核心逻辑。
 *
 * @constant {string[]}
 */
const AI_ALLOWED_ACTIONS = [
  'SWITCH_CONTROLLER',
  'TOGGLE_MUSIC',
  'TOGGLE_PAUSED',
  'RESTART',
  'QUIT',
];

/**
 * # 消除行数对应的得分表
 *
 * 根据一次消除的行数给予不同的分数奖励。 索引为消除行数，值为对应得分。
 *
 * | 消除行数 | 得分 | 说明                 |
 * | -------- | ---- | -------------------- |
 * | 0        | 0    | 无消除               |
 * | 1        | 100  | 单行消除             |
 * | 2        | 300  | 双行消除             |
 * | 3        | 500  | 三行消除             |
 * | 4        | 800  | 四行消除（Tetris）   |
 * | 5        | 1200 | 五行消除（极端情况） |
 *
 * @constant {number[]}
 */
const CLEAR_LINE_SCORES = [0, 100, 300, 500, 800, 1200];

/**
 * ## 游戏字体配置
 *
 * 使用像素字体 "Press Start 2P" 作为主字体， 搭配等宽字体和系统默认无衬线字体作为降级方案。
 *
 * @constant {string}
 */
const FONT_FAMILY = `"Press Start 2P", monospace, sans-serif`;

/**
 * # 最大关卡数
 *
 * 致敬 FC 俄罗斯方块的 256 关循环设计。 257 关等效于第 1 关。
 *
 * @constant {number}
 */
const MAX_LEVEL = 256;

/**
 * # 游戏通用常量配置
 *
 * 集中管理游戏中的消行得分规则和字体配置。
 *
 * @constant {object} GAME
 */
const GAME = {
  CLEAR_LINE_SCORES,
  FONT_FAMILY,
  AI_ALLOWED_ACTIONS,
  MAX_LEVEL,
};

export default GAME;
