/**
 * # 游戏全局配置
 *
 * 集中管理游戏中所有可配置的常量， 包括棋盘尺寸、DOM 元素 ID 等。
 *
 * ## 棋盘元素配置（Elements.Canvas）
 *
 * | 属性  | 值                  | 说明                    |
 * | ----- | ------------------- | ----------------------- |
 * | cols  | 10                  | 棋盘列数（宽度）        |
 * | rows  | 20                  | 棋盘行数（高度）        |
 * | board | 'tetris-game-board' | 棋盘 Canvas 元素 ID     |
 * | next  | 'tetris-next-piece' | 预览方块 Canvas 元素 ID |
 * | hold  | 'tetris-hold-piece' | 缓存方块 Canvas 元素 ID |
 *
 * ## HUD 元素配置（Elements.Hud）
 *
 * | 属性       | 值                  | 说明                   |
 * | ---------- | ------------------- | ---------------------- |
 * | controller | 'tetris-controller' | 控制者标识 DOM 元素 ID |
 * | score      | 'tetris-score'      | 分数 DOM 元素 ID       |
 * | lines      | 'tetris-lines'      | 消除行数 DOM 元素 ID   |
 * | level      | 'tetris-level'      | 等级 DOM 元素 ID       |
 * | highScore  | 'tetris-high-score' | 最高分 DOM 元素 ID     |
 *
 * @constant {object} Configuration
 */
const Configuration = {
  Block: {
    /*
     * 样式：
     *
     * - classic（默认）
     * - glass
     * - gradient
     * - inset
     * - pixel
     * - shaded
     */
    style: 'gradient',
    /*
     * 图案：
     *
     * - square（默认）
     * - jay
     * - ell
     * - tee
     */
    pattern: 'tee',
  },
  Elements: {
    Canvas: {
      cols: 10,
      rows: 20,
      board: 'tetris-game-board',
      next: 'tetris-next-piece',
      hold: 'tetri-hold-piece',
    },
    Hud: {
      controller: 'tetris-controller',
      score: 'tetris-score',
      lines: 'tetris-lines',
      level: 'tetris-level',
      combo: 'tetris-combo',
      highScore: 'tetris-high-score',
    },
    Controls: {
      back: 'tetris-btn-back',
      hold: 'tetris-btn-hold',
      start: 'tetris-btn-start',
      up: 'tetris-dpad-up',
      down: 'tetris-dpad-down',
      left: 'tetris-dpad-left',
      right: 'tetris-dpad-right',
      a: 'tetris-btn-a',
      b: 'tetris-btn-b',
      x: 'tetris-btn-x',
      y: 'tetris-btn-y',
    },
  },
};

export default Configuration;
