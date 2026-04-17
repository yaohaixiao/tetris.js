import Sounds from '../audio/sounds.js';
import renderCountdown from '../ui/render-countdown.js';
import beginPlaying from '../core/begin-playing.js';
import setGameStateMode from '../state/set-game-state-mode.js';

const CountdownAnimation = () => {
  const state = {
    show: true,
    number: 3,
    scale: 4,
    count: 0,
    acc: 0,
  };

  return {
    // UI 层
    layer: 100,
    // 阻塞游戏
    blocking: true,
    name: 'countdown',

    update(delta) {
      state.acc += delta;

      // 控制节奏（等价 STEP_INTERVAL）
      if (state.acc < 0.01) {
        return true;
      }
      state.acc = 0;

      renderCountdown(state);

      state.count++;
      state.scale = Math.max(1, state.scale - 0.4);

      // 每一轮数字变化
      if (state.count >= 50) {
        state.count = 0;
        state.number--;
        state.scale = 4;

        if (state.number >= 1) {
          Sounds.countdown();
        }
      }

      // 结束条件
      if (state.number <= 0) {
        // 退出等级选择状态，进入游戏主界面
        setGameStateMode('playing');
        beginPlaying();
        return false;
      }

      return true;
    },

    render() {
      renderCountdown(state);
    },
  };
};

export default CountdownAnimation;
