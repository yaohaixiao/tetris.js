import EngineState from '@/lib/engine/state/engine-state.js';
import extend from '@/lib/utils/oop/extend.js';

/**
 * # EngineStore（引擎全局状态管理器）
 *
 * 管理游戏引擎层面的全局配置状态，包括游戏模式、玩家列表、对战目标分数、方块渲染风格等。 替代原来的静态 Configuration
 * 对象，支持运行时动态修改配置并重新渲染界面。
 *
 * ## 核心职责
 *
 * | 职责         | 说明                                         |
 * | ------------ | -------------------------------------------- |
 * | **状态存储** | 持有引擎级别的全局配置状态                   |
 * | **模式管理** | 读取和切换游戏模式（single / versus）        |
 * | **对战配置** | 管理 victoryScore（对战目标分数）            |
 * | **方块配置** | 管理方块的渲染风格（style）和图案（pattern） |
 * | **玩家管理** | 管理玩家列表（Players）                      |
 *
 * ## 与 EngineState 的关系
 *
 *     EngineState（默认配置模板）
 *       ↓ extend + structuredClone
 *     EngineStore.state（运行时状态）
 *       ↓ 通过 getter/setter 读写
 *     EngineStore.getMode() / setMode() / getBlockStyle() ...
 *
 * ## 模式选择集成
 *
 * 当 Mode 为 null 时，表示处于模式选择界面状态：
 *
 * - 此时 Players 通常为空数组
 * - 不创建任何 Game 实例
 * - Scene Manager 负责渲染模式选择 Canvas 画面
 *
 * @class EngineStore
 */
class EngineStore {
  /**
   * ## 构造函数
   *
   * 接收可选的配置覆盖项，与默认 EngineState 合并后深拷贝存储。
   *
   * @example
   *   // 创建默认配置的 Store
   *   const store = new EngineStore();
   *
   *   // 创建自定义配置的 Store
   *   const store = new EngineStore({
   *     Mode: 'versus',
   *     Players: ['human', 'ai'],
   *     victoryScore: 10,
   *   });
   *
   * @param {object} [options={}] - 配置覆盖项. Default is `{}`
   * @param {string | null} [options.Mode] - 游戏模式（"single" | "versus" | null）
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
   * @example
   *   // 重新初始化 Store，重置为默认配置 + 自定义覆盖
   *   store.initialize({ Mode: 'versus' });
   *
   * @param {object} [options={}] - 配置覆盖项. Default is `{}`
   * @returns {void}
   */
  initialize(options) {
    // 合并默认配置和传入配置
    // extend 将 options 的属性合并到 EngineState 的副本上
    const normalizedOptions = extend(EngineState, options);

    // 深拷贝合并后的配置，保证状态独立性
    // 使用 structuredClone 替代 JSON.parse(JSON.stringify())，性能更好且支持更多类型
    this.state = structuredClone(normalizedOptions);
  }

  /**
   * ## 获取完整状态对象
   *
   * 返回当前存储的完整配置状态。 注意：返回的是 state 的直接引用，修改返回值会影响内部状态。 如需修改，请使用对应的 setter 方法。
   *
   * @example
   *   const state = store.getState();
   *   console.log(state.Mode); // 'single' | 'versus' | null
   *   console.log(state.Players); // ['human', 'ai']
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
   * @example
   *   if (store.isVersus()) {
   *     // 创建对战模式需要的资源（2个 Game + BattleController）
   *   }
   *
   * @returns {boolean} True 表示对战模式，false 表示单人模式或未选择
   */
  isVersus() {
    return this.state.Mode === 'versus';
  }

  /**
   * ## 获取当前游戏模式
   *
   * @example
   *   const mode = store.getMode();
   *   if (mode === null) {
   *     // 显示模式选择界面
   *   } else if (mode === 'single') {
   *     // 单人模式逻辑
   *   } else {
   *     // 对战模式逻辑
   *   }
   *
   * @returns {string | null} 游戏模式：
   *
   *   - 'single'：单人模式
   *   - 'versus'：对战模式
   *   - Null：未选择（模式选择界面）
   */
  getMode() {
    return this.state.Mode;
  }

  /**
   * ## 设置游戏模式
   *
   * 切换 single ↔ versus 模式，或设置为 null 回到模式选择状态。
   *
   * @example
   *   // 切换到对战模式
   *   store.setMode('versus');
   *
   *   // 回到模式选择界面
   *   store.setMode(null);
   *
   * @param {string | null} mode - 游戏模式：
   *
   *   - 'single'：单人模式
   *   - 'versus'：对战模式
   *   - Null：模式选择状态
   *
   * @returns {void}
   */
  setMode(mode) {
    this.state.Mode = mode;
  }

  /**
   * ## 获取对战目标分数
   *
   * 对战模式下，先达到此分数的玩家赢得整场对战。
   *
   * @example
   *   const score = store.getVictoryScore(); // 15
   *
   * @returns {number} 目标分数（默认 15）
   */
  getVictoryScore() {
    return this.state.victoryScore;
  }

  /**
   * ## 设置对战目标分数
   *
   * 修改对战模式下获胜所需的目标分数。
   *
   * @example
   *   // 改为先得 10 分获胜
   *   store.setVictoryScore(10);
   *
   * @param {number} score - 目标分数（建议正整数）
   * @returns {void}
   */
  setVictoryScore(score) {
    this.state.victoryScore = score;
  }

  /**
   * ## 获取方块渲染风格
   *
   * 获取当前配置的方块渲染风格，影响游戏中所有方块的视觉样式。
   *
   * @example
   *   const style = store.getBlockStyle(); // 'glossy'
   *
   * @returns {string} 渲染风格，可选值：
   *
   *   - 'classic'：经典纯色
   *   - 'frosted'：毛玻璃质感
   *   - 'glass'：光面玻璃质感
   *   - 'glossy'：高光质感（默认）
   *   - 'gradient'：垂直渐变
   *   - 'inset'：内嵌风格
   *   - 'pixel'：像素风格
   *   - 'shaded'：立体阴影
   */
  getBlockStyle() {
    return this.state.Block.style;
  }

  /**
   * ## 设置方块渲染风格
   *
   * 修改方块的渲染风格，调用后需要重新渲染画面才能生效。
   *
   * @example
   *   // 切换到像素风格
   *   store.setBlockStyle('pixel');
   *   // 重新渲染会应用新风格
   *
   * @param {string} style - 渲染风格，必须是有效值之一
   * @returns {void}
   */
  setBlockStyle(style) {
    this.state.Block.style = style;
  }

  /**
   * ## 获取方块图案
   *
   * 获取当前配置的方块图案，影响方块表面的纹理样式。
   *
   * @example
   *   const pattern = store.getBlockPattern(); // 'tee'
   *
   * @returns {string} 方块图案，可选值：
   *
   *   - 'square'：方形（默认）
   *   - 'jay'：J 型纹理
   *   - 'ell'：L 型纹理
   *   - 'tee'：T 型纹理
   */
  getBlockPattern() {
    return this.state.Block.pattern;
  }

  /**
   * ## 设置方块图案
   *
   * 修改方块的图案样式，调用后需要重新渲染画面才能生效。
   *
   * @example
   *   // 切换到 J 型纹理
   *   store.setBlockPattern('jay');
   *
   * @param {string} pattern - 方块图案，必须是有效值之一
   * @returns {void}
   */
  setBlockPattern(pattern) {
    this.state.Block.pattern = pattern;
  }

  /**
   * ## 设置玩家列表
   *
   * 配置当前游戏模式的玩家列表。
   *
   * ### 不同模式下的 Players 配置
   *
   * | 模式      | Players 值           | 说明           |
   * | --------- | -------------------- | -------------- |
   * | 模式选择  | `[]`                 | 未选择任何模式 |
   * | 单人模式  | `['human']`          | 单人游戏       |
   * | 对战-人机 | `['human', 'ai']`    | 玩家 VS AI     |
   * | 对战-双人 | `['human', 'human']` | 双人对战       |
   *
   * @example
   *   // 单人模式
   *   store.setPlayers(['human']);
   *
   *   // 人机对战
   *   store.setPlayers(['human', 'ai']);
   *
   *   // 双人对战
   *   store.setPlayers(['human', 'human']);
   *
   * @param {string[]} players - 玩家名称数组
   * @returns {void}
   */
  setPlayers(players) {
    this.state.Players = players;
  }

  /**
   * ## 重置状态
   *
   * 将当前状态重置为 EngineState 的默认配置。 使用 structuredClone 深拷贝，确保与默认配置完全一致且独立。
   *
   * ### 重置后的状态
   *
   * | 属性          | 重置值       |
   * | ------------- | ------------ |
   * | Mode          | null         |
   * | Players       | []           |
   * | victoryScore  | 15           |
   * | Block.style   | 'glossy'     |
   * | Block.pattern | 'tee'        |
   * | Elements      | 全部恢复默认 |
   *
   * @example
   *   // 返回模式选择界面时重置状态
   *   store.reset();
   *   console.log(store.getMode()); // null
   *   console.log(store.getState().Players); // []
   *
   * @returns {void}
   */
  reset() {
    this.state = structuredClone(EngineState);
  }
}

export default EngineStore;
