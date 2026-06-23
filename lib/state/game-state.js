/**
 * # 全局游戏状态类型定义
 *
 * 集中定义所有游戏数据的类型和说明，供 Store 初始化时参考。
 *
 * @typedef {object} TetrisState
 * @property {number} modeIndex - 游戏模式索引值：`'human'`（普通玩家）| `'ai'`（AI 玩家）
 * @property {string} controller - 游戏当前控制者：`'human'`（普通玩家）| `'ai'`（AI 玩家）
 * @property {string[][]} beginningBoard - 游戏初始化时的棋盘数据，用于回放模式恢复初始状态
 * @property {string[][]} board - 游戏棋盘二维数组，存储每个格子的颜色值（如 `"#00c8ff"`），空字符串表示空格
 * @property {object | null} curr - 当前正在下落的活动方块对象，`null` 表示无活动方块
 * @property {number} cx - 当前方块的 X 坐标（列索引）
 * @property {number} cy - 当前方块的 Y 坐标（行索引）
 * @property {object | null} next - 下一个预览方块对象，`null` 表示未生成
 * @property {object | null} hold - 暂存方块对象，`null` 表示暂存区为空
 * @property {object | null} tSpin - T-Spin 检测结果对象：`{ isTSpin: boolean,
 *   isTSpinMini: boolean }`，`null` 表示未触发
 * @property {boolean} backToBack - 是否触发了 Back-to-Back 连续特殊消行（T-Spin 或 Tetris
 *   的连续奖励）
 * @property {number} score - 当前游戏得分
 * @property {number} lines - 当前已消除的总行数
 * @property {number} level - 当前游戏等级（从 1 开始）
 * @property {number} combo - 连续消行连击计数
 * @property {number} comboScore - 连击累计得分
 * @property {number} highScore - 历史最高得分（持久化存储）
 * @property {number} baseLines - 升级基准行数，用于计算等级提升：`(level - 1) × levelUpSteps`
 * @property {number} levelUpSteps - 每升一级需要消除的行数（默认 10）
 * @property {number[]} clearLines - 当前待消除的满行行号数组
 * @property {string} difficulty - 游戏难度等级：`'easy'` | `'normal'` | `'hard'` |
 *   `'expert'`
 * @property {string} mode - 游戏当前模式： `'main-menu'`（主菜单）| `'difficulty'`（难度选择）|
 *   `'playing'`（游戏中）| `'paused'`（暂停）| `'game-over'`（结束）| `'replay'`（回放）
 * @property {boolean} gamepadConnected - 游戏手柄是否已连接
 */

/**
 * # 全局游戏状态初始值（单一起源）
 *
 * 所有游戏数据的初始状态对象。每次游戏重置时， `GameStore.resetState()` 会深拷贝此对象来恢复初始值，
 * 确保每次新游戏都从相同的状态开始。
 *
 * 使用独立对象而非直接修改，避免多局游戏间的状态污染。
 *
 * @type {TetrisState}
 */
const GameState = {
  modeIndex: 0,

  battleIndex: 0,

  /*
   * ==================== 控制者 ====================
   */
  /** 当前控制者身份：'human'（玩家）| 'ai'（AI） */
  controller: 'human',

  /*
   * ==================== 棋盘数据 ====================
   */
  /** 游戏初始化时的棋盘数据（用于回放模式） */
  beginningBoard: [],

  /** 游戏棋盘（20×10），存储颜色值字符串，空字符串表示空格 */
  board: [],

  /*
   * ==================== 方块数据 ====================
   */
  /** 当前活动方块对象 */
  curr: null,

  /** 当前方块 X 坐标（列索引） */
  cx: 0,

  /** 当前方块 Y 坐标（行索引） */
  cy: 0,

  /** 下一个预览方块对象 */
  next: null,

  /** 暂存方块对象 */
  hold: null,

  /*
   * ==================== 特殊消行 ====================
   */
  /** T-Spin 检测结果 */
  tSpin: null,

  /** Back-to-Back 连续特殊消行标记 */
  backToBack: false,

  /*
   * ==================== 计分数据 ====================
   */
  /** 当前得分 */
  score: 0,

  /** 累计消除行数 */
  lines: 0,

  /** 当前等级（从 1 开始） */
  level: 1,

  /** 连击计数 */
  combo: 0,

  /** 连击累计得分 */
  comboScore: 0,

  /** 历史最高分（持久化存储） */
  highScore: 0,

  /*
   * ==================== 等级系统 ====================
   */
  /** 升级基准行数 */
  baseLines: 0,

  /** 每升一级需要消除的行数（默认 10 行） */
  levelUpSteps: 10,

  /*
   * ==================== 消行数据 ====================
   */
  /** 当前待消除的满行行号数组 */
  clearLines: [],

  /*
   * ==================== 游戏设置 ====================
   */
  /** 游戏难度：'easy' | 'normal' | 'hard' | 'expert' */
  difficulty: 'easy',

  /**
   * 游戏模式：
   *
   * - 'game-mode'：游戏模式
   * - 'battle-mode'：对战模式
   * - 'main-menu'：等级选择
   * - 'difficulty': 难度选择
   * - 'playing'：游戏中
   * - 'paused'：游戏暂停
   * - 'game-over'：游戏结束
   * - 'replay'：游戏回放
   */
  mode: 'game-mode',

  /*
   * ==================== 外设状态 ====================
   */
  /** 游戏手柄是否已连接 */
  gamepadConnected: false,
};

export default GameState;
