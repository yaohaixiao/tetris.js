import InputRoutes from './input-routes.js';
import { hasBlockingAnimation } from '../animations/system.js';
import consumeGlobalShortcut from '@/lib/input/actions/consume-global-shortcut.js';
import getGameStateMode from '../state/get-game-state-mode.js';

const dispatchInput = (event) => {
  const { action } = event;
  const mode = getGameStateMode();

  // 倒计时、升级，或者匹配不到按键行为
  if (
    hasBlockingAnimation(['countdown', 'level-up']) ||
    !action ||
    consumeGlobalShortcut(action)
  ) {
    return;
  }

  const handler = InputRoutes[mode];

  handler?.(action);
};

export default dispatchInput;
