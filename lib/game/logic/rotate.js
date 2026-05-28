import collision from '@/lib/game/logic/collision.js';
import { AudioEvents } from '@/lib/events/event-catalog.js';
import getKickData from '@/lib/game/utils/get-kick-data.js';
import rotateCounterClockwise from '@/lib/game/utils/rotate-counter-clockwise.js';
import rotateClockwise from '@/lib/game/utils/rotate-clockwise.js';

/**
 * 方块旋转（带 SRS 墙踢）
 *
 * 实现俄罗斯方块的旋转机制，支持顺时针和逆时针旋转，并集成 SRS（Standard Rotation System）
 * 墙踢系统。当方块旋转时遇到障碍物（边界或其他方块），会尝试一系列偏移位置，找到第一个 无碰撞的位置应用旋转。
 *
 * ## 处理流程
 *
 * | 步骤 | 操作         | 说明                                 |
 * | ---- | ------------ | ------------------------------------ |
 * | 1    | 类型检查     | O 型方块无需旋转，直接返回           |
 * | 2    | 计算旋转形状 | 根据方向调用对应的旋转函数生成新形状 |
 * | 3    | 获取墙踢数据 | 根据方块类型获取 SRS 偏移表          |
 * | 4    | 遍历偏移     | 依次尝试每个偏移位置进行碰撞检测     |
 * | 5    | 应用旋转     | 找到可用偏移后更新状态并播放音效     |
 * | 6    | 原地旋转     | 无有效偏移时尝试无偏移旋转           |
 *
 * |
 *
 * ## SRS 墙踢系统
 *
 * 不同方块类型有不同的偏移表：
 *
 * - **I 型**：使用 KICK_I 数据（5 个偏移，偏移量较大）
 * - **I5 型**：使用 KICK_I5 数据（5 格加长版专用）
 * - **J/L/S/Z/T 型**：使用 KICK_JLSZT 数据（5 个偏移，偏移量较小）
 * - **O 型**：无墙踢数据，旋转后形状不变
 *
 * ## 坐标系转换
 *
 * SRS 标准定义中 Y 轴正方向向上，而游戏中 Y 轴正方向向下。 因此需要将偏移量中的 Y 值取反：offsetY = -oy
 *
 * ## 旋转方向
 *
 * - Direction = 1：顺时针旋转（0→R, R→2, 2→L, L→0）
 * - Direction = -1：逆时针旋转（0→L, L→2, 2→R, R→0）
 *
 * ## 碰撞检测优先级
 *
 * 1. 先尝试 SRS 定义的所有偏移位置（通常 5 个）
 * 2. 所有偏移都失败时，尝试原地旋转（偏移为 0,0）
 * 3. 仍然失败则放弃旋转，方块保持原样
 *
 * @example
 *   // 顺时针旋转当前方块
 *   rotate(runtime, 1);
 *
 * @example
 *   // 逆时针旋转当前方块
 *   rotate(runtime, -1);
 *
 * @param {object} runtime - 游戏运行时对象
 * @param {number} [direction=1] - 旋转方向：1=顺时针，-1=逆时针. Default is `1`
 * @returns {void}
 */
const rotate = (runtime, direction = 1) => {
  const { Store } = runtime;
  const state = Store.getState();
  const { curr } = state;

  // 检查方块是否存在且不是 O 型
  if (curr?.type === 'O') {
    return;
  }

  // 1. 计算旋转后的形状
  const rotated =
    direction === 1
      ? rotateClockwise(curr.shape)
      : rotateCounterClockwise(curr.shape);

  // 2. 获取墙踢数据
  const kickData = getKickData(curr.type);
  const curRotation = (curr.rotation ?? 0) % 4;
  const newRotation = (curRotation + direction + 4) % 4; // +4 确保正数

  // 3. 尝试每个偏移（带墙踢）
  if (kickData && Array.isArray(kickData)) {
    const tests = kickData[curRotation];

    // 防御性检查
    if (tests && Array.isArray(tests) && tests.length > 0) {
      for (const [ox, oy] of tests) {
        const offsetX = ox;
        const offsetY = -oy; // SRS 坐标系转换：正 Y 向上 -> 正 Y 向下

        if (!collision(runtime, offsetX, offsetY, rotated)) {
          // 应用旋转和偏移
          Store.setState({
            curr: {
              ...curr,
              shape: rotated,
              rotation: newRotation,
            },
            cx: state.cx + offsetX,
            cy: state.cy + offsetY,
          });

          runtime.emit(AudioEvents().PLAY_SOUND, { sound: 'ROTATE' });
          return;
        }
      }
    }
  }

  // 4. 尝试原地旋转（无偏移）
  if (!collision(runtime, 0, 0, rotated)) {
    Store.setState({
      curr: {
        ...curr,
        shape: rotated,
        rotation: newRotation,
      },
    });
    runtime.emit(AudioEvents().PLAY_SOUND, { sound: 'ROTATE' });
  }

  // 5. 所有尝试都失败，什么都不做
};

export default rotate;
