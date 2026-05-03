import UI from '@/lib/services/ui';
import Replay from '@/lib/runtime/replay-runtime.js';
import Game from '@/lib/game';
import randomShape from '@/lib/game/utils/random-shape.js';
import collision from '@/lib/game/logic/collision.js';
import over from '@/lib/game/core/over.js';

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
 * @returns {void}
 */
const spawn = () => {
  const { store } = Game;
  const { COLS } = UI.CONSTANTS.BOARD;

  // 重播模式：直接使用录制好的方块，不随机
  if (Replay.playing) {
    const piece = Replay.pieceSequence[Replay.pieceIndex];

    if (!piece) {
      return;
    }

    const nextPiece = Replay.pieceSequence[Replay.pieceIndex + 1] || null;

    store.setState({
      curr: piece,
      next: nextPiece ? structuredClone(nextPiece) : null,
      cx: Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2),
      cy: 0,
    });

    UI.renderNextPiece(store.getState());
    Replay.pieceIndex++;

    return;
  }

  const state = store.getState();
  const { next } = state;
  const curr = next
    ? {
        ...next,
        shape: next.shape.map((row) => [...row]),
      }
    : randomShape();

  // 更新游戏状态信息
  store.setState({
    // 当前方块 = 下一个方块，若不存在则随机生成
    curr,
    // 重新随机生成下一个预览方块
    next: randomShape(),
    // 水平居中：屏幕中间 - 方块宽度的一半
    cx: Math.floor(COLS / 2) - Math.floor(curr.shape[0].length / 2),
    // 垂直位置从顶部开始
    cy: 0,
  });

  const currentState = store.getState();

  // 绘制右侧预览方块界面
  UI.renderNextPiece(currentState);

  if (Replay.recording && currentState.curr) {
    Replay.pieceSequence.push(structuredClone(currentState.curr));
  }

  // 出生点碰撞 → 无法生成新方块 → 游戏结束
  if (collision(0, 0)) {
    over();
  }
};

export default spawn;
