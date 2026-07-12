import Base from '@/lib/core';

/**
 * ============================================================
 *
 * # 模块：CanvasManager Canvas 画布管理器
 *
 * ============================================================
 *
 * 统一管理游戏中的三个 Canvas 元素： 主游戏棋盘、下一个方块预览、缓存方块预览。
 *
 * ## 属性说明
 *
 * | 属性             | 类型                     | 说明                           |
 * | :--------------- | :----------------------- | :----------------------------- |
 * | rows             | number                   | 棋盘行数                       |
 * | cols             | number                   | 棋盘列数                       |
 * | gameBoard        | HTMLCanvasElement        | 主棋盘 DOM 元素                |
 * | gameBoardContext | CanvasRenderingContext2D | 棋盘画布渲染上下文             |
 * | nextPiece        | HTMLCanvasElement        | 预览方块 DOM 元素              |
 * | nextPieceContext | CanvasRenderingContext2D | 预览画布渲染上下文             |
 * | holdPiece        | HTMLCanvasElement        | 缓存方块 DOM 元素              |
 * | holdPieceContext | CanvasRenderingContext2D | 缓存画布渲染上下文             |
 * | fontSize         | number                   | 当前字体大小（由 resize 计算） |
 * | blockSize        | number                   | 当前方块尺寸（由 resize 计算） |
 *
 * @augments Base
 * @class CanvasManager
 */
class CanvasManager extends Base {
  /**
   * ## 构造函数
   *
   * 通过 DOM ID 获取 Canvas 元素并初始化渲染上下文。
   *
   * @param {object} options - 配置选项
   */
  constructor(options) {
    super(options);
    this.initialize(options);
  }

  /**
   * ## initialize：初始化 Canvas 管理器
   *
   * 获取三个 Canvas 元素及其 2D 渲染上下文， 初始化 fontSize 和 blockSize 为 0。
   *
   * @param {object} options - 配置选项
   * @param {string} options.board - 棋盘 Canvas ID
   * @param {string} options.next - 预览方块 Canvas ID
   * @param {string} options.hold - 缓存方块 Canvas ID
   * @param {string} options.name - 玩家名称
   * @param {number} options.index - 玩家索引
   * @returns {void}
   */
  initialize(options) {
    const { board, next, hold, name, index } = options;

    /** @type {HTMLCanvasElement} 主棋盘 Canvas 元素 */
    this.gameBoard = document.querySelector(`#${name}-${index}-${board}`);

    /** @type {CanvasRenderingContext2D} 棋盘画布 2D 渲染上下文 */
    this.gameBoardContext = this.gameBoard.getContext('2d');

    /** @type {HTMLCanvasElement} 预览方块 Canvas 元素 */
    this.nextPiece = document.querySelector(`#${name}-${index}-${next}`);

    /** @type {CanvasRenderingContext2D} 预览画布 2D 渲染上下文 */
    this.nextPieceContext = this.nextPiece.getContext('2d');

    /** @type {HTMLCanvasElement} 缓存方块 Canvas 元素 */
    this.holdPiece = document.querySelector(`#${name}-${index}-${hold}`);

    /** @type {CanvasRenderingContext2D} 缓存画布 2D 渲染上下文 */
    this.holdPieceContext = this.holdPiece.getContext('2d');

    /** @type {number} 当前字体大小（由 Resize 计算） */
    this.fontSize = 0;

    /** @type {number} 当前方块尺寸（由 Resize 计算） */
    this.blockSize = 0;
  }

  /**
   * ## getCanvas：获取 Canvas 元素
   *
   * @param {boolean} [isNext=false] - 是否获取预览方块 Canvas. Default is `false`
   * @returns {HTMLCanvasElement} Canvas DOM 元素
   */
  getCanvas(isNext = false) {
    return isNext ? this.nextPiece : this.gameBoard;
  }
}

export default CanvasManager;
