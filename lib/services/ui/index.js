import BOARD from '@/lib/services/ui/constants/board.js';
import FIREWORK_COLORS from '@/lib/services/ui/constants/firework-colors.js';
import Canvas from '@/lib/services/ui/core/canvas.js';
import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';
import lazyRenderScene from '@/lib/services/ui/scene-manager/lazy-render-scene.js';
import renderHud from '@/lib/services/ui/hud/render-hud.js';
import renderClear from '@/lib/services/ui/board/render-clear.js';
import renderCountdown from '@/lib/services/ui/effects/render-countdown.js';
import renderLevelUp from '@/lib/services/ui/effects/render-level-up.js';
import renderNextPiece from '@/lib/services/ui/next/render-next-piece.js';
import resize from '@/lib/services/ui/core/resize.js';

const UI = {
  CONSTANTS: {
    BOARD,
    FIREWORK_COLORS,
  },
  Canvas,
  updateHud(state) {
    renderHud(state);
  },
  lazyRender(state) {
    lazyRenderScene(state);
  },
  render(state) {
    renderScene(state);
  },
  renderClear,
  renderCountdown,
  renderLevelUp,
  renderNextPiece,
  resize(state) {
    resize();
    UI.render(state);
  },
};

export default UI;
