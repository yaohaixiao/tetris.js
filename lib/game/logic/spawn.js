import BOARD from '@/lib/ui/constants/board.js';
import randomTetromino from '@/lib/game/logic/random-tetromino.js';
import collision from '@/lib/game/logic/collision.js';
import gameOver from '@/lib/game/core/game-over.js';
import renderNextPiece from '@/lib/ui/next/render-next-piece.js';

/**
 * # 生成新方块
 *
 * 1. 将 next 方块变为当前下落方块
 * 2. 重新随机生成下一个方块
 * 3. 初始化方块位置（居中显示）
 * 4. 绘制下一个方块预览界面
 * 5. 检测出生碰撞 → 碰撞则游戏结束
 *
 * @function spawn
 * @param {object} state - 游戏状态. Default is `EngineState`
 * @returns {void}
 */
const spawn = (state) => {
  const { COLS } = BOARD;

  // 当前方块 = 下一个方块，若不存在则随机生成
  state.curr = state.next
    ? {
        ...state.next,
        shape: state.next.shape.map((row) => [...row]),
      }
    : randomTetromino();
  // 重新随机生成下一个预览方块
  state.next = randomTetromino();

  // 水平居中：屏幕中间 - 方块宽度的一半
  state.cx = Math.floor(COLS / 2) - Math.floor(state.curr.shape[0].length / 2);
  // 垂直位置从顶部开始
  state.cy = 0;

  // 绘制右侧预览方块界面
  renderNextPiece(state.next);

  // 出生点碰撞 → 无法生成新方块 → 游戏结束
  if (collision(0, 0, state)) {
    gameOver();
  }
};

export default spawn;
