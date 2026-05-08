import EventBus from '@/lib/core/event-bus';
import UI from '@/lib/services/ui';

const UIRuntime = {
  subscribe() {
    EventBus.on('ui:resize', () => {
      UI.resize();
    });

    EventBus.on('ui:render:next:piece', ({ state }) => {
      UI.renderNextPiece(state);
    });

    EventBus.on('ui:update:hud', ({ state }) => {
      UI.updateHud(state);
    });

    EventBus.on('ui:render:countdown', ({ state }) => {
      UI.renderCountdown(state);
    });

    EventBus.on('ui:render:clear', ({ state }) => {
      UI.renderClear(state);
    });

    EventBus.on('ui:render:level:up', ({ level, fireworks }) => {
      UI.renderLevelUp(level, fireworks);
    });

    EventBus.on('ui:update:mode', ({ mode }) => {
      UI.updateMode(mode);
    });
  },
};

export default UIRuntime;
