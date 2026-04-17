const ACTION_MAP = {
  arrowleft: 'MOVE_LEFT',
  arrowright: 'MOVE_RIGHT',
  arrowdown: 'MOVE_DOWN',
  arrowup: 'ROTATE',
  ' ': 'DROP',

  m: 'TOGGLE_MUSIC',
  p: 'TOGGLE_PAUSE',
  r: 'RESTART',
  q: 'QUIT',

  1: 'LEVEL_ONE',
  2: 'LEVEL_TWO',
  3: 'LEVEL_THREE',
  4: 'LEVEL_FOUR',
  5: 'LEVEL_FIVE',
  6: 'LEVEL_SIX',
  7: 'LEVEL_SEVEN',
  8: 'LEVEL_EIGHT',
  9: 'LEVEL_NINE',
  t: 'LEVEL_TEN',

  enter: 'CONFIRM',
};

const resolveInputAction = (key) => {
  const action = ACTION_MAP[key];

  if (!action) {
    return null;
  }

  return action || null;
};

export default resolveInputAction;
