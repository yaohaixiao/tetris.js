import setBeginningState from '@/lib/game/actions/set-beginning-state';
import Game from '@/lib/game';

jest.mock('@/lib/game', () => ({
  store: {
    setState: jest.fn(),
    getState: jest.fn(),
    setBeginningBoard: jest.fn(),
    generateBoard: jest.fn(),
  },
}));

describe('setBeginningState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('设置 main-menu 模式', () => {
    setBeginningState('main-menu');

    expect(Game.store.setState).toHaveBeenCalledWith({
      mode: 'main-menu',
      score: 0,
      lines: 0,
      level: 1,
      next: null,
    });

    // main-menu 不生成棋盘
    expect(Game.store.generateBoard).not.toHaveBeenCalled();
    expect(Game.store.setBeginningBoard).not.toHaveBeenCalled();
  });

  test('设置 playing 模式', () => {
    const mockBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
    Game.store.generateBoard.mockReturnValue(mockBoard);

    setBeginningState('playing', 5);

    expect(Game.store.setState).toHaveBeenCalledWith({
      mode: 'playing',
      score: 0,
      lines: 0,
      level: 5,
      next: null,
    });

    expect(Game.store.generateBoard).toHaveBeenCalled();
    expect(Game.store.setBeginningBoard).toHaveBeenCalledWith(mockBoard);
  });

  test('设置 game-over 模式', () => {
    setBeginningState('game-over');

    expect(Game.store.setState).toHaveBeenCalledWith({
      mode: 'game-over',
      score: 0,
      lines: 0,
      level: 1,
      next: null,
    });

    expect(Game.store.generateBoard).not.toHaveBeenCalled();
  });

  test('设置 paused 模式', () => {
    setBeginningState('paused');

    expect(Game.store.setState).toHaveBeenCalledWith({
      mode: 'paused',
      score: 0,
      lines: 0,
      level: 1,
      next: null,
    });

    expect(Game.store.generateBoard).not.toHaveBeenCalled();
  });

  test('默认 level 为 1', () => {
    setBeginningState('playing');

    expect(Game.store.setState).toHaveBeenCalledWith(
      expect.objectContaining({ level: 1 })
    );
  });

  test('自定义 level', () => {
    setBeginningState('playing', 10);

    expect(Game.store.setState).toHaveBeenCalledWith(
      expect.objectContaining({ level: 10 })
    );
  });
});
