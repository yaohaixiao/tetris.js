import EngineState from '@/lib/engine/state/engine-state.js';
import extend from '@/lib/utils/oop/extend.js';

/**
 * # EngineStore（引擎全局状态管理器）
 *
 * 管理游戏引擎层面的全局配置状态，包括游戏模式、玩家列表、 对战目标分数、方块渲染风格等。替代原来的静态 Configuration 对象，
 * 支持运行时动态修改配置并重新渲染界面。
 *
 * ## 核心职责
 *
 * | 职责         | 说明                                         |
 * | ------------ | -------------------------------------------- |
 * | **状态存储** | 持有引擎级别的全局配置状态                   |
 * | **模式管理** | 读取和切换游戏模式（single / versus）        |
 * | **对战配置** | 管理 victoryScore（对战目标分数）            |
 * | **方块配置** | 管理方块的渲染风格（style）和图案（pattern） |
 *
 * ## 与 EngineState 的关系
 *
 *     EngineState（默认配置模板）
 *       ↓ extend + structuredClone
 *     EngineStore.state（运行时状态）
 *       ↓ 通过 getter/setter 读写
 *     EngineStore.getMode() / setMode() / getBlockStyle() ...
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
   * @param {string} [options.Mode] - 游戏模式（"single" | "versus"）
   * @param {string[]} [options.Players] - 玩家名称数组
   * @param {number} [options.victoryScore] - 对战目标分数
   * @param {object} [options.Block] - 方块渲染配置
   * @param {string} [options.Block.style] - 方块渲染风格
   * @param {string} [options.Block.pattern] - 方块图案
   */
  constructor(options = {}) {
    // 立即初始化状态
    this.initialize(options);
  }

  /**
   * ## 初始化状态
   *
   * 将传入的配置与默认 EngineState 合并，然后通过 structuredClone 深拷贝， 确保每次创建 EngineStore
   * 都拥有独立的状态副本。
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
   * ## 获取完整状态对象
   *
   * 返回当前存储的完整配置状态。
   *
   * @returns {object} 完整的引擎状态对象
   */
  getState() {
    return this.state;
  }

  /**
   * ## 判断是否为对战模式
   *
   * 检查当前游戏模式是否为 "versus"。
   *
   * @returns {boolean} True 表示对战模式
   */
  isVersus() {
    return this.state.Mode === 'versus';
  }

  /**
   * ## 获取当前游戏模式
   *
   * @returns {string} 游戏模式（"single" | "versus"）
   */
  getMode() {
    return this.state.Mode;
  }

  /**
   * ## 设置游戏模式
   *
   * 切换 single ↔ versus 模式。
   *
   * @param {string} mode - 游戏模式（"single" | "versus"）
   * @returns {void}
   */
  setMode(mode) {
    this.state.Mode = mode;
  }

  /**
   * ## 获取对战目标分数
   *
   * @returns {number} 先达到此分数者赢得整场对战
   */
  getVictoryScore() {
    return this.state.victoryScore;
  }

  /**
   * ## 设置对战目标分数
   *
   * @param {number} score - 目标分数
   * @returns {void}
   */
  setVictoryScore(score) {
    this.state.victoryScore = score;
  }

  /**
   * ## 获取方块渲染风格
   *
   * @returns {string} 渲染风格（classic / frosted / glass / gradient / inset / pixel
   *   / shaded）
   */
  getBlockStyle() {
    return this.state.Block.style;
  }

  /**
   * ## 设置方块渲染风格
   *
   * @param {string} style - 渲染风格
   * @returns {void}
   */
  setBlockStyle(style) {
    this.state.Block.style = style;
  }

  /**
   * ## 获取方块图案
   *
   * @returns {string} 方块图案（square / jay / ell / tee）
   */
  getBlockPattern() {
    return this.state.Block.pattern;
  }

  /**
   * ## 设置方块图案
   *
   * @param {string} pattern - 方块图案
   * @returns {void}
   */
  setBlockPattern(pattern) {
    this.state.Block.pattern = pattern;
  }

  /**
   * ## 设置玩家列表
   *
   * @param {string[]} players - 玩家名称数组
   * @returns {void}
   */
  setPlayers(players) {
    this.state.Players = players;
  }

  reset() {
    this.state = structuredClone(EngineState);
  }
}

export default EngineStore;
