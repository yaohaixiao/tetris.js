/**
 * # 对战状态数据结构
 *
 * 定义对战模式中所有需要持久化的状态字段及其初始值。 这是一个纯数据对象，不包含任何业务逻辑，方便序列化、克隆和测试。
 *
 * ## 数据结构
 *
 * | 字段           | 类型                   | 初始值 | 说明                                     |
 * | -------------- | ---------------------- | ------ | ---------------------------------------- |
 * | running        | boolean                | false  | 对战是否进行中                           |
 * | winner         | object \| null         | null   | 当前单局胜者 Game 实例（游戏结束时设置） |
 * | scores         | Object<string, number> | {}     | 双方胜场数，key 为 playerId              |
 * | pendingGarbage | Object<string, number> | {}     | 双方待处理垃圾行数，key 为 playerId      |
 *
 * ## 使用方式
 *
 * BattleStore 在初始化时通过 `structuredClone(BattleState)` 深拷贝一份， 后续所有状态修改都通过
 * BattleStore 的方法进行，不直接操作此对象。
 *
 * ## playerId 格式
 *
 * `{Player.name}-{Player.index}`，例如：
 *
 * - `human-0`（P1）
 * - `ai-1`（P2）
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

  /**
   * 双方待处理垃圾行数 key: playerId（将要接收垃圾行的玩家） value: 累积的垃圾行数量
   *
   * 注意：pendingGarbage[playerId] 表示该玩家尚未处理的垃圾行， 在当前消行时可以被攻击力抵消。
   */
  pendingGarbage: {},
};

export default BattleState;
