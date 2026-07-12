/**
 * AI 允许执行的操作列表。
 *
 * AI 对战时，只允许执行这些元操作（不包含具体的方块移动/旋转）。 防止 AI 直接操控游戏核心逻辑， 确保 AI 和人类玩家使用相同的输入通道。
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
 * 消除行数对应的得分表。
 *
 * 根据一次消除的行数给予不同的分数奖励。 索引为消除行数，值为对应得分。
 *
 * | 消除行数 | 得分 | 说明                  |
 * | :------- | :--- | :-------------------- |
 * | 0        | 0    | 无消除                |
 * | 1        | 100  | 单行消除（Single）    |
 * | 2        | 300  | 双行消除（Double）    |
 * | 3        | 500  | 三行消除（Triple）    |
 * | 4        | 800  | 四行消除（Tetris）    |
 * | 5        | 1200 | 五行消除（I5 加长块） |
 *
 * @constant {number[]}
 */
const CLEAR_LINE_SCORES = [0, 100, 300, 500, 800, 1200];

/**
 * 游戏字体配置。
 *
 * 使用像素字体 "Press Start 2P" 作为主字体， 搭配等宽字体和系统默认无衬线字体作为降级方案。
 *
 * @constant {string}
 */
const FONT_FAMILY = `"Press Start 2P", monospace, sans-serif`;

/**
 * 最大关卡数。
 *
 * 致敬 FC 俄罗斯方块的 256 关循环设计。 257 关等效于第 1 关（速度与等级 1 相同）。
 *
 * @constant {number}
 */
const MAX_LEVEL = 256;

/**
 * 各难度速度系数。
 *
 * 控制不同难度下加速阶段占总等级的百分比。 系数越小，加速阶段越短，step 越大，加速越快。
 *
 * | 难度   | 系数 | 加速阶段等级数     | step | 触底等级 |
 * | :----- | :--- | :----------------- | :--- | :------- |
 * | EASY   | 0.6  | 256 × 0.6 = 153 级 | 7ms  | ~127     |
 * | NORMAL | 0.4  | 256 × 0.4 = 102 级 | 10ms | ~89      |
 * | HARD   | 0.2  | 256 × 0.2 = 51 级  | 20ms | ~45      |
 * | EXPERT | 0.1  | 256 × 0.1 = 25 级  | 40ms | ~23      |
 *
 * @constant {object}
 */
const SPEED_STEPS = {
  EASY: 0.6,
  NORMAL: 0.4,
  HARD: 0.2,
  EXPERT: 0.1,
};

/**
 * 全清（All Clear）奖励分数。
 *
 * 当玩家将棋盘上所有方块全部消除时，额外获得 2000 分的奖励。
 *
 * @constant {number}
 */
const ALL_CLEAR_SCORE = 2000;

/**
 * T-Spin 得分表。
 *
 * T 方块在特殊旋转方式下插入缝隙的得分奖励。 根据同时消除的行数给予不同分数。
 *
 * | 消除行数 | 得分 | 说明          |
 * | :------- | :--- | :------------ |
 * | 0        | 400  | T-Spin 无消除 |
 * | 1        | 800  | T-Spin Single |
 * | 2        | 1200 | T-Spin Double |
 * | 3        | 1600 | T-Spin Triple |
 *
 * @constant {number[]}
 */
const T_SPIN_SCORES = [400, 800, 1200, 1600];

/**
 * T-Spin Mini 得分表。
 *
 * T-Spin 的弱化版本，判定条件相对宽松。 得分低于完整 T-Spin。
 *
 * | 消除行数 | 得分 | 说明               |
 * | :------- | :--- | :----------------- |
 * | 0        | 100  | T-Spin Mini 无消除 |
 * | 1        | 200  | T-Spin Mini Single |
 * | 2        | 400  | T-Spin Mini Double |
 *
 * @constant {number[]}
 */
const T_SPIN_MINI_SCORES = [100, 200, 400];

/**
 * ============================================================
 *
 * # 游戏通用常量配置
 *
 * ============================================================
 *
 * 集中管理游戏中的消行得分规则、字体配置、速度参数和特殊奖励。 所有魔法数字集中于此，便于调整游戏平衡性和视觉风格。
 *
 * ### 包含的常量
 *
 * | 常量               | 类型     | 说明                 |
 * | :----------------- | :------- | :------------------- |
 * | CLEAR_LINE_SCORES  | number[] | 消行得分表           |
 * | FONT_FAMILY        | string   | 游戏像素字体         |
 * | AI_ALLOWED_ACTIONS | string[] | AI 允许执行的操作    |
 * | MAX_LEVEL          | number   | 最大关卡数（256）    |
 * | SPEED_STEPS        | object   | 各难度速度系数       |
 * | ALL_CLEAR_SCORE    | number   | 全清奖励分数（2000） |
 * | T_SPIN_SCORES      | number[] | T-Spin 得分表        |
 * | T_SPIN_MINI_SCORES | number[] | T-Spin Mini 得分表   |
 *
 * @constant {object} GAME
 */
const GAME = {
  CLEAR_LINE_SCORES,
  FONT_FAMILY,
  AI_ALLOWED_ACTIONS,
  MAX_LEVEL,
  SPEED_STEPS,
  ALL_CLEAR_SCORE,
  T_SPIN_SCORES,
  T_SPIN_MINI_SCORES,
};

export default GAME;
