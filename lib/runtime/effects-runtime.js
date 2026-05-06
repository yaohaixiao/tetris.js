import EventBus from '@/lib/core/event-bus';
import Effects from '@/lib/services/effects';

const EffectsRuntime = {
  subscribe(dependencies) {
    const { gameBoard } = dependencies;

    EventBus.on('effects:start:countdown', () => {
      Effects.startCountdown();
    });

    EventBus.on('effects:start:paused', () => {
      Effects.startPaused();
    });

    EventBus.on('effects:stop:paused', () => {
      Effects.stopPaused();
    });

    EventBus.on('effects:start:clear:lines', ({ linesToClear }) => {
      Effects.startClearLines(linesToClear);
    });

    EventBus.on('effects:start:level:up', ({ level }) => {
      Effects.startLevelUp(gameBoard, level);
    });
  },
};

export default EffectsRuntime;
