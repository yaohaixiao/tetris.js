/**
 * ============================================================
 *
 * # 创建沙箱 Game 对象
 *
 * ============================================================
 *
 * 基于游戏状态快照，创建一个完全隔离的模拟 Game 对象。 这个沙箱模拟了真实 Game 的核心 Store 接口， 让 AI
 * 可以在其中自由推演，而不会污染真实游戏状态。
 *
 * ## 核心用途
 *
 * 沙箱 Game 是 AI lookahead（前瞻搜索）的基础设施。 AI 在沙箱中模拟"如果这样放方块，棋盘会变成什么样"，
 * 然后递归地继续模拟下一个方块，实现多步前瞻。
 *
 * ## 为什么需要沙箱？
 *
 * 1. 状态隔离：沙箱内部的所有修改只影响沙箱自身
 * 2. 接口兼容：沙箱暴露 Store.getState() 和 Store.setState()， 和真实 Game 的 Store 接口一致
 * 3. 深拷贝快照：内部通过 structuredClone 深拷贝快照数据， 确保沙箱之间也相互隔离
 *
 * ## 提供的 Store 接口
 *
 * | 方法              | 说明                                |
 * | :---------------- | :---------------------------------- |
 * | getState()        | 返回沙箱内部状态的引用              |
 * | setState(partial) | 浅合并更新沙箱状态（Object.assign） |
 *
 * @function createSandboxGame
 * @param {object} snapshot - 游戏状态快照
 * @returns {object} 沙箱 Game 对象，含 Store 属性
 */
const createSandboxGame = (snapshot) => ({
  Store: {
    /**
     * 沙箱内部状态，深拷贝自快照，与外部完全隔离。
     *
     * @type {object}
     */
    state: structuredClone(snapshot),

    /**
     * 获取当前沙箱状态。
     *
     * @returns {object} 当前沙箱状态
     */
    getState() {
      return this.state;
    },

    /**
     * 更新沙箱状态（浅合并）。
     *
     * 使用 Object.assign 将 partial 中的字段合并到当前状态。 对于棋盘等嵌套对象，调用方应确保传入的是新对象。
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
