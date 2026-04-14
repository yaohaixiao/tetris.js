// 倒计时状态
const countdown = {
  show: false,
  number: 3,
  scale: 4,
  count: 0,
  rafId: null,
  timestamp: 0,
};

const clock = {
  rafId: null,
  count: 0,
  timestamp: 0,
};

const clear = {
  rafId: null,
  lines: [],
};

const levelUp = {
  show: false,
  timer: 0,
  fireworks: [],
};

const Effects = {
  countdown,
  clock,
  clear,
  levelUp,
};

export default Effects;
