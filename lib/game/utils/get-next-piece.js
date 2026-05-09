import Game from '@/lib/game/index.js';
import Replay from '../../runtime/replay-controller.js';
import randomShape from '@/lib/game/utils/random-shape.js';

const getNextPiece = () => {
  // replay 模式
  if (Replay.playing) {
    const piece = Replay.pieceSequence[Replay.pieceIndex++];

    // 防止 Replay.pieceIndex++ 越界
    if (!piece) {
      return { curr: null, next: null };
    }

    const next = Replay.pieceSequence[Replay.pieceIndex] || null;

    return { curr: piece, next };
  }

  // 正常模式
  const state = Game.store.getState();
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
