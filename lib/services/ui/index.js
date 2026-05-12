import Base from '@/lib/core';
import Canvas from '@/lib/services/ui/core/canvas.js';
import HudElements from '@/lib/services/ui/hud/hud-elements.js';
import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';
import lazyRenderScene from '@/lib/services/ui/scene-manager/lazy-render-scene.js';
import renderClear from '@/lib/services/ui/board/render-clear.js';
import renderCountdown from '@/lib/services/ui/effects/render-countdown.js';
import renderLevelUp from '@/lib/services/ui/effects/render-level-up.js';
import renderNextPiece from '@/lib/services/ui/next/render-next-piece.js';
import resize from '@/lib/services/ui/core/resize.js';
import createHud from '@/lib/services/ui/hud/create-hud.js';

class UI extends Base {
  constructor(deps) {
    super();

    this.initialize(deps);
  }

  initialize(deps) {
    const { Elements } = deps;
    const { Hud, Main } = Elements;

    this.Hud = createHud(HudElements(Hud));
    this.Canvas = new Canvas(Main);

    this.dep(deps);
  }

  updateMode(mode) {
    this.Canvas.gameBoard.dataset.mode = mode;
  }

  updateHud() {
    const state = this.dep('Store').getState();
    const { mode, score, lines, level, highScore, needReset = false } = state;

    if (mode === 'main-menu' || needReset) {
      this.Hud.reset();
    }

    this.Hud.update({
      score,
      lines,
      level,
      highScore,
    });
  }

  tickHud(delta) {
    this.Hud.tick(delta);
  }

  lazyRender() {
    const state = this.dep('Store').getState();

    lazyRenderScene(this.Canvas, state);
  }

  render() {
    const state = this.dep('Store').getState();

    renderScene(this.Canvas, state);
  }

  resize() {
    resize(this.Canvas);
  }

  subscribe() {
    this.on('ui:update:mode', this._onUpdateMode);

    this.on('ui:update:hud', this._onUpdateHud);

    this.on('ui:resize', this._onResize);

    this.on('ui:render:next:piece', this._onRenderNextPiece);

    this.on('ui:render:countdown', this._onRenderCountdown);

    this.on('ui:render:clear', this._onRenderClear);

    this.on('ui:render:level:up', this._onRenderLevelUp);
  }

  _onUpdateMode = ({ mode }) => {
    this.updateMode(mode);
  };

  _onUpdateHud = () => {
    const state = this.dep('Store').getState();
    this.updateHud(state);
  };

  _onResize = () => {
    this.resize();
  };

  _onRenderNextPiece = () => {
    const state = this.dep('Store').getState();
    renderNextPiece(this.Canvas, state);
  };

  _onRenderCountdown = ({ state }) => {
    renderCountdown(this.Canvas, state);
  };

  _onRenderClear = ({ state }) => {
    renderClear(this.Canvas, state);
  };

  _onRenderLevelUp = ({ level, fireworks }) => {
    renderLevelUp(this.Canvas, level, fireworks);
  };
}

export default UI;
