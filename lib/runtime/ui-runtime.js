import EventBus from '@/lib/core/event-bus';
import UI from '@/lib/services/ui';

const UIRuntime = {
  subscribe() {
    EventBus.on('resize', (state) => {
      UI.resize(state);
    });
  }
}

export default UIRuntime;
