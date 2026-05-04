import BOARD from '@/lib/services/ui/constants/board.js';
import EventBus from '@/lib/core/event-bus';
import UI from '@/lib/services/ui';
import Replay from '@/lib/runtime/replay-runtime.js';
import Game from '@/lib/game';
import getNextPiece from '@/lib/game/logic/get-next-piece.js';
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
  const { COLS } = BOARD;
  const { curr, next } = getNextPiece();

  if (!curr) {
    return;
  }

  // 1. 更新游戏状态信息
  store.setState({
    // 当前方块 = 下一个方块，若不存在则随机生成
    curr,
    // 重新随机生成下一个预览方块
    next,
    // 水平居中：屏幕中间 - 方块宽度的一半
    cx: Math.floor(COLS / 2) - Math.floor(curr.shape[0].length / 2),
    // 垂直位置从顶部开始
    cy: 0,
  });

  const currentState = store.getState();

  // 2. 出生点碰撞 → 无法生成新方块 → 游戏结束
  if (collision(0, 0)) {
    over();
    return;
  }

  // 3. 绘制右侧预览方块界面
  UI.renderNextPiece(currentState);

  // 4. replay record
  if (Replay.recording) {
    EventBus.emit('replay:piece', currentState.curr);
  }
};

export default spawn;
