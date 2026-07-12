import { AudioEvents } from '@/lib/events/event-catalog.js';
import getKickData from '@/lib/game/logic/rotate/get-kick-data.js';
import computeNewRotation from '@/lib/game/logic/rotate/compute-new-rotation.js';
import computeRotatedShape from '@/lib/game/logic/rotate/compute-rotated-shape.js';
import tryKickRotation from '@/lib/game/logic/rotate/try-kick-rotation.js';
import tryNormalRotation from '@/lib/game/logic/rotate/try-normal-rotation.js';

/**
 * ============================================================
 *
 * # 方块旋转（带 SRS 墙踢 + 锁定延迟重置 + T-Spin 标记）
 *
 * ============================================================
 *
 * 实现俄罗斯方块的旋转机制，支持顺时针和逆时针旋转， 并集成 SRS（Standard Rotation System）墙踢系统。
 *
 * 当方块旋转时遇到障碍物（边界或其他方块），会依次尝试一系列偏移位置， 找到第一个无碰撞的位置应用旋转。所有偏移都失败时放弃旋转，方块保持原样。
 *
 * ## 处理流程
 *
 * | 步骤 | 操作         | 说明                                 |
 * | :--- | :----------- | :----------------------------------- |
 * | 1    | 类型检查     | O 型方块无需旋转，直接返回           |
 * | 2    | 计算旋转形状 | 根据方向调用对应的旋转函数生成新形状 |
 * | 3    | SRS 墙踢尝试 | 遍历偏移表，找到第一个可用位置       |
 * | 4    | 原地旋转尝试 | 所有偏移失败时尝试无偏移旋转         |
 * | 5    | 放弃旋转     | 所有尝试失败，方块保持原样           |
 *
 * ## T-Spin 标记
 *
 * 旋转成功后，在 curr 对象上设置 _lastAction = 'rotate'。 该标记在方块锁定时被 detectTSpin 读取， 用于判定
 * T-Spin（要求方块最后一次操作必须是旋转）。
 *
 * ## SRS 墙踢系统
 *
 * 不同方块类型有不同的偏移表：
 *
 * - I 型：使用 KICK_I 数据（5 个偏移，偏移量较大）
 * - I5 型：使用 KICK_I5 数据（5 格加长版专用）
 * - J/L/S/Z/T 型：使用 KICK_JLSZT 数据（5 个偏移）
 * - O 型：无墙踢数据，旋转后形状不变
 *
 * ## 锁定延迟重置
 *
 * 旋转成功后自动重置锁定延迟计时器 _lockTimer， 延长方块触底后的可操作时间。
 *
 * @function rotate
 * @param {object} runtime - 游戏运行时对象
 * @param {number} [direction=1] - 旋转方向：1=顺时针，-1=逆时针. Default is `1`
 * @returns {void}
 */
const rotate = (runtime, direction = 1) => {
  const { Store } = runtime;
  const { curr } = Store.getState();

  // 步骤 1：O 型方块跳过
  if (curr?.type === 'O') return;

  // 步骤 2：计算旋转后的数据
  const rotated = computeRotatedShape(curr.shape, direction);
  const newRotation = computeNewRotation(curr.rotation, direction);
  const kickData = getKickData(curr.type);
  const AE = AudioEvents();

  // 步骤 3：尝试 SRS 墙踢
  if (kickData?.length) {
    const tests = kickData[(curr.rotation ?? 0) % 4];

    if (
      tests?.length &&
      tryKickRotation(runtime, curr, rotated, newRotation, tests)
    ) {
      curr._lastAction = 'rotate';
      runtime.emit(AE.PLAY_SOUND, { sound: 'ROTATE' });
      return;
    }
  }

  // 步骤 4：尝试原地旋转
  if (tryNormalRotation(runtime, curr, rotated, newRotation)) {
    curr._lastAction = 'rotate';
    runtime.emit(AE.PLAY_SOUND, { sound: 'ROTATE' });
  }

  // 步骤 5：放弃旋转
};

export default rotate;
