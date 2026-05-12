import getNextPiece from '@/lib/game/utils/get-next-piece.js';
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
 * @param context - 执行上下文对象
 * @returns {void}
 */
const spawn = (context) => {
  const { options, Store } = context;
  const { cols } = options.Elements.Main;
  const { curr, next } = getNextPiece(context);

  if (!curr) {
    return;
  }

  // 1. 更新游戏状态信息
  Store.setState({
    // 当前方块 = 下一个方块，若不存在则随机生成
    curr,
    // 重新随机生成下一个预览方块
    next,
    // 水平居中：屏幕中间 - 方块宽度的一半
    cx: Math.floor(cols / 2) - Math.floor(curr.shape[0].length / 2),
    // 垂直位置从顶部开始
    cy: 0,
  });

  const state = Store.getState();

  // 2. 出生点碰撞 → 无法生成新方块 → 游戏结束
  if (collision(context, 0, 0)) {
    over(context);
    return;
  }

  // 3. 绘制右侧预览方块界面
  context.emit('ui:render:next:piece', { state });

  // 4. replay record
  context.emit('replay:add:piece', state.curr);
};

export default spawn;
