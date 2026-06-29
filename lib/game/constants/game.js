/**
 * ## AI 允许执行的操作列表
 *
 * AI 对战时，只允许执行这些元操作（不包含具体的方块移动/旋转）。 防止 AI 直接操控游戏核心逻辑，确保 AI 和人类玩家使用相同的输入通道。
 *
 * 这些操作是通过 CommandQueue 和事件系统间接执行的， 而非直接调用 Game 的方法，保证了公平性。
 *
 * @constant {string[]}
 */
const AI_ALLOWED_ACTIONS = [
  'SWITCH_CONTROLLER', // 切换控制器（human ↔ ai）
  'TOGGLE_MUSIC', // 切换音乐开关
  'TOGGLE_PAUSED', // 暂停/继续游戏
  'RESTART', // 重新开始游戏
  'QUIT', // 退出游戏
];

/**
 * # 消除行数对应的得分表
 *
 * 根据一次消除的行数给予不同的分数奖励。 索引为消除行数，值为对应得分。
 *
 * ### 得分规则
 *
 * | 消除行数 | 得分 | 说明                  |
 * | -------- | ---- | --------------------- |
 * | 0        | 0    | 无消除                |
 * | 1        | 100  | 单行消除（Single）    |
 * | 2        | 300  | 双行消除（Double）    |
 * | 3        | 500  | 三行消除（Triple）    |
 * | 4        | 800  | 四行消除（Tetris）    |
 * | 5        | 1200 | 五行消除（I5 加长块） |
 *
 * ### 设计说明
 *
 * - 消除行数越多，单行平均得分越高（鼓励多行消除）
 * - Tetris（4 行）是最常见的高分手段，800 分
 * - 5 行消除仅在使用 I5 加长方块时可能发生
 *
 * @constant {number[]}
 */
const CLEAR_LINE_SCORES = [0, 100, 300, 500, 800, 1200];

/**
 * ## 游戏字体配置
 *
 * 使用像素字体 "Press Start 2P" 作为主字体， 搭配等宽字体和系统默认无衬线字体作为降级方案。
 *
 * ### 降级策略
 *
 * 1. "Press Start 2P" — 像素风格主字体
 * 2. Monospace — 等宽降级字体
 * 3. Sans-serif — 系统默认无衬线字体
 *
 * 如果浏览器不支持 "Press Start 2P"，会依次降级到后面的字体。
 *
 * @constant {string}
 */
const FONT_FAMILY = `"Press Start 2P", monospace, sans-serif`;

/**
 * # 最大关卡数
 *
 * 致敬 FC 俄罗斯方块的 256 关循环设计。 257 关等效于第 1 关（速度与等级 1 相同）。
 *
 * ### FC 俄罗斯方块背景
 *
 * 原版 FC 俄罗斯方块在达到 256 关后会循环回到第 1 关的速度， 因为等级存储在单字节中（0-255），256 会溢出为 0。
 *
 * 本游戏保留这个设计作为对经典的致敬，256 关后速度不再变化。
 *
 * @constant {number}
 */
const MAX_LEVEL = 256;

/**
 * ## 各难度速度系数
 *
 * 控制不同难度下加速阶段占总等级的百分比。 系数越小，加速阶段越短，step 越大，加速越快。
 *
 * ### 系数说明
 *
 * | 难度   | 系数 | 加速阶段等级数     | step（递减步长） | 触底等级 | 说明     |
 * | ------ | ---- | ------------------ | ---------------- | -------- | -------- |
 * | EASY   | 0.6  | 256 × 0.6 = 153 级 | 7ms              | ~127     | 加速平缓 |
 * | NORMAL | 0.4  | 256 × 0.4 = 102 级 | 10ms             | ~89      | 加速适中 |
 * | HARD   | 0.2  | 256 × 0.2 = 51 级  | 20ms             | ~45      | 加速较快 |
 * | EXPERT | 0.1  | 256 × 0.1 = 25 级  | 40ms             | ~23      | 加速极快 |
 *
 * ### 计算公式
 *
 *     step = ceil(1000 / floor(MAX_LEVEL × SPEED_STEPS[difficulty]))
 *     speed = max(120, 1000 - (level - 1) × step)
 *
 * @constant {object}
 */
const SPEED_STEPS = {
  EASY: 0.6, // Easy：前 60% 等级线性加速
  NORMAL: 0.4, // Normal：前 40% 等级线性加速
  HARD: 0.2, // Hard：前 20% 等级线性加速
  EXPERT: 0.1, // Expert：前 10% 等级线性加速
};

/**
 * ## 全清（All Clear）奖励分数
 *
 * 当玩家将棋盘上所有方块全部消除（棋盘完全清空）时， 额外获得 2000 分的奖励。
 *
 * ### 触发条件
 *
 * - 消行后棋盘上没有任何已锁定的方块
 * - 即棋盘矩阵的所有格子均为空（0）
 *
 * ### 设计意图
 *
 * All Clear 是高级技巧，需要精确规划才能实现， 因此给予高额奖励以鼓励玩家追求。
 *
 * @constant {number}
 */
const ALL_CLEAR_SCORE = 2000;

/**
 * ## T-Spin 得分表
 *
 * T 方块在特殊旋转方式下插入缝隙的得分奖励。 根据同时消除的行数给予不同分数。
 *
 * ### T-Spin 得分
 *
 * | 消除行数 | 得分 | 说明          |
 * | -------- | ---- | ------------- |
 * | 0        | 400  | T-Spin 无消除 |
 * | 1        | 800  | T-Spin Single |
 * | 2        | 1200 | T-Spin Double |
 * | 3        | 1600 | T-Spin Triple |
 *
 * ### T-Spin 判定条件
 *
 * 1. 当前方块是 T 方块
 * 2. 最后一步操作是旋转
 * 3. 方块 4 个对角线中有 3 个被占用（墙壁或方块）
 * 4. 旋转后插入缝隙位置
 *
 * @constant {number[]}
 */
const T_SPIN_SCORES = [400, 800, 1200, 1600];

/**
 * ## T-Spin Mini 得分表
 *
 * T-Spin 的弱化版本，判定条件相对宽松。 得分低于完整 T-Spin。
 *
 * ### T-Spin Mini 得分
 *
 * | 消除行数 | 得分 | 说明               |
 * | -------- | ---- | ------------------ |
 * | 0        | 100  | T-Spin Mini 无消除 |
 * | 1        | 200  | T-Spin Mini Single |
 * | 2        | 400  | T-Spin Mini Double |
 *
 * ### T-Spin Mini 判定条件
 *
 * 与 T-Spin 类似，但对角线占用条件更宽松（2 个对角线即可）。 通常发生在 T 方块贴边旋转插入的情况。
 *
 * @constant {number[]}
 */
const T_SPIN_MINI_SCORES = [100, 200, 400];

/**
 * # 游戏通用常量配置
 *
 * 集中管理游戏中的消行得分规则、字体配置、速度参数和特殊奖励。 所有魔法数字集中于此，便于调整游戏平衡性和视觉风格。
 *
 * ### 包含的常量
 *
 * | 常量               | 类型     | 说明                 |
 * | ------------------ | -------- | -------------------- |
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
