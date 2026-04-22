/**
 * # 全局游戏状态对象（集中管理所有游戏数据）
 *
 * @typedef {object} TetrisState
 * @property {number | null} rafId - 游戏动画Id
 * @property {number | null} timestamp - 游戏动画时间戳
 * @property {string[][]} board - 游戏棋盘二维数组，存储每个格子颜色
 * @property {object | null} curr - 当前正在下落的方块对象，null 表示无
 * @property {number} cx - 当前方块的 X 坐标（列）
 * @property {number} cy - 当前方块的 Y 坐标（行）
 * @property {object | null} next - 下一个预览方块对象
 * @property {number} score - 当前游戏得分
 * @property {number} baseLines - 升级基准行数（计算等级用）
 * @property {number} lines - 当前已消除行数
 * @property {Array} clearLines - 当前已消除行行号数据
 * @property {number} level - 当前游戏等级
 * @property {number} highScore - 历史最高得分
 * @property {string} mode - 游戏当前模式：main-menu, playing, paused, game-over
 */

/**
 * # 全局游戏状态（集中管理）
 *
 * @type {TetrisState}
 */
const EngineState = {
  board: [],
  curr: null,
  cx: 0,
  cy: 0,
  next: null,
  score: 0,
  baseLines: 0,
  lines: 0,
  clearLines: [],
  level: 1,
  highScore: 0,
  /*
   * main-menu：等级选择（主菜单）
   * playing：游戏中
   * paused：游戏暂停
   * game-over：游戏结束
   */
  mode: 'main-menu',
};

export default EngineState;
