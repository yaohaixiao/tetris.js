import {
  KICK_I,
  KICK_I5,
  KICK_JLSZT,
} from '@/lib/game/constants/srs-kick-data.js';

/**
 * 根据方块类型获取对应的墙踢数据
 *
 * @param {string} type - 方块类型名（'I' | 'O' | 其他）
 * @returns {number[][][] | null} 墙踢数据，O 型返回 null
 */
const getKickData = (type) => {
  if (type === 'I') {
    return KICK_I;
  }

  if (type === 'I5') {
    return KICK_I5;
  }

  if (type === 'O') {
    return null;
  }

  return KICK_JLSZT;
};

export default getKickData;
