import GameState from '@/lib/game/state/game-state.js';
import renderActiveOnly from '@/lib/ui/board/render-active-only.js';
import renderNextPiece from '@/lib/ui/next/render-next-piece.js';

const renderPlaying = () => {
  renderActiveOnly();
  renderNextPiece(GameState.next);
};

export default renderPlaying;
