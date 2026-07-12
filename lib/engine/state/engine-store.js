import EngineState from '@/lib/engine/state/engine-state.js';
import extend from '@/lib/utils/oop/extend.js';

/**
 * ============================================================
 *
 * # 模块：EngineStore 引擎全局状态管理器
 *
 * ============================================================
 *
 * 管理游戏引擎层面的全局配置状态，包括游戏模式、玩家列表、对战目标分数、方块渲染风格等。 支持运行时动态修改配置并重新渲染界面。
 *
 * ## 核心职责
 *
 * | 职责     | 说明                                          |
 * | :------- | :-------------------------------------------- |
 * | 状态存储 | 持有引擎级别的全局配置状态                    |
 * | 模式管理 | 读取和切换游戏模式（single / versus）         |
 * | 对战配置 | 管理 VictoryScore（按难度分级的对战目标分数） |
 * | 方块配置 | 管理方块的渲染风格（style）和图案（pattern）  |
 * | 玩家管理 | 管理玩家列表（Players）                       |
 *
 * ## 与 EngineState 的关系
 *
 * EngineState（默认配置模板，静态定义） ↓ extend + structuredClone
 * EngineStore.state（运行时状态，独立副本）
 *
 * EngineStore 将静态 EngineState "激活"为可变状态：
 *
 * 1. 深拷贝隔离：每次初始化都用 structuredClone 创建独立副本
 * 2. 运行时可变：通过 setter 方法修改状态
 * 3. 可重置：reset() 一键恢复默认配置
 *
 * @class EngineStore
 */
class EngineStore {
  /**
   * ## 构造函数
   *
   * 接收可选的配置覆盖项，与默认 EngineState 合并后深拷贝存储。
   *
   * @param {object} [options={}] - 配置覆盖项. Default is `{}`
   */
  constructor(options = {}) {
    this.initialize(options);
  }

  /**
   * ## initialize：初始化状态
   *
   * 将传入的配置与默认 EngineState 合并后深拷贝， 确保每次创建 EngineStore 都拥有独立的状态副本。
   *
   * @param {object} [options={}] - 配置覆盖项. Default is `{}`
   * @returns {void}
   */
  initialize(options) {
    // 合并默认配置和传入配置
    const normalizedOptions = extend(EngineState, options);

    // 深拷贝合并后的配置，保证状态独立性
    this.state = structuredClone(normalizedOptions);
  }

  /**
   * ## getState：获取完整状态对象
   *
   * 注意：返回的是 this.state 的直接引用， 修改返回值会影响内部状态。 如需修改，建议使用对应的 setter 方法。
   *
   * @returns {object} 完整的引擎状态对象
   */
  getState() {
    return this.state;
  }

  /**
   * ## isVersus：判断是否为对战模式
   *
   * @returns {boolean} True 表示对战模式
   */
  isVersus() {
    return this.state.Mode === 'versus';
  }

  /**
   * ## getMode：获取当前游戏模式
   *
   * 返回值为 null 时表示玩家尚未选择模式。
   *
   * @returns {string | null} 游戏模式：'single' / 'versus' / null
   */
  getMode() {
    return this.state.Mode;
  }

  /**
   * ## setMode：设置游戏模式
   *
   * 切换 single ↔ versus 模式，或设置为 null 回到模式选择状态。
   *
   * @param {string | null} mode - 游戏模式
   * @returns {void}
   */
  setMode(mode) {
    this.state.Mode = mode;
  }

  /**
   * ## getBlockStyle：获取方块渲染风格
   *
   * @returns {string} 渲染风格标识
   */
  getBlockStyle() {
    return this.state.Block.style;
  }

  /**
   * ## setBlockStyle：设置方块渲染风格
   *
   * @param {string} style - 渲染风格
   * @returns {void}
   */
  setBlockStyle(style) {
    this.state.Block.style = style;
  }

  /**
   * ## getBlockPattern：获取方块图案
   *
   * @returns {string} 方块图案标识
   */
  getBlockPattern() {
    return this.state.Block.pattern;
  }

  /**
   * ## setBlockPattern：设置方块图案
   *
   * @param {string} pattern - 方块图案
   * @returns {void}
   */
  setBlockPattern(pattern) {
    this.state.Block.pattern = pattern;
  }

  /**
   * ## setPlayers：设置玩家列表
   *
   * | 模式      | Players 值         | 说明           |
   * | :-------- | :----------------- | :------------- |
   * | 模式选择  | []                 | 未选择任何模式 |
   * | 单人模式  | ['human']          | 单人游戏       |
   * | 对战-人机 | ['human', 'ai']    | 玩家 VS AI     |
   * | 对战-双人 | ['human', 'human'] | 双人对战       |
   *
   * @param {string[]} players - 玩家名称数组
   * @returns {void}
   */
  setPlayers(players) {
    this.state.Players = players;
  }

  /**
   * ## reset：重置状态
   *
   * 将当前状态完全重置为 EngineState 中定义的默认配置。
   *
   * @returns {void}
   */
  reset() {
    this.state = structuredClone(EngineState);
  }
}

export default EngineStore;
