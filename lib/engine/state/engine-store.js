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
 * | 职责         | 说明                                          |
 * | ------------ | --------------------------------------------- |
 * | **状态存储** | 持有引擎级别的全局配置状态                    |
 * | **模式管理** | 读取和切换游戏模式（single / versus）         |
 * | **对战配置** | 管理 VictoryScore（按难度分级的对战目标分数） |
 * | **方块配置** | 管理方块的渲染风格（style）和图案（pattern）  |
 * | **玩家管理** | 管理玩家列表（Players）                       |
 *
 * ## 与 EngineState 的关系
 *
 *     EngineState（默认配置模板，静态定义）
 *       ↓ extend + structuredClone
 *     EngineStore.state（运行时状态，独立副本）
 *       ↓ 通过 getter/setter 读写
 *     EngineStore.getMode() / setMode() / getBlockStyle() ...
 *
 * ### 为什么需要 EngineStore？
 *
 * EngineState 是一个静态常量对象，无法在运行时修改。EngineStore 将它"激活"为可变状态：
 *
 * 1. **深拷贝隔离**：每次初始化都用 structuredClone 创建独立副本
 * 2. **运行时可变**：通过 setter 方法修改状态，支持动态切换模式/风格
 * 3. **可重置**：reset() 一键恢复默认配置
 *
 * ## 模式选择集成
 *
 * 当 Mode 为 null 时，表示处于模式选择界面状态：
 *
 * - Players 通常为空数组 `[]`
 * - 不创建任何 Game 实例
 * - Scene Manager 负责渲染模式选择 Canvas 画面
 *
 * ## 使用示例
 *
 * ```js
 * // 创建默认配置的 Store
 * const store = new EngineStore();
 *
 * // 创建自定义配置的 Store（如对战模式）
 * const store = new EngineStore({
 *   Mode: 'versus',
 *   Players: ['human', 'ai'],
 * });
 *
 * // 获取对战目标分数
 * const score = store.getVictoryScore('expert'); // 15
 *
 * // 运行时切换方块风格
 * store.setBlockStyle('pixel');
 * ```
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
   *   // 创建默认配置的 Store（单人模式，glossy 风格）
   *   const store = new EngineStore();
   *
   *   // 创建自定义配置的 Store（对战模式）
   *   const store = new EngineStore({
   *     Mode: 'versus',
   *     Players: ['human', 'ai'],
   *   });
   *
   * @param {object} [options={}] - 配置覆盖项，会与 EngineState 合并。默认值 `{}`. Default is
   *   `{}`
   */
  constructor(options = {}) {
    // 立即初始化状态，将传入配置与默认配置合并
    this.initialize(options);
  }

  /**
   * ## 初始化状态
   *
   * 将传入的配置与默认 EngineState 合并，然后通过 `structuredClone` 深拷贝， 确保每次创建 EngineStore
   * 都拥有独立的状态副本，不会相互影响。
   *
   * ### 初始化流程
   *
   *     EngineState（默认值）
   *       + options（用户覆盖值）
   *       → extend() 合并
   *       → structuredClone() 深拷贝
   *       → this.state（独立副本）
   *
   * @example
   *   // 重新初始化 Store，重置为默认配置 + 自定义覆盖
   *   store.initialize({ Mode: 'versus' });
   *
   * @param {object} [options={}] - 配置覆盖项，会与 EngineState 合并。默认值 `{}`. Default is
   *   `{}`
   * @returns {void}
   */
  initialize(options) {
    /*
     * ===== 合并默认配置和传入配置 =====
     *
     * extend() 将 options 的属性合并到 EngineState 的副本上
     * 传入的 options 优先级高于 EngineState 的默认值
     */
    const normalizedOptions = extend(EngineState, options);

    /*
     * ===== 深拷贝合并后的配置，保证状态独立性  =====
     *
     * structuredClone 比 JSON.parse(JSON.stringify()) 性能更好，
     * 且支持 undefined、Date、RegExp 等更多类型
     */
    this.state = structuredClone(normalizedOptions);
  }

  /**
   * ## 获取完整状态对象
   *
   * 返回当前存储的完整配置状态。
   *
   * ⚠️ **注意**：返回的是 `this.state` 的直接引用，修改返回值**会**影响内部状态。 如需修改，建议使用对应的 setter
   * 方法（如 `setMode()`、`setBlockStyle()`）， 以保持状态变更的可追踪性。
   *
   * @example
   *   const state = store.getState();
   *   console.log(state.Mode); // 'single' | 'versus' | null
   *   console.log(state.Players); // ['human', 'ai']
   *   console.log(state.Block.style); // 'glossy'
   *
   * @returns {object} 完整的引擎状态对象
   */
  getState() {
    return this.state;
  }

  /**
   * ## 判断是否为对战模式
   *
   * 检查当前游戏模式是否为 `'versus'`（对战模式）。 常用于条件分支，决定是否创建 BattleController 等对战专属资源。
   *
   * @example
   *   if (store.isVersus()) {
   *   // 创建对战模式需要的资源（2 个 Game + BattleController）
   *   this.battleController = new BattleController(...);
   *   }
   *
   * @returns {boolean} `true` 表示对战模式，`false` 表示单人模式或未选择模式
   */
  isVersus() {
    return this.state.Mode === 'versus';
  }

  /**
   * ## 获取当前游戏模式
   *
   * 返回值为 `null` 时表示玩家尚未选择模式（处于模式选择界面）。
   *
   * @example
   *   const mode = store.getMode();
   *   if (mode === null) {
   *     // 显示模式选择界面
   *   } else if (mode === 'single') {
   *     // 初始化单人模式
   *   } else {
   *     // 初始化对战模式
   *   }
   *
   * @returns {string | null} 游戏模式：
   *
   *   - `'single'`：单人模式
   *   - `'versus'`：对战模式
   *   - `null`：未选择（模式选择界面）
   */
  getMode() {
    return this.state.Mode;
  }

  /**
   * ## 设置游戏模式
   *
   * 切换 `single` ↔ `versus` 模式，或设置为 `null` 回到模式选择状态。 通常在场景切换时调用。
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
   *   - `'single'`：单人模式
   *   - `'versus'`：对战模式
   *   - `null`：模式选择状态
   *
   * @returns {void}
   */
  setMode(mode) {
    this.state.Mode = mode;
  }

  /**
   * ## 获取对战目标分数（按难度）
   *
   * 对战模式下，先达到此分数的玩家赢得整场对战。 不同难度对应不同的目标分数，难度越高所需分数越多，对局时间越长。
   *
   * ### 目标分数配置
   *
   * | 难度     | 默认分数 | 预计对局时间 |
   * | -------- | -------- | ------------ |
   * | `easy`   | 5        | ~1-2 分钟    |
   * | `normal` | 8        | ~2-3 分钟    |
   * | `hard`   | 12       | ~3-5 分钟    |
   * | `expert` | 15       | ~5+ 分钟     |
   *
   * @example
   *   const score = store.getVictoryScore(); // 5 (默认 easy)
   *   const score = store.getVictoryScore('hard'); // 12
   *   const score = store.getVictoryScore('expert'); // 15
   *
   * @param {string} [difficulty='easy'] - 难度等级名称。默认值 `'easy'` 可选值：`'easy'` |
   *   `'normal'` | `'hard'` | `'expert'`. Default is `'easy'`
   * @returns {number} 该难度对应的目标分数
   */
  getVictoryScore(difficulty = 'easy') {
    // 从 VictoryScore 配置中读取对应难度的分数
    return this.state.VictoryScore[difficulty];
  }

  /**
   * ## 设置对战目标分数（按难度）
   *
   * 修改指定难度的对战目标分数。可用于自定义难度或调试。
   *
   * @example
   *   // 让 normal 难度更容易
   *   store.setVictoryScore('normal', 5);
   *
   *   // 让 expert 难度更极端
   *   store.setVictoryScore('expert', 20);
   *
   * @param {string} difficulty - 难度等级名称 可选值：`'easy'` | `'normal'` | `'hard'` |
   *   `'expert'`
   * @param {number} score - 目标分数（建议使用正整数）
   * @returns {void}
   */
  setVictoryScore(difficulty, score) {
    // 直接修改对应难度的分数值
    this.state.VictoryScore[difficulty] = score;
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
   *   - `'classic'`：经典纯色 + 黑色边框，NES 经典风格
   *   - `'frosted'`：毛玻璃质感，半透明 + 噪点纹理
   *   - `'glass'`：光面玻璃质感，半透明 + 对角线高光
   *   - `'glossy'`：高光质感（默认），渐变填充 + 顶部高光条
   *   - `'gradient'`：垂直渐变，上亮下暗
   *   - `'inset'`：内嵌风格，凹陷立体感
   *   - `'pixel'`：像素风格，8-bit 复古纹理
   *   - `'shaded'`：立体阴影，4 色几何分块模拟 3D 光照
   */
  getBlockStyle() {
    return this.state.Block.style;
  }

  /**
   * ## 设置方块渲染风格
   *
   * 修改方块的渲染风格。调用后需要触发重新渲染才能看到效果。
   *
   * @example
   *   // 切换到像素风格
   *   store.setBlockStyle('pixel');
   *   // 下一帧渲染时会应用新风格
   *
   * @param {string} style - 渲染风格，必须是 `getBlockStyle()` 中列出的有效值之一
   * @returns {void}
   */
  setBlockStyle(style) {
    this.state.Block.style = style;
  }

  /**
   * ## 获取方块图案
   *
   * 获取当前配置的方块图案，影响方块表面的纹理样式。 图案叠加在渲染风格之上，提供额外的视觉辨识度。
   *
   * @example
   *   const pattern = store.getBlockPattern(); // 'tee'
   *
   * @returns {string} 方块图案，可选值：
   *
   *   - `'square'`：无额外纹理，标准正方形
   *   - `'jay'`：J 方块形状的暗纹
   *   - `'ell'`：L 方块形状的暗纹
   *   - `'tee'`：T 方块形状的暗纹
   */
  getBlockPattern() {
    return this.state.Block.pattern;
  }

  /**
   * ## 设置方块图案
   *
   * 修改方块的图案样式。调用后需要触发重新渲染才能看到效果。
   *
   * @example
   *   // 切换到 J 型纹理
   *   store.setBlockPattern('jay');
   *
   * @param {string} pattern - 方块图案，必须是 `getBlockPattern()` 中列出的有效值之一
   * @returns {void}
   */
  setBlockPattern(pattern) {
    this.state.Block.pattern = pattern;
  }

  /**
   * ## 设置玩家列表
   *
   * 配置当前游戏模式的玩家列表。数组长度和内容决定游戏类型：
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
   * @param {string[]} players - 玩家名称数组，每个元素为 `'human'` 或 `'ai'`
   * @returns {void}
   */
  setPlayers(players) {
    this.state.Players = players;
  }

  /**
   * ## 重置状态
   *
   * 将当前状态完全重置为 EngineState 中定义的默认配置。 使用 `structuredClone` 深拷贝，确保与默认配置完全一致且独立。
   *
   * ### 重置后的状态
   *
   * | 属性          | 重置值                                         |
   * | ------------- | ---------------------------------------------- |
   * | Mode          | `'single'`                                     |
   * | Players       | `['human', 'ai']`                              |
   * | VictoryScore  | `{ easy: 5, normal: 8, hard: 12, expert: 15 }` |
   * | Block.style   | `'glossy'`                                     |
   * | Block.pattern | `'tee'`                                        |
   * | Elements.\*   | 全部恢复默认                                   |
   *
   * ### 典型使用场景
   *
   * - 从对战模式返回主菜单时重置
   * - 切换语言/主题后需要恢复默认游戏配置时
   *
   * @example
   *   // 返回主菜单时重置状态
   *   store.reset();
   *   console.log(store.getMode()); // 'single'
   *   console.log(store.getState().Players); // ['human', 'ai']
   *   console.log(store.getBlockStyle()); // 'glossy'
   *
   * @returns {void}
   */
  reset() {
    // 直接以 EngineState 为模板创建全新的深拷贝
    this.state = structuredClone(EngineState);
  }
}

export default EngineStore;
