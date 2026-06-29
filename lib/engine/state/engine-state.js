/**
 * # 游戏全局配置
 *
 * 集中管理游戏中所有可配置的常量，是整个游戏的"配置中心"。 包括游戏模式、对战规则、棋盘尺寸、方块渲染风格、DOM 元素 ID 绑定等。
 * 修改此文件即可统一调整游戏行为、视觉风格和 UI 绑定，无需深入业务代码。
 *
 * ## 设计原则
 *
 * - **单一配置源**：所有魔法数字和字符串集中于此
 * - **热更新友好**：修改后刷新页面即可生效
 * - **自文档化**：每个配置项都有详细注释说明用途和可选值
 *
 * ## 方块渲染配置（Block）
 *
 * 控制方块的外观风格，支持 7 种渲染风格和 4 种图案纹理。 渲染风格和图案可以自由组合（如 frosted + tee）。
 *
 * ### 渲染风格（Block.style）
 *
 * | 值       | 说明             | 视觉特征                          |
 * | -------- | ---------------- | --------------------------------- |
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
 * 在渲染风格之上叠加的纹理图案。
 *
 * | 值     | 说明         | 视觉特征               |
 * | ------ | ------------ | ---------------------- |
 * | square | 方形（默认） | 标准正方形，无额外纹理 |
 * | jay    | J 型纹理     | J 方块形状的暗纹       |
 * | ell    | L 型纹理     | L 方块形状的暗纹       |
 * | tee    | T 型纹理     | T 方块形状的暗纹       |
 *
 * ## 棋盘元素配置（Elements.Canvas）
 *
 * | 属性  | 默认值              | 说明                                |
 * | ----- | ------------------- | ----------------------------------- |
 * | cols  | 10                  | 棋盘列数（宽度），标准 Tetris 为 10 |
 * | rows  | 20                  | 棋盘行数（高度），标准 Tetris 为 20 |
 * | board | 'tetris-game-board' | 主棋盘 Canvas 元素 ID               |
 * | next  | 'tetris-next-piece' | 下一个方块预览 Canvas 元素 ID       |
 * | hold  | 'tetri-hold-piece'  | 暂存方块 Canvas 元素 ID             |
 *
 * ## HUD 元素配置（Elements.Hud）
 *
 * 游戏界面上显示实时数据的 DOM 元素 ID。
 *
 * | 属性       | 默认值              | 说明                   |
 * | ---------- | ------------------- | ---------------------- |
 * | controller | 'tetris-controller' | 控制者标识（HUMAN/AI） |
 * | score      | 'tetris-score'      | 当前分数               |
 * | lines      | 'tetris-lines'      | 当前消除行数           |
 * | level      | 'tetris-level'      | 当前等级               |
 * | combo      | 'tetris-combo'      | 当前连击数             |
 * | highScore  | 'tetris-high-score' | 历史最高分             |
 *
 * ## 手柄控制元素配置（Elements.Controls）
 *
 * 移动端触摸按钮的 DOM 元素 ID 绑定。
 *
 * | 属性  | 默认值              | 说明                 |
 * | ----- | ------------------- | -------------------- |
 * | back  | 'tetris-btn-back'   | 返回按钮             |
 * | hold  | 'tetris-btn-hold'   | 暂存方块按钮         |
 * | start | 'tetris-btn-start'  | 开始/暂停按钮        |
 * | up    | 'tetris-dpad-up'    | 方向键上（旋转）     |
 * | down  | 'tetris-dpad-down'  | 方向键下（加速下落） |
 * | left  | 'tetris-dpad-left'  | 方向键左（左移）     |
 * | right | 'tetris-dpad-right' | 方向键右（右移）     |
 * | a     | 'tetris-btn-a'      | A 按钮（切换音乐）   |
 * | b     | 'tetris-btn-b'      | B 按钮（硬降）       |
 * | x     | 'tetris-btn-x'      | X 按钮（重新开始）   |
 * | y     | 'tetris-btn-y'      | Y 按钮（暂停）       |
 *
 * ## 对战模式元素配置（Elements.Battle）
 *
 * 对战结束时的覆盖层 DOM 元素 ID。
 *
 * | 属性    | 默认值                  | 说明                   |
 * | ------- | ----------------------- | ---------------------- |
 * | overlay | 'tetris-battle-overlay' | 对战结束覆盖层容器     |
 * | over    | 'tetris-battle-over'    | "BATTLE OVER" 文字元素 |
 * | winner  | 'tetris-battle-winner'  | 胜利者显示元素         |
 * | fly     | 'tetris-battle-fly'     | 胜利动画元素           |
 *
 * @constant {object} EngineState
 */
const EngineState = {
  /**
   * ## 游戏模式
   *
   * 决定游戏的核心玩法分支。
   *
   * | 值       | 说明                                        |
   * | -------- | ------------------------------------------- |
   * | 'single' | 单人模式：经典 Tetris，无限循环，追求最高分 |
   * | 'versus' | 对战模式：两人或人机对战，先达目标分者获胜  |
   */
  Mode: 'single',

  /**
   * ## 对战玩家列表
   *
   * 仅在 Mode='versus' 时生效。数组长度为 2，分别对应 P1 和 P2。
   *
   * | 配置               | 说明             |
   * | ------------------ | ---------------- |
   * | ['human', 'ai']    | 人机对战（默认） |
   * | ['human', 'human'] | 双人对战         |
   */
  Players: ['human', 'ai'],

  /*
   * ==================== 方块渲染配置 ====================
   *
   * 控制 Tetromino 方块的视觉外观。
   * 包含两层：渲染风格（style）决定着色方式，图案（pattern）决定表面纹理。
   */
  Block: {
    /**
     * ## 渲染风格
     *
     * 决定方块的着色方式和整体质感。
     *
     * | 值       | 光照模型        | 适用场景       |
     * | -------- | --------------- | -------------- |
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
     * ## 方块图案
     *
     * 在渲染风格之上叠加的纹理图案，增加视觉辨识度。 设为 'square' 表示无额外纹理。
     *
     * | 值     | 纹理形状   | 推荐搭配          |
     * | ------ | ---------- | ----------------- |
     * | square | 无纹理     | 所有风格皆可      |
     * | jay    | J 方块轮廓 | glossy / gradient |
     * | ell    | L 方块轮廓 | glossy / gradient |
     * | tee    | T 方块轮廓 | glossy / frosted  |
     */
    pattern: 'tee',
  },

  /*
   * ==================== 游戏元素配置 ====================
   *
   * 管理游戏中所有 DOM 元素的 ID 绑定。
   * 如果你的 HTML 结构不同，只需修改这里的 ID 即可适配。
   */
  Elements: {
    /**
     * ## 对战模式覆盖层元素
     *
     * 当对战结束（battle-over）时显示的覆盖层 DOM 元素。
     */
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
     * ==================== 棋盘 Canvas 配置 ====================
     *
     * 棋盘尺寸和 Canvas 元素 ID 绑定。
     * cols × rows 定义了游戏区域的大小，标准 Tetris 为 10×20。
     */
    Canvas: {
      /**
       * 棋盘列数（宽度）
       *
       * 标准值为 10。增大可创建更宽的棋盘（非标准玩法）。
       */
      cols: 10,

      /**
       * 棋盘行数（高度）
       *
       * 标准值为 20。增大可创建更高的棋盘（非标准玩法）。
       */
      rows: 20,

      /**
       * 主棋盘 Canvas 元素 ID
       *
       * 游戏的主要渲染区域，所有方块在此绘制。
       */
      board: 'tetris-game-board',

      /**
       * 预览方块 Canvas 元素 ID
       *
       * 显示下一个即将出现的方块。
       */
      next: 'tetris-next-piece',

      /**
       * 暂存方块 Canvas 元素 ID
       *
       * 显示当前暂存（Hold）的方块。
       */
      hold: 'tetri-hold-piece',
    },

    /*
     * ==================== HUD 显示元素配置 ====================
     *
     * 游戏界面上实时更新的数据面板，通过 DOM 元素 ID 绑定。
     * 这些值由游戏循环持续更新。
     */
    Hud: {
      /**
       * 控制者标识 DOM 元素 ID
       *
       * 显示当前由谁控制：HUMAN（人类玩家）或 AI（人工智能）。 在对战模式中用于区分 P1 和 P2 的控制者。
       */
      controller: 'tetris-controller',

      /**
       * 当前分数 DOM 元素 ID
       *
       * 实时显示玩家当前得分。分数由消行、连击等因素决定。
       */
      score: 'tetris-score',

      /**
       * 当前消除行数 DOM 元素 ID
       *
       * 显示本局游戏已消除的总行数。
       */
      lines: 'tetris-lines',

      /**
       * 当前等级 DOM 元素 ID
       *
       * 等级随消除行数提升，影响方块下落速度。
       */
      level: 'tetris-level',

      /**
       * 连击数 DOM 元素 ID
       *
       * 显示当前连续消行的次数（连续多步消行）。
       */
      combo: 'tetris-combo',

      /**
       * 最高分 DOM 元素 ID
       *
       * 显示历史最高分（从 localStorage 读取）。
       */
      highScore: 'tetris-high-score',
    },

    /*
     * ==================== 手柄按钮元素配置 ====================
     *
     * 移动端触摸操作按钮的 DOM 元素 ID 绑定。
     * 每个按钮对应一个游戏操作，与键盘/手柄映射保持一致。
     *
     * 布局参考（右侧按钮区）：
     *
     *        [Y]
     *     [X]   [A]
     *        [B]
     *
     * 布局参考（左侧方向键区）：
     *
     *        [↑]
     *   [←]  [→]
     *        [↓]
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
