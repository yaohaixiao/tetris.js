/**
 * # 创建沙箱 Game 对象
 *
 * 基于游戏状态快照，创建一个**完全隔离的模拟 Game 对象**。 这个沙箱模拟了真实 Game 的核心 Store 接口， 让 AI
 * 可以在其中自由推演，而不会污染真实游戏状态。
 *
 * ## 核心用途
 *
 * 沙箱 Game 是 AI lookahead（前瞻搜索）的基础设施。 AI 在沙箱中模拟"如果这样放方块，棋盘会变成什么样"，
 * 然后递归地继续模拟下一个方块，实现多步前瞻。
 *
 * ## 为什么需要沙箱？
 *
 * 1. **状态隔离**：沙箱内部的所有修改（`setState`）只影响沙箱自身， 不会影响真实游戏。AI 可以大胆尝试各种糟糕的走法， 真实棋盘毫发无损。
 * 2. **接口兼容**：沙箱暴露 `Store.getState()` 和 `Store.setState()`， 和真实 Game 的 Store
 *    接口一致。`generateMoves`、`simulateDrop`、 `evaluateBoard` 等函数不需要知道自己操作的是真实 Game
 *    还是沙箱。
 * 3. **深拷贝快照**：内部通过 `structuredClone` 深拷贝快照数据， 确保沙箱之间也相互隔离（每次 lookahead
 *    分支都可以创建独立沙箱）。
 *
 * ## 与 createSnapshot 的关系
 *
 *     真实 Game
 *       → createSnapshot(game)         // 提取状态快照
 *       → createSandboxGame(snapshot)  // 基于快照创建沙箱
 *       → selfPlay(sandboxGame)        // 在沙箱中推演
 *       → applyActions(realGame, best) // 将最佳动作应用到真实游戏
 *
 * ## 提供的 Store 接口
 *
 * | 方法                | 说明                                  |
 * | ------------------- | ------------------------------------- |
 * | `getState()`        | 返回沙箱内部状态的引用                |
 * | `setState(partial)` | 浅合并更新沙箱状态（`Object.assign`） |
 *
 * @example
 *   const snapshot = createSnapshot(game);
 *   const sandbox = createSandboxGame(snapshot);
 *
 *   // 在沙箱中修改状态，不影响真实游戏
 *   sandbox.Store.setState({ score: 999 });
 *   console.log(sandbox.Store.getState().score); // 999
 *   console.log(game.Store.getScore()); // 不变
 *
 * @function createSandboxGame
 * @param {object} snapshot - 游戏状态快照（由 `createSnapshot` 创建）
 * @returns {object} 沙箱 Game 对象，含 `Store` 属性
 */
const createSandboxGame = (snapshot) => ({
  /**
   * ## 沙箱 Store
   *
   * 模拟真实 Game.Store 的核心接口， 内部维护一个独立的状态副本。
   */
  Store: {
    /**
     * ## 沙箱内部状态
     *
     * 深拷贝自快照，与外部完全隔离。
     *
     * @type {object}
     */
    state: structuredClone(snapshot),

    /**
     * ## 获取当前沙箱状态
     *
     * 返回内部状态对象的引用（非深拷贝）， 调用方可以直接读取其中的 `board`、`curr`、`piece` 等字段。
     *
     * @returns {object} 当前沙箱状态
     */
    getState() {
      return this.state;
    },

    /**
     * ## 更新沙箱状态（浅合并）
     *
     * 使用 `Object.assign` 将 partial 中的字段合并到当前状态。 这是浅合并（只合并第一层），对于棋盘等嵌套对象，
     * 调用方应确保传入的是新对象，避免意外修改。
     *
     * @example
     *   sandbox.Store.setState({ score: 100, level: 2 });
     *   sandbox.Store.setState({ board: newBoard });
     *
     * @param {object} partial - 要合并的状态字段
     * @returns {void}
     */
    setState(partial) {
      Object.assign(this.state, partial);
    },
  },
});

export default createSandboxGame;
