import { hasBlockingAnimation } from '@/lib/animations/system.js';
import CommandQueue from '@/lib/command/command-queue.js';
import Command from '@/lib/command/command.js';

const dispatchInput = (event) => {
  const { action } = event;

  // 倒计时、升级，或者匹配不到按键行为
  if (hasBlockingAnimation(['countdown', 'level-up']) || !action) {
    return;
  }

  CommandQueue.enqueue(new Command(action));
};

export default dispatchInput;
