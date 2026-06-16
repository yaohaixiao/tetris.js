import placeGarbageOnBoard from '@/lib/state/utils/place-garbage-on-board.js';
import isFunction from '@/lib/utils/types/is-function.js';

/**
 * # 游戏状态存储（Game Store）
 *
 * 基于 class 的轻量级状态管理器，用于集中管理游戏运行时状态。
 *
 * ## 设计特点
 *
 * - **单一状态源**：所有游戏数据存储在 `this.state` 对象中
 * - **支持 patch 更新**：`setState` 支持对象合并和函数式更新
 * - **状态隔离**：使用 `structuredClone` 深拷贝，避免引用污染
 * - **领域方法**：提供 `getBoard`、`getScore`、`getMode` 等语义化访问方法
 *
 * ## 设计定位
 *
 * - 非 Redux / 非 Zustand
 * - 轻量级 game state container
 * - 专为 Tetris Engine 设计
 *
 * ## 状态结构
 *
 *     GameStore
 *       ├── state        ← 当前运行时状态（可读写）
 *       ├── defaults     ← 初始状态深拷贝（只读，用于 resetState）
 *       └── options      ← 棋盘尺寸配置 { cols, rows }
 *
 * ## 使用示例
 *
 * ```javascript
 * const store = new GameStore({ GameState, cols: 10, rows: 20 });
 * store.setState({ score: 100 });
 * console.log(store.getScore()); // 100
 * ```
 *
 * @class GameStore
 */
class GameStore {
  /**
   * ## 构造函数
   *
   * 初始化内部状态，使用深拷贝保证与外部状态隔离。
   *
   * @param {object} options - 配置选项
   * @param {object} options.GameState - 游戏初始状态模板对象
   * @param {number} options.cols - 棋盘列数（宽度）
   * @param {number} options.rows - 棋盘行数（高度）
   */
  constructor(options) {
    // 委托给 initialize 方法完成初始化
    this.initialize(options);
  }

  /**
   * ## 初始化 Store
   *
   * 保存默认状态（用于 resetState 恢复）和棋盘尺寸配置。 使用 `structuredClone` 深拷贝
   * GameState，确保与外部状态完全隔离。
   *
   * @param {object} options - 配置选项
   * @param {object} options.GameState - 游戏初始状态模板对象
   * @param {number} options.cols - 棋盘列数
   * @param {number} options.rows - 棋盘行数
   * @returns {void}
   */
  initialize(options) {
    // 从配置中解构出状态模板和棋盘尺寸
    const { GameState, cols, rows } = options;

    /**
     * 初始状态的深拷贝，用于 resetState 恢复。 不被运行时修改，始终保持原始值。
     *
     * @type {object}
     */
    this.defaults = structuredClone(GameState);

    /**
     * 棋盘尺寸配置，供 resetBoard、generateBoard 等方法使用。
     *
     * @type {{ cols: number; rows: number }}
     */
    this.options = { cols, rows };

    /**
     * 当前运行时状态，所有游戏数据存储在此。 通过 setState 进行 patch 更新。
     *
     * @type {object}
     */
    this.state = structuredClone(GameState);
  }

  /**
   * ## 获取完整 state
   *
   * 返回当前游戏状态对象的引用。 注意：返回的是引用，外部可直接修改（不推荐），应使用 setState 更新。
   *
   * @returns {object} 当前游戏状态对象
   */
  getState() {
    return this.state;
  }

  /**
   * ## 更新 state（支持 patch 或函数）
   *
   * 支持两种更新模式：
   *
   * 1. **对象 patch**：`setState({ score: 100 })` — 浅合并到当前 state
   * 2. **函数式更新**：`setState((prev) => ({ score: prev.score + 50 }))` — 基于前值计算新值
   *
   * ### 为什么用浅合并而不是深合并？
   *
   * State 中的嵌套对象（如 board 二维数组）通过引用共享， 浅合并足够且性能更好。需要独立副本时（如回放场景）， 使用
   * structuredClone 显式深拷贝。
   *
   * @param {object | Function} patch - 状态更新内容或函数
   *
   *   - 对象：直接浅合并到当前 state
   *   - 函数：接收当前 state 作为参数，返回 patch 对象
   *
   * @returns {void}
   */
  setState(patch) {
    this.state = {
      ...this.state,
      ...(isFunction(patch) ? patch(this.state) : patch),
    };
  }

  /**
   * ## 重置状态为初始值
   *
   * 使用 `structuredClone` 深拷贝 defaults，确保与原默认状态完全隔离。 通常在游戏重新开始或模式切换时调用。
   *
   * @returns {void}
   */
  resetState() {
    this.state = structuredClone(this.defaults);
  }

  /**
   * ## 获取当前棋盘
   *
   * @returns {string[][]} 棋盘二维数组，每个元素为颜色值或 0（空格）
   */
  getBoard() {
    return this.state.board;
  }

  /**
   * ## 重置棋盘
   *
   * 根据 options 中配置的 rows 和 cols 生成全空棋盘。 所有格子初始值为 0（空格）。
   *
   * @returns {void}
   */
  resetBoard() {
    // 从配置中获取棋盘尺寸
    const { cols, rows } = this.options;

    // 生成 rows × cols 的全 0 二维数组
    this.state.board = Array.from({ length: rows }, () =>
      Array.from({ length: cols }).fill(0),
    );
  }

  /**
   * ## 生成游戏初始化的 board 数据
   *
   * 根据当前难度（difficulty）在棋盘底部生成对应数量的垃圾行。 难度越高，初始垃圾行越多，游戏难度越大。
   *
   * ### 难度与垃圾行映射
   *
   * | 难度   | 垃圾行数 | 说明                    |
   * | ------ | -------- | ----------------------- |
   * | easy   | 0        | 空棋盘，适合新手        |
   * | normal | 3        | 底部 3 行垃圾，中等挑战 |
   * | hard   | 6        | 底部 6 行垃圾，较难     |
   * | expert | 9        | 底部 9 行垃圾，极限挑战 |
   * | 其他   | 0        | 未知难度默认为 0        |
   *
   * ### 为什么在 generateBoard 中处理？
   *
   * 垃圾行生成需要知道棋盘尺寸（cols），而 cols 存储在 this.options 中。 将生成逻辑放在 Store
   * 方法中，避免外部调用时需要额外传递 cols 参数。
   *
   * @returns {string[][]} 生成的棋盘数据（含垃圾行）
   */
  generateBoard() {
    /** 难度 → 垃圾行数映射表 不在外部定义常量，因为这个映射只在本方法中使用。 */
    const DIFFICULTY_GARBAGE_ROWS = {
      easy: 0,
      normal: 3,
      hard: 6,
      expert: 9,
    };

    // 从实例中获取棋盘配置和当前状态
    const { options, state } = this;
    const { board, difficulty } = state;

    // 根据难度获取垃圾行数，未知难度默认 0
    const garbageRows = DIFFICULTY_GARBAGE_ROWS[difficulty] || 0;

    /**
     * 在棋盘底部放置垃圾行：
     *
     * - Board：当前棋盘（会被原地修改）
     * - GarbageRows：垃圾行数量
     * - Options.cols：棋盘宽度（用于生成正确的行数据）
     */
    placeGarbageOnBoard(board, garbageRows, options.cols);

    return board;
  }

  /**
   * ## 设置初始棋盘（深拷贝）
   *
   * 保存游戏开始时的棋盘状态，供回放系统使用。 使用 `structuredClone` 确保与运行时棋盘完全隔离。
   *
   * @param {string[][]} board - 游戏棋盘数据
   * @returns {void}
   */
  setBeginningBoard(board) {
    this.state.beginningBoard = structuredClone(board);
  }

  /**
   * ## 获取初始棋盘（深拷贝副本）
   *
   * 返回游戏开始时保存的棋盘数据的深拷贝。 回放系统通过此方法获取初始棋盘进行恢复。
   *
   * @returns {string[][]} 初始棋盘数据的深拷贝
   */
  getBeginningBoard() {
    return structuredClone(this.state.beginningBoard);
  }

  /**
   * ## 获取当前控制者身份
   *
   * @returns {string} 控制者身份：`human` 或 `ai`
   */
  getController() {
    return this.state.controller;
  }

  /**
   * ## 设置当前控制者身份
   *
   * 切换玩家控制 ↔ AI 控制时调用。
   *
   * @param {string} controller - 控制者身份：`human` 或 `ai`
   * @returns {void}
   */
  setController(controller) {
    this.state.controller = controller;
  }

  /**
   * ## 设置游戏手柄连接状态
   *
   * @param {boolean} connected - 游戏手柄是否已连接
   * @returns {void}
   */
  setGamepadConnected(connected) {
    this.state.gamepadConnected = connected;
  }

  /**
   * ## 获取手柄连接状态
   *
   * @returns {boolean} 已连接返回 true，否则返回 false
   */
  isGamepadConnected() {
    return this.state.gamepadConnected;
  }

  /**
   * ## 获取游戏难度等级
   *
   * @returns {string} 难度等级：easy / normal / hard / expert
   */
  getDifficulty() {
    return this.state.difficulty;
  }

  /**
   * ## 设置游戏难度等级
   *
   * 难度影响初始棋盘垃圾行数、AI 行为等。
   *
   * @param {string} [difficulty='easy'] - 难度等级（easy / normal / hard /
   *   expert）。默认值为 `'easy'`. Default is `'easy'`
   * @returns {void}
   */
  setDifficulty(difficulty = 'easy') {
    this.state.difficulty = difficulty;
  }

  /**
   * ## 获取基准行数
   *
   * 基准行数用于计算等级提升： `totalLines = baseLines + lines` 然后通过
   * `calculateLevel(totalLines, maxLevel)` 计算当前等级。
   *
   * @returns {number} 基准行数
   */
  getBaseLines() {
    return this.state.baseLines;
  }

  /**
   * ## 设置基准行数
   *
   * 在 selectLevel 时重置为 0，确保等级计算从当前选择开始。
   *
   * @param {number} lines - 基准行数值
   * @returns {void}
   */
  setBaseLines(lines) {
    this.state.baseLines = lines;
  }

  /**
   * ## 获取当前待消除的行号数组
   *
   * @returns {number[]} 待消除的行号
   */
  getClearLines() {
    return this.state.clearLines;
  }

  /**
   * ## 设置当前待消除的行号
   *
   * 在消行检测阶段写入，消行动画阶段读取。
   *
   * @param {number[]} lines - 消除行号数组（从底部到顶部排序）
   * @returns {void}
   */
  setClearLines(lines) {
    this.state.clearLines = lines;
  }

  /**
   * ## 获取 HUD 数据
   *
   * 返回 UI 渲染所需的核心显示数据。 从 state 中提取 score、lines、level、combo、comboScore 等字段。
   *
   * @returns {object} HUD 数据对象
   */
  getHub() {
    const { source, lines, level, combo, comboScore } = this.state;
    return { source, lines, level, combo, comboScore };
  }

  /**
   * ## 设置 HUD 数据
   *
   * 批量更新 HUD 相关的多个状态字段。
   *
   * @param {object} hud - HUD 数据对象
   * @param {number} hud.score - 当前得分
   * @param {number} hud.lines - 累计消除行数
   * @param {number} hud.level - 当前等级
   * @param {number} hud.combo - 当前连击次数
   * @param {number} hud.comboScore - 连击额外加分
   * @returns {void}
   */
  setHud(hud) {
    const { score, lines, level, combo, comboScore } = hud;
    this.state.score = score;
    this.state.lines = lines;
    this.state.level = level;
    this.state.combo = combo;
    this.state.comboScore = comboScore;
  }

  /**
   * ## 获取当前分数
   *
   * @returns {number} 当前得分
   */
  getScore() {
    return this.state.score;
  }

  /**
   * ## 设置最高分
   *
   * @param {number} highScore - 历史最高分
   * @returns {void}
   */
  setHighScore(highScore) {
    this.state.highScore = highScore;
  }

  /**
   * ## 获取最高分
   *
   * @returns {number} 历史最高分
   */
  getHighScore() {
    return this.state.highScore;
  }

  /**
   * ## 获取当前等级
   *
   * @returns {number} 游戏等级（1-256）
   */
  getLevel() {
    return this.state.level;
  }

  /**
   * ## 设置当前等级
   *
   * @param {number} level - 游戏等级值
   * @returns {void}
   */
  setLevel(level) {
    this.state.level = level;
  }

  /**
   * ## 获取游戏模式
   *
   * @returns {string} 当前模式：
   *
   *   - `main-menu`：主菜单
   *   - `difficulty`：难度选择
   *   - `playing`：游戏中
   *   - `paused`：暂停
   *   - `game-over`：游戏结束
   *   - `replay`：回放
   */
  getMode() {
    return this.state.mode;
  }

  /**
   * ## 设置游戏模式
   *
   * @param {string} mode - 游戏模式
   * @returns {void}
   */
  setMode(mode) {
    this.state.mode = mode;
  }
}

export default GameStore;
