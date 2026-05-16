import randomShape from '@/lib/game/utils/random-shape.js';

const getNextPiece = (game) => {
  const { Replay, Store } = game;

  if (Replay.playing) {
    return Replay.getNextPiece();
  }

  // 正常模式
  const state = Store.getState();
  const { next } = state;

  const curr = next
    ? {
        ...next,
        shape: next.shape.map((row) => [...row]),
      }
    : randomShape();

  return {
    curr,
    next: randomShape(),
  };
};

export default getNextPiece;
