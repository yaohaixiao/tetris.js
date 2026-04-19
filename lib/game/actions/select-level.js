import Sounds from '@/lib/audio/sounds.js';

/**
 * # 修改当前选中征地
 *
 * @function selectLevel
 * @param {number} level - 当前等级
 * @param {object} state - 游戏状态. Default is `EngineState`
 * @returns {void}
 */
const selectLevel = (level, state) => {
  state.level = level;
  Sounds.levelSelect();
};

export default selectLevel;
