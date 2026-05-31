import Base from '@/lib/core';

/**
 * # Canvas 画布管理器
 *
 * 统一管理游戏中的两个 Canvas 元素：
 *
 * - **gameBoard**：主游戏棋盘画布
 * - **nextPiece**：下一个方块预览画布
 *
 * ## 属性说明
 *
 * | 属性             | 类型                     | 说明                           |
 * | ---------------- | ------------------------ | ------------------------------ |
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
 * @class CanvasManager
 * @param Base
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

  initialize(options) {
    const { board, next, hold } = options;

    /** @type {HTMLCanvasElement} 主棋盘 Canvas 元素 */
    this.gameBoard = document.querySelector(`#${board}`);

    /** @type {CanvasRenderingContext2D} 棋盘画布 2D 渲染上下文 */
    this.gameBoardContext = this.gameBoard.getContext('2d');

    /** @type {HTMLCanvasElement} 预览方块 Canvas 元素 */
    this.nextPiece = document.querySelector(`#${next}`);

    /** @type {CanvasRenderingContext2D} 预览画布 2D 渲染上下文 */
    this.nextPieceContext = this.nextPiece.getContext('2d');

    /** @type {HTMLCanvasElement} 预览方块 Canvas 元素 */
    this.holdPiece = document.querySelector(`#${hold}`);

    /** @type {CanvasRenderingContext2D} 预览画布 2D 渲染上下文 */
    this.holdPieceContext = this.holdPiece.getContext('2d');

    /** @type {number} 当前字体大小（由 Resize 计算） */
    this.fontSize = 0;

    /** @type {number} 当前方块尺寸（由 Resize 计算） */
    this.blockSize = 0;
  }
}

export default CanvasManager;
