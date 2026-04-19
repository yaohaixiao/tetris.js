import EngineState from '@/lib/engine/state/engine-state.js';
import renderActiveOnly from '@/lib/ui/board/render-active-only.js';
import renderNextPiece from '@/lib/ui/next/render-next-piece.js';

const renderPlaying = (state = EngineState) => {
  renderActiveOnly(state);
  renderNextPiece(state.next);
};

export default renderPlaying;
