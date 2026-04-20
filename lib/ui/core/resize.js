import BOARD from '@/lib/ui/constants/board.js';
import Canvas from '@/lib/ui/core/canvas.js';

/**
 * # 根据当前窗口尺寸重置游戏画布与预览画布大小
 *
 * 设计目标：
 *
 * - 保持游戏棋盘按比例缩放
 * - 基于行数（ROWS）计算单个方块尺寸（blockSize）
 * - 推导主画布尺寸（COLS × ROWS）
 * - 动态计算字体大小（fontSize）
 * - 自适应预览区域（nextPiece）
 *
 * @function resize
 * @returns {void}
 */
const resize = () => {
  // 解构棋盘行列数（用于计算布局）
  const { ROWS, COLS } = BOARD;

  // 获取主画布与预览画布
  const { gameBoard, nextPiece } = Canvas;

  /**
   * ======== 1. 计算主画布高度基准 ========
   *
   * 使用窗口高度的 90% 作为游戏区域高度 目的是保证整体布局在可视区域内
   */
  const h = globalThis.innerHeight * 0.9;

  /**
   * ======== 2. 计算单个方块尺寸 ========
   *
   * 根据总行数，将高度均分 得到每个方块的像素大小（向下取整避免模糊）
   */
  Canvas.blockSize = Math.floor(h / ROWS);

  /**
   * ======== 3. 设置主画布尺寸 ========
   *
   * 宽度 = 列数 × 单块尺寸 高度 = 行数 × 单块尺寸
   */
  gameBoard.width = Canvas.blockSize * COLS;
  gameBoard.height = Canvas.blockSize * ROWS;

  /**
   * ======== 4. 计算基础字体大小 ========
   *
   * 基于画布高度按比例缩放 用于统一 UI 文本尺寸（renderText 等）
   */
  Canvas.fontSize = Math.floor(gameBoard.height * 0.032);

  /**
   * ======== 5. 设置预览画布尺寸 ========
   *
   * 使用窗口宽高的较小值作为限制，避免过大或过小：
   *
   * - 最大不超过宽度的 10%
   * - 最大不超过高度的 18%
   */
  const nextSize = Math.min(
    globalThis.innerWidth * 0.1,
    globalThis.innerHeight * 0.18,
  );

  nextPiece.width = nextSize;
  nextPiece.height = nextSize;
};

export default resize;
