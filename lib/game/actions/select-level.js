import Engine from '@/lib/engine/engine.js';
import Sounds from '@/lib/audio/sounds.js';

/**
 * # 修改当前选中征地
 *
 * @function selectLevel
 * @param {number} level - 当前等级
 * @returns {void}
 */
const selectLevel = (level) => {
  Engine.setLevel(level);
  Sounds.levelSelect();
};

export default selectLevel;
