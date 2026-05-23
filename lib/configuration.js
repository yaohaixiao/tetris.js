/**
 * # 游戏全局配置
 *
 * 集中管理游戏中所有可配置的常量， 包括棋盘尺寸、DOM 元素 ID 等。
 *
 * ## 棋盘元素配置（Elements.Main）
 *
 * | 属性  | 值           | 说明                    |
 * | ----- | ------------ | ----------------------- |
 * | cols  | 10           | 棋盘列数（宽度）        |
 * | rows  | 20           | 棋盘行数（高度）        |
 * | board | 'game-board' | 棋盘 Canvas 元素 ID     |
 * | next  | 'next-piece' | 预览方块 Canvas 元素 ID |
 *
 * ## HUD 元素配置（Elements.Hud）
 *
 * | 属性       | 值           | 说明                   |
 * | ---------- | ------------ | ---------------------- |
 * | controller | 'controller' | 控制者标识 DOM 元素 ID |
 * | score      | 'score'      | 分数 DOM 元素 ID       |
 * | lines      | 'lines'      | 消除行数 DOM 元素 ID   |
 * | level      | 'level'      | 等级 DOM 元素 ID       |
 * | highScore  | 'high-score' | 最高分 DOM 元素 ID     |
 *
 * @constant {object} Configuration
 */
const Configuration = {
  Elements: {
    Main: {
      cols: 10,
      rows: 20,
      board: 'game-board',
      next: 'next-piece',
    },
    Hud: {
      controller: 'controller',
      score: 'score',
      lines: 'lines',
      level: 'level',
      highScore: 'high-score',
    },
  },
};

export default Configuration;
