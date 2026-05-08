import togglePause from '@/lib/game/core/toggle-pause';
import Game from '@/lib/game';
import pause from '@/lib/game/core/pause';
import play from '@/lib/game/core/play';

jest.mock('@/lib/game', () => ({
  store: {
    getMode: jest.fn(() => 'playing'),
  },
}));

jest.mock('@/lib/game/core/pause', () => jest.fn());
jest.mock('@/lib/game/core/play', () => jest.fn());

describe('togglePause', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('playing 模式时调用 pause', () => {
    Game.store.getMode.mockReturnValue('playing');

    togglePause();

    expect(pause).toHaveBeenCalled();
    expect(play).not.toHaveBeenCalled();
  });

  test('paused 模式时调用 play', () => {
    Game.store.getMode.mockReturnValue('paused');

    togglePause();

    expect(play).toHaveBeenCalled();
    expect(pause).not.toHaveBeenCalled();
  });

  test('main-menu 模式时返回 false', () => {
    Game.store.getMode.mockReturnValue('main-menu');

    const result = togglePause();

    expect(result).toBe(false);
  });

  test('replay 模式时返回 false', () => {
    Game.store.getMode.mockReturnValue('replay');

    const result = togglePause();

    expect(result).toBe(false);
  });

  test('game-over 模式时返回 false', () => {
    Game.store.getMode.mockReturnValue('game-over');

    const result = togglePause();

    expect(result).toBe(false);
  });
});
