/*
 * ============================================================
 * # 模块：GameState 全局游戏状态初始值
 * ============================================================
 *
 * ## 功能描述
 *
 * 集中定义所有游戏数据的初始状态对象。
 * 每次游戏重置时，`GameStore.resetState()` 会深拷贝此对象来恢复初始值，
 * 确保每次新游戏都从相同的状态开始。
 *
 * 使用独立对象而非直接修改，避免多局游戏间的状态污染。
 *
 * ## 状态结构总览
 *
 * ```
 * GameState
 *   ├── 模式选择
 *   │   ├── modeIndex    - 游戏模式选择索引（0=单人, 1=对战）
 *   │   ├── battleIndex  - 对战模式选择索引（0=人机, 1=双人）
 *   │   └── exitIndex    - 退出菜单选择索引（0=继续, 1=退出）
 *   ├── 控制者
 *   │   └── controller   - 当前控制者（'human' | 'ai'）
 *   ├── 棋盘数据
 *   │   ├── beginningBoard - 初始棋盘（回放用）
 *   │   └── board          - 当前棋盘（20×10 二维数组）
 *   ├── 方块数据
 *   │   ├── curr           - 当前活动方块
 *   │   ├── cx             - 方块 X 坐标
 *   │   ├── cy             - 方块 Y 坐标
 *   │   ├── next           - 下一个预览方块
 *   │   └── hold           - 暂存方块
 *   ├── 特殊消行
 *   │   ├── tSpin          - T-Spin 检测结果
 *   │   └── backToBack     - Back-to-Back 标记
 *   ├── 计分数据
 *   │   ├── score          - 当前得分
 *   │   ├── lines          - 累计消除行数
 *   │   ├── level          - 当前等级
 *   │   ├── combo          - 连击计数
 *   │   ├── comboScore     - 连击累计得分
 *   │   └── highScore      - 历史最高分
 *   ├── 计时数据
 *   │   ├── elapsedTime    - 游戏时长（秒）
 *   │   └── sessionTime    - 会话停留时长（秒）
 *   ├── 等级系统
 *   │   ├── baseLines      - 升级基准行数
 *   │   └── levelUpSteps   - 每级所需行数
 *   ├── 消行数据
 *   │   └── clearLines     - 待消除行号数组
 *   ├── 游戏设置
 *   │   ├── difficulty     - 游戏难度
 *   │   └── mode           - 当前游戏模式
 *   └── 外设状态
 *       └── gamepadConnected - 手柄连接状态
 * ```
 *
 * ## 初始状态说明
 *
 * ### 模式选择相关
 *
 * - `modeIndex = 0`：游戏模式选择光标初始指向单人模式
 * - `battleIndex = 0`：对战模式选择光标初始指向 HUMAN vs AI
 * - `mode = 'game-mode'`：游戏启动后首先进入游戏模式选择界面
 *
 * ### 控制者
 *
 * - `controller = 'human'`：默认由人类玩家控制，AI 模式下切换为 `'ai'`
 *
 * ### 棋盘数据
 *
 * - `beginningBoard = []`：回放模式初始棋盘为空
 * - `board = []`：游戏棋盘初始为空，`resetBoard()` 时会创建 20×10 的空棋盘
 *
 * ### 方块数据
 *
 * - `curr = null`：初始无活动方块，游戏开始后通过 `spawn()` 生成
 * - `next = null`：初始无预览方块，`setBeginningState()` 时生成
 * - `hold = null`：暂存区初始为空
 *
 * ### 特殊消行
 *
 * - `tSpin = null`：初始未触发 T-Spin
 * - `backToBack = false`：初始未触发 Back-to-Back
 *
 * ### 计分数据
 *
 * - `score = 0`：初始得分为 0
 * - `lines = 0`：初始消除行数为 0
 * - `level = 1`：初始等级为 1
 * - `combo = 0`：初始连击计数为 0
 * - `comboScore = 0`：初始连击得分为 0
 * - `highScore = 0`：初始最高分为 0，`loadHighScore()` 时从 localStorage 读取
 *
 * ### 等级系统
 *
 * - `baseLines = 0`：初始基准行数为 0
 * - `levelUpSteps = 10`：每升一级需要消除 10 行
 *
 * ### 消行数据
 *
 * - `clearLines = []`：初始无待消除行
 *
 * ### 游戏设置
 *
 * - `difficulty = 'easy'`：默认简单难度
 *
 * ### 外设状态
 *
 * - `gamepadConnected = false`：初始手柄未连接
 *
 * @typedef {object} TetrisState
 * @property {number} modeIndex - 游戏模式选择索引：0 = 单人模式, 1 = 对战模式
 * @property {number} battleIndex - 对战模式选择索引：0 = HUMAN vs AI, 1 = HUMAN vs HUMAN
 * @property {number} exitIndex - 退出游戏选择索引：0 = RESUME GAME, 1 = EXIT GAME
 * @property {string} controller - 游戏当前控制者：`'human'` | `'ai'`
 * @property {string[][]} beginningBoard - 游戏初始化时的棋盘数据，用于回放模式恢复初始状态
 * @property {string[][]} board - 游戏棋盘二维数组，存储每个格子的颜色值，空字符串表示空格
 * @property {object | null} curr - 当前正在下落的活动方块对象
 * @property {number} cx - 当前方块的 X 坐标（列索引）
 * @property {number} cy - 当前方块的 Y 坐标（行索引）
 * @property {object | null} next - 下一个预览方块对象
 * @property {object | null} hold - 暂存方块对象
 * @property {object | null} tSpin - T-Spin 检测结果对象
 * @property {boolean} backToBack - 是否触发了 Back-to-Back 连续特殊消行
 * @property {number} score - 当前游戏得分
 * @property {number} lines - 当前已消除的总行数
 * @property {number} level - 当前游戏等级（从 1 开始）
 * @property {number} combo - 连续消行连击计数
 * @property {number} comboScore - 连击累计得分
 * @property {number} highScore - 历史最高得分
 * @property {number} elapsedTime - 游戏时长（秒）
 * @property {number} sessionTime - 会话停留时长（秒）
 * @property {number} baseLines - 升级基准行数
 * @property {number} levelUpSteps - 每升一级需要消除的行数（默认 10）
 * @property {number[]} clearLines - 当前待消除的满行行号数组
 * @property {string} difficulty - 游戏难度等级：`'easy'` | `'normal'` | `'hard'` | `'expert'`
 * @property {string} mode - 游戏当前模式
 * @property {boolean} gamepadConnected - 游戏手柄是否已连接
 */

const GameState = {
  /*
   * ============================================================
   * 模式选择
   * ============================================================
   */

  /**
   * ## modeIndex：游戏模式选择索引
   *
   * 在游戏模式选择界面（game-mode）中，光标当前所在的位置。 用于上下移动选择不同的游戏模式。
   *
   * - `0`：单人模式（SINGLE）
   * - `1`：对战模式（VERSUS）
   *
   * @default 0
   * @type {number}
   */
  modeIndex: 0,

  /**
   * ## battleIndex：对战模式选择索引
   *
   * 在对战模式选择界面（battle-mode）中，光标当前所在的位置。 用于上下移动选择不同的对战类型。
   *
   * - `0`：人机对战（HUMAN vs AI）
   * - `1`：双人对战（HUMAN vs HUMAN）
   *
   * @default 0
   * @type {number}
   */
  battleIndex: 0,

  /**
   * ## exitIndex：退出游戏选择索引
   *
   * 在退出游戏菜单界面（exit-game）中，光标当前所在的位置。 用于上下移动选择不同的退出选项。
   *
   * - `0`：RESUME GAME（继续游戏）
   * - `1`：EXIT GAME（退出游戏）
   *
   * @default 0
   * @type {number}
   */
  exitIndex: 0,

  /*
   * ============================================================
   * 控制者
   * ============================================================
   */

  /**
   * ## controller：当前控制者身份
   *
   * 标识当前由谁控制游戏操作。
   *
   * - `'human'`：人类玩家操作（键盘、手柄、触屏）
   * - `'ai'`：AI 自动操作
   *
   * 可通过按 S 键（键盘）或 RB 键（手柄）切换。
   *
   * @default 'human'
   * @type {string}
   */
  controller: 'human',

  /*
   * ============================================================
   * 棋盘数据
   * ============================================================
   */

  /**
   * ## beginningBoard：游戏初始化时的棋盘数据
   *
   * 用于回放（replay）模式恢复初始状态。 在 `setBeginningState()` 时设置为初始棋盘，之后不再修改。
   *
   * @default [ ]
   * @type {string[][]}
   */
  beginningBoard: [],

  /**
   * ## board：游戏棋盘
   *
   * 20 行 × 10 列的二维数组。 每个格子的值为颜色字符串（如 `"#00c8ff"`），空字符串 `""` 表示空格。 棋盘底部为第 19
   * 行，顶部为第 0 行。
   *
   * @default [ ]
   * @type {string[][]}
   */
  board: [],

  /*
   * ============================================================
   * 方块数据
   * ============================================================
   */

  /**
   * ## curr：当前活动方块对象
   *
   * 包含方块的形状（shape）、位置（cx, cy）、颜色等信息。 `null` 表示没有活动方块（游戏未开始或方块已锁定）。
   *
   * @default null
   * @type {object | null}
   */
  curr: null,

  /**
   * ## cx：当前方块 X 坐标（列索引）
   *
   * 方块左上角在棋盘中的列位置。取值范围通常为 0-9。
   *
   * @default 0
   * @type {number}
   */
  cx: 0,

  /**
   * ## cy：当前方块 Y 坐标（行索引）
   *
   * 方块左上角在棋盘中的行位置。0 为棋盘顶部。
   *
   * @default 0
   * @type {number}
   */
  cy: 0,

  /**
   * ## next：下一个预览方块对象
   *
   * 在当前方块锁定时，`next` 方块会成为新的 `curr` 方块。 `null` 表示尚未生成。
   *
   * @default null
   * @type {object | null}
   */
  next: null,

  /**
   * ## hold：暂存（Hold）方块对象
   *
   * 玩家通过 Hold 操作将当前方块存入暂存区。 下次 Hold 操作时取出使用。 `null` 表示暂存区为空。
   *
   * @default null
   * @type {object | null}
   */
  hold: null,

  /*
   * ============================================================
   * 特殊消行
   * ============================================================
   */

  /**
   * ## tSpin：T-Spin 检测结果
   *
   * 记录最后一次操作是否触发了 T-Spin。
   *
   * - `{ isTSpin: true, isTSpinMini: false }`：标准 T-Spin
   * - `{ isTSpin: false, isTSpinMini: true }`：T-Spin Mini
   * - `null`：未触发 T-Spin
   *
   * @default null
   * @type {object | null}
   */
  tSpin: null,

  /**
   * ## backToBack：Back-to-Back 连续特殊消行标记
   *
   * 当连续两次消行都是特殊消行（T-Spin 或 Tetris）时触发。 给予额外计分奖励。
   *
   * @default false
   * @type {boolean}
   */
  backToBack: false,

  /*
   * ============================================================
   * 计分数据
   * ============================================================
   */

  /**
   * ## score：当前得分
   *
   * 每次消行后根据消除行数和当前等级计算并累加。
   *
   * @default 0
   * @type {number}
   */
  score: 0,

  /**
   * ## lines：累计消除行数
   *
   * 所有消行的行数总和，用于计算等级提升。
   *
   * @default 0
   * @type {number}
   */
  lines: 0,

  /**
   * ## level：当前等级
   *
   * 从 1 开始，最高 256 级。 等级越高方块下落越快，计分倍率也越高。
   *
   * @default 1
   * @type {number}
   */
  level: 1,

  /**
   * ## combo：连击计数
   *
   * 连续消行的次数。每次消行 combo +1，未消行则清零。 Combo 越高额外加分越多。
   *
   * @default 0
   * @type {number}
   */
  combo: 0,

  /**
   * ## comboScore：连击累计得分
   *
   * 当前连击序列中累计获得的额外加分。
   *
   * @default 0
   * @type {number}
   */
  comboScore: 0,

  /**
   * ## highScore：历史最高分
   *
   * 从 localStorage 加载，游戏结束时如果当前分数超过此值则更新。
   *
   * @default 0
   * @type {number}
   */
  highScore: 0,

  /*
   * ============================================================
   * 计时数据
   * ============================================================
   */

  /**
   * ## elapsedTime：游戏时长
   *
   * 记录当前对局的游戏时长，单位：秒。 暂停游戏时停止累加，恢复后继续。
   *
   * @default 0
   * @type {number}
   */
  elapsedTime: 0,

  /**
   * ## sessionTime：会话停留时长
   *
   * 记录玩家进入游戏后的总停留时长，单位：秒。 从游戏启动开始累加，不受暂停和重置影响。
   *
   * @default 0
   * @type {number}
   */
  sessionTime: 0,

  /*
   * ============================================================
   * 等级系统
   * ============================================================
   */

  /**
   * ## baseLines：升级基准行数
   *
   * 用于计算升级进度。 升级所需行数 = baseLines + levelUpSteps。 每次升级后 baseLines 更新为当前 lines 值。
   *
   * @default 0
   * @type {number}
   */
  baseLines: 0,

  /**
   * ## levelUpSteps：每升一级需要消除的行数
   *
   * 初始为 10 行，随等级提升逐渐增加，最高单级需消除 60 行。
   *
   * @default 10
   * @type {number}
   */
  levelUpSteps: 10,

  /*
   * ============================================================
   * 消行数据
   * ============================================================
   */

  /**
   * ## clearLines：当前待消除的满行行号数组
   *
   * 存储所有已填满需要消除的行号。 消行动画结束后清空。
   *
   * @default [ ]
   * @type {number[]}
   */
  clearLines: [],

  /*
   * ============================================================
   * 游戏设置
   * ============================================================
   */

  /**
   * ## difficulty：游戏难度
   *
   * 影响初始棋盘垃圾行数量和 AI 行为。
   *
   * - `'easy'`：简单（0 行初始垃圾）
   * - `'normal'`：普通（3 行初始垃圾）
   * - `'hard'`：困难（6 行初始垃圾）
   * - `'expert'`：专家（9 行初始垃圾）
   *
   * @default 'easy'
   * @type {string}
   */
  difficulty: 'easy',

  /**
   * ## mode：游戏模式
   *
   * 标识游戏当前所处的阶段/界面。
   *
   * - `'game-mode'`：游戏模式选择界面
   * - `'battle-mode'`：对战模式选择界面
   * - `'main-menu'`：主菜单/等级选择界面
   * - `'difficulty'`：难度选择界面
   * - `'playing'`：游戏中
   * - `'paused'`：游戏暂停
   * - `'game-over'`：游戏结束
   * - `'replay'`：游戏回放
   * - `'exit-game'`：退出菜单
   *
   * @default 'game-mode'
   * @type {string}
   */
  mode: 'game-mode',

  /*
   * ============================================================
   * 外设状态
   * ============================================================
   */

  /**
   * ## gamepadConnected：游戏手柄是否已连接
   *
   * 用于 UI 显示手柄连接状态和通知提示。
   *
   * @default false
   * @type {boolean}
   */
  gamepadConnected: false,
};

export default GameState;
