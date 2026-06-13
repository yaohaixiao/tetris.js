/**
 * # 游戏全局配置
 *
 * 集中管理游戏中所有可配置的常量，包括棋盘尺寸、方块渲染风格、DOM 元素 ID 等。 修改此文件即可统一调整整个游戏的视觉风格和 UI 绑定。
 *
 * ## 方块渲染配置（Block）
 *
 * ### 渲染风格（style）
 *
 * | 值       | 说明             | 视觉特征                     |
 * | -------- | ---------------- | ---------------------------- |
 * | classic  | 经典纯色（默认） | 纯色填充 + 黑色边框          |
 * | frosted  | 毛玻璃质感       | 半透明 + 噪点纹理 + 深色边框 |
 * | glass    | 光面玻璃质感     | 半透明 + 高光 + 深色边框     |
 * | gradient | 垂直渐变风格     | 上亮下暗 + L 形暗色 + 边框   |
 * | inset    | 内嵌风格         | 凹陷立体感                   |
 * | pixel    | 像素风格         | 像素化纹理                   |
 * | shaded   | 立体阴影风格     | 4 色几何分块模拟光照         |
 *
 * ### 方块图案（pattern）
 *
 * | 值     | 说明         | 视觉特征   |
 * | ------ | ------------ | ---------- |
 * | square | 方形（默认） | 标准正方形 |
 * | jay    | J 型纹理     | J 方块图案 |
 * | ell    | L 型纹理     | L 方块图案 |
 * | tee    | T 型纹理     | T 方块图案 |
 *
 * ## 棋盘元素配置（Elements.Canvas）
 *
 * | 属性  | 值                  | 说明                    |
 * | ----- | ------------------- | ----------------------- |
 * | cols  | 10                  | 棋盘列数（宽度）        |
 * | rows  | 20                  | 棋盘行数（高度）        |
 * | board | 'tetris-game-board' | 棋盘 Canvas 元素 ID     |
 * | next  | 'tetris-next-piece' | 预览方块 Canvas 元素 ID |
 * | hold  | 'tetri-hold-piece'  | 暂存方块 Canvas 元素 ID |
 *
 * ## HUD 元素配置（Elements.Hud）
 *
 * | 属性       | 值                  | 说明                   |
 * | ---------- | ------------------- | ---------------------- |
 * | controller | 'tetris-controller' | 控制者标识 DOM 元素 ID |
 * | score      | 'tetris-score'      | 分数 DOM 元素 ID       |
 * | lines      | 'tetris-lines'      | 消除行数 DOM 元素 ID   |
 * | level      | 'tetris-level'      | 等级 DOM 元素 ID       |
 * | combo      | 'tetris-combo'      | 连击数 DOM 元素 ID     |
 * | highScore  | 'tetris-high-score' | 最高分 DOM 元素 ID     |
 *
 * ## 手柄控制元素配置（Elements.Controls）
 *
 * | 属性  | 值                  | 说明                 |
 * | ----- | ------------------- | -------------------- |
 * | back  | 'tetris-btn-back'   | 返回按钮 DOM 元素 ID |
 * | hold  | 'tetris-btn-hold'   | 暂存按钮 DOM 元素 ID |
 * | start | 'tetris-btn-start'  | 开始按钮 DOM 元素 ID |
 * | up    | 'tetris-dpad-up'    | 方向上键 DOM 元素 ID |
 * | down  | 'tetris-dpad-down'  | 方向下键 DOM 元素 ID |
 * | left  | 'tetris-dpad-left'  | 方向左键 DOM 元素 ID |
 * | right | 'tetris-dpad-right' | 方向右键 DOM 元素 ID |
 * | a     | 'tetris-btn-a'      | A 按钮 DOM 元素 ID   |
 * | b     | 'tetris-btn-b'      | B 按钮 DOM 元素 ID   |
 * | x     | 'tetris-btn-x'      | X 按钮 DOM 元素 ID   |
 * | y     | 'tetris-btn-y'      | Y 按钮 DOM 元素 ID   |
 *
 * @constant {object} Configuration
 */
const Configuration = {
  /**
   * ## 游戏模式
   *
   * - 'single'：单人模式；
   * - 'versus'：对战模式；
   */
  Mode: 'single',

  /**
   * ## 对战玩家列表：
   *
   * 人机对战：['human', 'ai'] 双人对战：['human', 'human']
   */
  Players: ['human', 'human'],

  // 先得 15 分者获胜
  victoryScore: 15,

  /*
   * ==================== 方块渲染配置 ====================
   */
  Block: {
    /**
     * 渲染风格：
     *
     * - 'classic'
     * - 'frosted'
     * - 'glass'
     * - 'glossy'
     * - 'gradient'
     * - 'inset'
     * - 'pixel'
     * - 'shaded'
     */
    style: 'glossy',

    /**
     * 方块图案：
     *
     * - 'square'
     * - 'jay'
     * - 'ell'
     * - 'tee'
     */
    pattern: 'tee',
  },

  /*
   * ==================== 游戏元素配置 ====================
   */
  Elements: {
    Battle: {
      overlay: 'tetris-battle-overlay',
      winner: 'tetris-battle-winner',
    },
    Container: 'tetris-container',
    /*
     * ==================== 棋盘 Canvas 配置 ====================
     */
    Canvas: {
      /** 棋盘列数（宽度） */
      cols: 10,

      /** 棋盘行数（高度） */
      rows: 20,

      /** 棋盘 Canvas 元素 ID */
      board: 'tetris-game-board',

      /** 预览方块 Canvas 元素 ID */
      next: 'tetris-next-piece',

      /** 暂存方块 Canvas 元素 ID */
      hold: 'tetri-hold-piece',
    },

    /*
     * ==================== HUD 显示元素配置 ====================
     */
    Hud: {
      /** 控制者标识 DOM 元素 ID */
      controller: 'tetris-controller',

      /** 分数 DOM 元素 ID */
      score: 'tetris-score',

      /** 消除行数 DOM 元素 ID */
      lines: 'tetris-lines',

      /** 等级 DOM 元素 ID */
      level: 'tetris-level',

      /** 连击数 DOM 元素 ID */
      combo: 'tetris-combo',

      /** 最高分 DOM 元素 ID */
      highScore: 'tetris-high-score',
    },

    /*
     * ==================== 手柄按钮元素配置 ====================
     */
    Controls: {
      /** 返回按钮 DOM 元素 ID */
      back: 'tetris-btn-back',

      /** 暂存按钮 DOM 元素 ID */
      hold: 'tetris-btn-hold',

      /** 开始按钮 DOM 元素 ID */
      start: 'tetris-btn-start',

      /** 方向上键 DOM 元素 ID */
      up: 'tetris-dpad-up',

      /** 方向下键 DOM 元素 ID */
      down: 'tetris-dpad-down',

      /** 方向左键 DOM 元素 ID */
      left: 'tetris-dpad-left',

      /** 方向右键 DOM 元素 ID */
      right: 'tetris-dpad-right',

      /** A 按钮 DOM 元素 ID */
      a: 'tetris-btn-a',

      /** B 按钮 DOM 元素 ID */
      b: 'tetris-btn-b',

      /** X 按钮 DOM 元素 ID */
      x: 'tetris-btn-x',

      /** Y 按钮 DOM 元素 ID */
      y: 'tetris-btn-y',
    },
  },
};

export default Configuration;
