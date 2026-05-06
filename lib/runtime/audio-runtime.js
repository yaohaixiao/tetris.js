import EventBus from '@/lib/core/event-bus';

const AudioRuntime = {
  subscribe() {
    EventBus.on('audio:toggle:bgm', ({level}) => {
      Audio.toggleBGM(level);
    })
  }
}

export default AudioRuntime;
