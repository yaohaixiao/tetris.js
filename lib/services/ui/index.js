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
  /**
   * ## 构造函数
   *
   * @class
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    super(options);

    this.initialize(options);
  }

  initialize(options) {
    const { Elements } = options;
    const { Hud, Main } = Elements;

    this.Hud = createHud(HudElements(Hud));
    this.Canvas = new Canvas(Main);
  }

  updateMode(mode) {
    this.Canvas.gameBoard.dataset.mode = mode;
  }

  updateHud() {
    const state = this.Store.getState();
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
    const state = this.Store.getState();

    lazyRenderScene(this.Canvas, state);
  }

  render() {
    const state = this.Store.getState();

    renderScene(this.Canvas, state);
  }

  resize() {
    resize(this.Canvas);
  }

  subscribe() {
    const uuid = this.Game.id;

    /* ---------- DOM 绘制 ---------- */
    this.on(`ui:${uuid}:update:mode`, this._onUpdateMode);
    this.on(`ui:${uuid}:update:hud`, this._onUpdateHud);
    this.on(`ui:${uuid}:resize`, this._onResize);

    /* ---------- 动画特效 ---------- */
    this.on(`ui:${uuid}:render:next:piece`, this._onRenderNextPiece);
    this.on(`ui:${uuid}:render:countdown`, this._onRenderCountdown);
    this.on(`ui:${uuid}:render:clear`, this._onRenderClear);
    this.on(`ui:${uuid}:render:level:up`, this._onRenderLevelUp);
  }

  unsubscribe() {
    const uuid = this.Game.id;

    /* ---------- DOM 绘制 ---------- */
    this.off(`ui:${uuid}:update:mode`, this._onUpdateMode);
    this.off(`ui:${uuid}:update:hud`, this._onUpdateHud);
    this.off(`ui:${uuid}:resize`, this._onResize);

    /* ---------- 动画特效 ---------- */
    this.off(`ui:${uuid}:render:next:piece`, this._onRenderNextPiece);
    this.off(`ui:${uuid}:render:countdown`, this._onRenderCountdown);
    this.off(`ui:${uuid}:render:clear`, this._onRenderClear);
    this.off(`ui:${uuid}:render:level:up`, this._onRenderLevelUp);
  }

  _onUpdateMode = ({ mode }) => {
    this.updateMode(mode);
  };

  _onUpdateHud = () => {
    const state = this.Store.getState();
    this.updateHud(state);
  };

  _onResize = () => {
    this.resize();
  };

  _onRenderNextPiece = () => {
    const state = this.Store.getState();
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
