/**
 * ============================================================
 *
 * # 对战状态数据结构
 *
 * ============================================================
 *
 * 定义对战模式中所有需要持久化的状态字段及其初始值。 这是一个纯数据对象，不包含任何业务逻辑。
 *
 * ## 数据结构
 *
 * | 字段           | 类型                   | 初始值 | 说明                                     |
 * | :------------- | :--------------------- | :----- | :--------------------------------------- |
 * | running        | boolean                | false  | 对战是否进行中                           |
 * | winner         | object \| null         | null   | 当前单局胜者 Game 实例（游戏结束时设置） |
 * | scores         | Object<string, number> | {}     | 双方胜场数，key 为 playerId              |
 * | roundId        | number                 | 0      | 当前局号，每局递增                       |
 * | pendingGarbage | Object<string, number> | {}     | 双方待处理垃圾行数，key 为 playerId      |
 *
 * ## roundId 的作用
 *
 * 垃圾行动画在初始化时记录当前 roundId， 渲染时检查 roundId 是否匹配。 如果局号已变（新一局开始），动画自动标记为
 * _finished，不会在新一局中残留绘制。
 *
 * ## playerId 格式
 *
 * {Player.name}-{Player.index}，例如：
 *
 * - Human-0（P1）
 * - Ai-1（P2）
 *
 * @constant {object} BattleState
 */
const BattleState = {
  /** 对战是否进行中 */
  running: false,

  /** 当前单局胜者 Game 实例，null 表示尚未决出 */
  winner: null,

  /** 双方胜场数，key: playerId, value: 胜场数 */
  scores: {},

  /** 当前局号，每局递增 */
  roundId: 0,

  /** 双方待处理垃圾行数，key: playerId */
  pendingGarbage: {},

  /**
   * 对战胜利分数。
   *
   * 先达到此分数的玩家获胜。按难度分级：
   *
   * | 难度   | 分数 | 说明                  |
   * | :----- | :--- | :-------------------- |
   * | easy   | 5    | 快速对局，约 1-2 分钟 |
   * | normal | 8    | 标准对局，约 2-3 分钟 |
   * | hard   | 12   | 较长对局，约 3-5 分钟 |
   * | expert | 15   | 巅峰对决，约 5+ 分钟  |
   */
  VictoryScore: {
    easy: 5,
    normal: 8,
    hard: 12,
    expert: 15,
  },
};

export default BattleState;
