const setBeginningState = (game, mode, level = 1) => {
  const { Store } = game;

  game.emit('ui:update:mode', { mode });

  Store.setState({
    mode,
    score: 0,
    lines: 0,
    level,
    next: null,
  });

  // 开始游戏时，绘制选择的难度的方块
  if (mode === 'playing') {
    Store.setBeginningBoard(Store.generateBoard());
  }
};

export default setBeginningState;
