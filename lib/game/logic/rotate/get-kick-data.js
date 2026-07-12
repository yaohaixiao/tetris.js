import {
  KICK_I,
  KICK_I5,
  KICK_JLSZT,
} from '@/lib/game/constants/srs-kick-data.js';

/**
 * ============================================================
 *
 * # 根据方块类型获取对应的墙踢数据
 *
 * ============================================================
 *
 * 不同方块类型使用不同的 SRS 墙踢偏移表， 此函数根据类型名返回对应的偏移数据。
 *
 * ## 类型映射
 *
 * | 类型 | 墙踢数据   | 说明                        |
 * | :--- | :--------- | :-------------------------- |
 * | I    | KICK_I     | 标准 I 型，偏移量较大（±2） |
 * | I5   | KICK_I5    | 五连 I 型，独立偏移表       |
 * | O    | null       | O 型旋转后形状不变，无墙踢  |
 * | 其他 | KICK_JLSZT | J/L/S/Z/T 共用标准偏移表    |
 *
 * @function getKickData
 * @param {string} type - 方块类型名
 * @returns {number[][][] | null} 墙踢偏移数据，O 型返回 null
 */
const getKickData = (type) => {
  // I 型方块：偏移量较大（±2）
  if (type === 'I') {
    return KICK_I;
  }

  // I5 型方块：独立偏移表
  if (type === 'I5') {
    return KICK_I5;
  }

  // O 型方块：旋转后形状不变，无墙踢
  if (type === 'O') {
    return null;
  }

  // J/L/S/Z/T 型：共用标准偏移表
  return KICK_JLSZT;
};

export default getKickData;
