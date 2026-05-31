/**
 * # 全局游戏状态对象（集中管理所有游戏数据）
 *
 * @typedef {object} TetrisState
 * @property {string} controller - 游戏当前控制者：`human` - 普通玩家，`ai` - AI 玩家
 * @property {string[][]} beginningBoard - 游戏初始化时的方块数据，回放时需要
 * @property {string[][]} board - 游戏棋盘二维数组，存储每个格子的颜色值（如 "#00c8ff"），空为 ""
 * @property {object | null} curr - 当前正在下落的活动方块对象，`null` 表示无
 * @property {number} cx - 当前方块的 X 坐标（列索引）
 * @property {number} cy - 当前方块的 Y 坐标（行索引）
 * @property {object | null} next - 下一个预览方块对象，`null` 表示未生成
 * @property {object | null} hold - 缓存的方块对象，`null` 表示未生成
 * @property {object | null} tSpin - T-Spin 对象: { isTSpin: boolean, isTSpinMini:
 *   boolean }，`null` 表示未生成
 * @property {number} score - 当前游戏得分
 * @property {number} lines - 当前已消除的总行数
 * @property {number} level - 当前游戏等级
 * @property {number} highScore - 历史最高得分（持久化存储）
 * @property {number} baseLines - 升级基准行数，用于计算等级提升（(level-1)×10）
 * @property {number[]} clearLines - 当前待消除的满行行号数组
 * @property {string} difficulty - 游戏难度等级：`easy` | `normal` | `hard` | `expert`
 * @property {string} mode - 游戏当前模式：
 *
 *   - `main-menu`：等级选择（主菜单）
 *   - `difficulty`：难度选择界面
 *   - `playing`：游戏中
 *   - `paused`：游戏暂停
 *   - `game-over`：游戏结束
 *   - `replay`：回放模式
 *
 * @property {boolean} gamepadConnected - 游戏手柄是否已连接
 */

/**
 * # 全局游戏状态（集中管理）
 *
 * 所有游戏数据的单一初始状态源。每次游戏重置时， `GameStore.resetState()` 会深拷贝此对象恢复初始值。
 *
 * @type {TetrisState}
 */
const GameState = {
  /** ## 当前控制者身份：human / ai */
  controller: 'human',

  /** ## 游戏初始化时的棋盘数据（用于回放） */
  beginningBoard: [],

  /** ## 游戏棋盘（20×10），存储颜色值字符串 */
  board: [],

  /** ## 当前活动方块 */
  curr: null,

  /** ## 当前方块 X 坐标（列） */
  cx: 0,

  /** ## 当前方块 Y 坐标（行） */
  cy: 0,

  /** ## 下一个预览方块 */
  next: null,

  /** ## 缓存的方块 */
  hold: null,

  tSpin: null,

  backToBack: false,

  /** ## 当前得分 */
  score: 0,

  /** ## 累计消除行数 */
  lines: 0,

  /** ## 当前等级 */
  level: 1,

  combo: 0,

  comboScore: 0,

  /** ## 历史最高分 */
  highScore: 0,

  /** ## 升级基准行数 */
  baseLines: 0,

  /** ## 升级消减行数 */
  levelUpSteps: 10,

  /** ## 当前待消除行号 */
  clearLines: [],

  /** ## 游戏难度 */
  difficulty: 'easy',

  /**
   * ## 游戏模式
   *
   * - `main-menu`：等级选择（主菜单）
   * - `playing`：游戏中
   * - `paused`：游戏暂停
   * - `game-over`：游戏结束
   */
  mode: 'main-menu',

  /** ## 手柄连接状态 */
  gamepadConnected: false,
};

export default GameState;
