import collision from '@/lib/game/logic/collision.js';
import { AudioEvents } from '@/lib/events/event-catalog.js';

/**
 * # 旋转当前方块
 *
 * 对当前活动方块执行顺时针 90° 旋转。 旋转后若发生碰撞，自动撤销旋转（恢复原形状）。
 *
 * ## 旋转算法
 *
 * 采用"转置 + 反转行"的经典矩阵旋转方式：
 *
 *     原矩阵：        转置后：        反转每行（旋转 90°）：
 *     [0, 1, 0]     [0, 1]          [1, 0]
 *     [1, 1, 1]     [1, 1]          [1, 1]
 *                   [0, 1]          [1, 0]
 *
 * ## 碰撞回退
 *
 * 旋转后立即检测当前位置是否碰撞。 如果碰撞（如旋转后方块超出边界或与已有方块重叠）， 自动恢复旋转前的形状，保证游戏正常运行。
 *
 * 注意：当前实现为简单的碰撞回退，不包含 Wall Kick（墙踢）逻辑。
 *
 * ## 处理流程
 *
 * 1. 保存旋转前的形状（用于回退）
 * 2. 执行顺时针旋转：转置 + 反转每行
 * 3. 更新 Store 中的方块形状
 * 4. 检测旋转后是否碰撞
 *
 *    - 碰撞 → 恢复原形状
 *    - 无碰撞 → 播放旋转音效
 *
 * @function rotate
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const rotate = (runtime) => {
  const { Store } = runtime;
  const state = Store.getState();
  const { curr } = state;

  // 没有活动方块，无法旋转
  if (!curr) {
    return;
  }

  // 深拷贝当前方块对象，避免直接修改原状态
  const currentShape = structuredClone(curr);

  // 保存旋转前的形状，用于碰撞后恢复
  const prev = curr.shape;

  /*
   * 顺时针旋转矩阵：
   * - 1. 转置：prev[0].map((_, i) => prev.map((r) => r[i]))
   * - 2. 反转每行：.toReversed()
   */
  currentShape.shape = prev[0].map((_, i) =>
    prev.map((r) => r[i]).toReversed(),
  );

  // 更新 Store 中的方块形状
  Store.setState({
    curr: currentShape,
  });

  const events = AudioEvents();

  // 旋转后检测当前位置是否发生碰撞
  if (collision(runtime, 0, 0)) {
    // 碰撞 → 恢复旋转前的形状
    currentShape.shape = prev;
    Store.setState({
      curr: currentShape,
    });
  } else {
    // 旋转成功 → 播放旋转音效
    runtime.emit(events.PLAY_SOUND, { sound: 'ROTATE' });
  }
};

export default rotate;
