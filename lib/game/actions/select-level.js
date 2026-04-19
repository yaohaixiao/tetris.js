import EngineState from '@/lib/engine/state/engine-state.js';
import Sounds from '@/lib/audio/sounds.js';

/**
 * # 修改当前选中征地
 *
 * @function selectLevel
 * @param {number} level - 当前等级
 * @param {object} [state=EngineState] - 游戏状态. Default is `EngineState`
 * @returns {void}
 */
const selectLevel = (level, state = EngineState) => {
  state.level = level;
  Sounds.levelSelect();
};

export default selectLevel;
