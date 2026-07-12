/**
 * ============================================================
 *
 * # 游戏全局配置
 *
 * ============================================================
 *
 * 集中管理游戏中所有可配置的常量，是整个游戏的"配置中心"。 包括游戏模式、对战规则、棋盘尺寸、方块渲染风格、 DOM 元素 ID 绑定等。
 *
 * ## 设计原则
 *
 * - 单一配置源：所有魔法数字和字符串集中于此
 * - 热更新友好：修改后刷新页面即可生效
 * - 自文档化：每个配置项都有详细注释说明用途和可选值
 *
 * ## 方块渲染配置（Block）
 *
 * 控制方块的外观风格，支持 8 种渲染风格和 4 种图案纹理。 渲染风格和图案可以自由组合。
 *
 * ### 渲染风格（Block.style）
 *
 * | 值       | 说明             | 视觉特征                          |
 * | :------- | :--------------- | :-------------------------------- |
 * | classic  | 经典纯色（默认） | 纯色填充 + 黑色边框，NES 经典风格 |
 * | frosted  | 毛玻璃质感       | 半透明 + 噪点纹理 + 深色边框      |
 * | glass    | 光面玻璃质感     | 半透明 + 对角线高光 + 深色边框    |
 * | glossy   | 光泽质感         | 渐变填充 + 顶部高光条 + 立体感    |
 * | gradient | 垂直渐变风格     | 上亮下暗的线性渐变 + L 形暗角     |
 * | inset    | 内嵌风格         | 凹陷立体感，边缘暗中间亮          |
 * | pixel    | 像素风格         | 像素化纹理，复古 8-bit 风格       |
 * | shaded   | 立体阴影风格     | 4 色几何分块模拟光照，3D 效果     |
 *
 * ### 方块图案（Block.pattern）
 *
 * | 值     | 说明         | 视觉特征               |
 * | :----- | :----------- | :--------------------- |
 * | square | 方形（默认） | 标准正方形，无额外纹理 |
 * | jay    | J 型纹理     | J 方块形状的暗纹       |
 * | ell    | L 型纹理     | L 方块形状的暗纹       |
 * | tee    | T 型纹理     | T 方块形状的暗纹       |
 *
 * ## 棋盘元素配置（Elements.Canvas）
 *
 * | 属性  | 默认值            | 说明                                |
 * | :---- | :---------------- | :---------------------------------- |
 * | cols  | 10                | 棋盘列数（宽度），标准 Tetris 为 10 |
 * | rows  | 20                | 棋盘行数（高度），标准 Tetris 为 20 |
 * | board | tetris-game-board | 主棋盘 Canvas 元素 ID               |
 * | next  | tetris-next-piece | 下一个方块预览 Canvas 元素 ID       |
 * | hold  | tetri-hold-piece  | 暂存方块 Canvas 元素 ID             |
 *
 * ## HUD 元素配置（Elements.Hud）
 *
 * | 属性       | 默认值            | 说明                   |
 * | :--------- | :---------------- | :--------------------- |
 * | controller | tetris-controller | 控制者标识（HUMAN/AI） |
 * | score      | tetris-score      | 当前分数               |
 * | lines      | tetris-lines      | 当前消除行数           |
 * | level      | tetris-level      | 当前等级               |
 * | combo      | tetris-combo      | 当前连击数             |
 * | highScore  | tetris-high-score | 历史最高分             |
 *
 * ## 手柄控制元素配置（Elements.Controls）
 *
 * | 属性  | 默认值            | 说明                 |
 * | :---- | :---------------- | :------------------- |
 * | back  | tetris-btn-back   | 返回按钮             |
 * | hold  | tetris-btn-hold   | 暂存方块按钮         |
 * | start | tetris-btn-start  | 开始/暂停按钮        |
 * | up    | tetris-dpad-up    | 方向键上（旋转）     |
 * | down  | tetris-dpad-down  | 方向键下（加速下落） |
 * | left  | tetris-dpad-left  | 方向键左（左移）     |
 * | right | tetris-dpad-right | 方向键右（右移）     |
 * | a     | tetris-btn-a      | A 按钮（切换音乐）   |
 * | b     | tetris-btn-b      | B 按钮（硬降）       |
 * | x     | tetris-btn-x      | X 按钮（重新开始）   |
 * | y     | tetris-btn-y      | Y 按钮（暂停）       |
 *
 * ## 对战模式元素配置（Elements.Battle）
 *
 * | 属性    | 默认值                | 说明                   |
 * | :------ | :-------------------- | :--------------------- |
 * | overlay | tetris-battle-overlay | 对战结束覆盖层容器     |
 * | over    | tetris-battle-over    | "BATTLE OVER" 文字元素 |
 * | winner  | tetris-battle-winner  | 胜利者显示元素         |
 * | fly     | tetris-battle-fly     | 胜利动画元素           |
 *
 * @constant {object} EngineState
 */
const EngineState = {
  /**
   * 游戏模式。
   *
   * | 值       | 说明                                        |
   * | :------- | :------------------------------------------ |
   * | 'single' | 单人模式：经典 Tetris，无限循环，追求最高分 |
   * | 'versus' | 对战模式：两人或人机对战，先达目标分者获胜  |
   */
  Mode: 'single',

  /**
   * 对战玩家列表。
   *
   * 仅在 Mode='versus' 时生效，数组长度为 2。
   *
   * | 配置               | 说明             |
   * | :----------------- | :--------------- |
   * | ['human', 'ai']    | 人机对战（默认） |
   * | ['human', 'human'] | 双人对战         |
   */
  Players: ['human', 'ai'],

  /*
   * ============================================================
   * 方块渲染配置
   * ============================================================
   */
  Block: {
    /**
     * 渲染风格。
     *
     * | 值       | 光照模型        | 适用场景       |
     * | :------- | :-------------- | :------------- |
     * | classic  | 纯色 + 黑色边框 | 经典 NES 风格  |
     * | frosted  | 半透明 + 噪点   | 现代简约风格   |
     * | glass    | 半透明 + 高光   | 现代玻璃质感   |
     * | glossy   | 渐变 + 高光条   | 默认推荐       |
     * | gradient | 上亮下暗渐变    | 柔和立体风格   |
     * | inset    | 凹陷阴影        | 内嵌棋盘风格   |
     * | pixel    | 像素化纹理      | 8-bit 复古风格 |
     * | shaded   | 4 色几何分块    | 3D 立体风格    |
     */
    style: 'glossy',

    /**
     * 方块图案。
     *
     * 在渲染风格之上叠加的纹理图案。 设为 'square' 表示无额外纹理。
     *
     * | 值     | 纹理形状   | 推荐搭配          |
     * | :----- | :--------- | :---------------- |
     * | square | 无纹理     | 所有风格皆可      |
     * | jay    | J 方块轮廓 | glossy / gradient |
     * | ell    | L 方块轮廓 | glossy / gradient |
     * | tee    | T 方块轮廓 | glossy / frosted  |
     */
    pattern: 'tee',
  },

  /*
   * ============================================================
   * 游戏元素配置
   * ============================================================
   */
  Elements: {
    /** 对战模式覆盖层元素。 */
    Battle: {
      /** 覆盖层容器（半透明背景） */
      overlay: 'tetris-battle-overlay',
      /** "BATTLE OVER" 标题文字 */
      over: 'tetris-battle-over',
      /** 胜利者名称显示 */
      winner: 'tetris-battle-winner',
      /** 胜利动画元素 */
      fly: 'tetris-battle-fly',
    },

    /** 游戏主容器 DOM 元素 ID */
    Container: 'tetris-container',

    /*
     * ============================================================
     * 棋盘 Canvas 配置
     * ============================================================
     */
    Canvas: {
      /** 棋盘列数（宽度），标准值为 10 */
      cols: 10,

      /** 棋盘行数（高度），标准值为 20 */
      rows: 20,

      /** 主棋盘 Canvas 元素 ID */
      board: 'tetris-game-board',

      /** 预览方块 Canvas 元素 ID */
      next: 'tetris-next-piece',

      /** 暂存方块 Canvas 元素 ID */
      hold: 'tetri-hold-piece',
    },

    /*
     * ============================================================
     * HUD 显示元素配置
     * ============================================================
     */
    Hud: {
      /** 控制者标识 DOM 元素 ID（HUMAN/AI） */
      controller: 'tetris-controller',

      /** 当前分数 DOM 元素 ID */
      score: 'tetris-score',

      /** 当前消除行数 DOM 元素 ID */
      lines: 'tetris-lines',

      /** 当前等级 DOM 元素 ID */
      level: 'tetris-level',

      /** 连击数 DOM 元素 ID */
      combo: 'tetris-combo',

      /** 最高分 DOM 元素 ID */
      highScore: 'tetris-high-score',

      /** 计时器 DOM 元素 ID */
      timer: 'tetris-elapsed-timer',
    },

    /*
     * ============================================================
     * 手柄按钮元素配置
     * ============================================================
     */
    Controls: {
      /** 返回按钮 — 返回上级菜单 / 退出游戏 */
      back: 'tetris-btn-back',

      /** 暂存按钮 — 将当前方块放入 Hold 槽 */
      hold: 'tetris-btn-hold',

      /** 开始按钮 — 开始游戏 / 确认选择 */
      start: 'tetris-btn-start',

      /** 方向上键 — 旋转方块 / 菜单中向上选择 */
      up: 'tetris-dpad-up',

      /** 方向下键 — 加速下落 / 菜单中向下选择 */
      down: 'tetris-dpad-down',

      /** 方向左键 — 方块左移 */
      left: 'tetris-dpad-left',

      /** 方向右键 — 方块右移 */
      right: 'tetris-dpad-right',

      /** A 按钮 — 切换音乐（游戏中）/ 选择简单难度 */
      a: 'tetris-btn-a',

      /** B 按钮 — 硬降（方块直接落底）/ 选择普通难度 */
      b: 'tetris-btn-b',

      /** X 按钮 — 重新开始 / 选择专家难度 */
      x: 'tetris-btn-x',

      /** Y 按钮 — 暂停 / 选择困难难度 */
      y: 'tetris-btn-y',
    },
  },
};

export default EngineState;
