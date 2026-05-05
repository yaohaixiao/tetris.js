import Game from '@/lib/game';

const setBeginningState = (mode, level = 1) => {
  const { store } = Game;

  store.setState({
    mode,
    score: 0,
    lines: 0,
    level,
    next: null,
  });

  // 开始游戏时，绘制选择的难度的方块
  if (mode === 'playing') {
    store.setBeginningBoard(store.generateBoard());
  }
};

export default setBeginningState;
