import startCountdown from '@/lib/services/effects/countdown.js';
import startClearLines from '@/lib/services/effects/clear-lines.js';
import { startPaused, stopPaused } from '@/lib/services/effects/paused.js';
import startLevelUp from '@/lib/services/effects/level-up.js';
import EventBus from '@/lib/core/event-bus/index.js';

const Effects = {
  startCountdown,
  startClearLines,
  startPaused,
  stopPaused,
  startLevelUp,
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

export default Effects;
