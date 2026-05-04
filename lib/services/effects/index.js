import startCountdown from '@/lib/services/effects/countdown.js';
import startClearLines from '@/lib/services/effects/clear-lines.js';
import { startPaused, stopPaused } from '@/lib/services/effects/paused.js';
import startLevelUp from '@/lib/services/effects/level-up.js';

const Effects = {
  startCountdown,
  startClearLines,
  startPaused,
  stopPaused,
  startLevelUp,
};

export default Effects;
