import Replay from '@/lib/engine/replay.js';
import CommandQueue from '@/lib/command/command-queue.js';
import Command from '@/lib/command/command.js';
import { hasBlockingAnimation } from '@/lib/animations/system.js';

const dispatchInput = (event) => {
  const { action } = event;

  // 倒计时、升级，或者匹配不到按键行为
  if (hasBlockingAnimation(['countdown', 'level-up']) || !action) {
    return;
  }

  const cmd = new Command(action);
  const { type, payload } = cmd;

  CommandQueue.enqueue(cmd);

  // 👉 replay记录
  if (Replay.recording) {
    Replay.data.push({
      frame: Replay.frame,
      cmd: { type, payload },
    });
  }
};

export default dispatchInput;
