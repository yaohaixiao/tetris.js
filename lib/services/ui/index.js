import Canvas from '@/lib/services/ui/core/canvas.js';
import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';
import lazyRenderScene from '@/lib/services/ui/scene-manager/lazy-render-scene.js';
import renderClear from '@/lib/services/ui/board/render-clear.js';
import renderCountdown from '@/lib/services/ui/effects/render-countdown.js';
import renderLevelUp from '@/lib/services/ui/effects/render-level-up.js';
import renderNextPiece from '@/lib/services/ui/next/render-next-piece.js';
import resize from '@/lib/services/ui/core/resize.js';
import createHud from '@/lib/services/ui/hud/create-hud.js';

const UI = {
  Canvas,
  hud: createHud(),
  updateMode: (mode) => {
    Canvas.gameBoard.dataset.mode = mode;
  },
  updateHud(state) {
    const { mode, score, lines, level, highScore, needReset = false } = state;

    if (mode === 'main-menu' || needReset) {
      UI.hud.reset();
    }

    UI.hud.update({
      score,
      lines,
      level,
      highScore,
    });
  },
  tickHud(delta) {
    UI.hud.tick(delta);
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
  resize,
};

export default UI;
