import EventBus from '@/lib/core/event-bus';
import Sounds from '@/lib/services/audio/sounds.js';
import playBGM from '@/lib/services/audio/play-bgm.js';
import stopBGM from '@/lib/services/audio/stop-bgm.js';
import toggleBGM from '@/lib/services/audio/toggle-bgm.js';
import isFunction from '@/lib/utils/is-function.js';

const Audio = {
  Sounds,

  playBGM,

  stopBGM,

  toggleBGM,

  emit(event, handler) {
    EventBus.on(event, handler);
  },

  on(event, payload) {
    EventBus.on(event, payload);
  },

  off(event, handler) {
    EventBus.off(event, handler);
  },

  subscribe() {
    /* ---------- 背景音乐 ---------- */
    Audio.on('audio:play:bgm', Audio._onPlayBGM);
    Audio.on('audio:stop:bgm', Audio._onStopBGM);
    Audio.on('audio:toggle:bgm', Audio._onToggleBGM);

    /* ---------- 游戏音效 ---------- */
    Audio.on('audio:play:sound', Audio._onPlaySound);
  },

  unsubscribe() {
    /* ---------- 背景音乐 ---------- */
    Audio.off('audio:play:bgm', Audio._onPlayBGM);
    Audio.off('audio:stop:bgm', Audio._onStopBGM);
    Audio.off('audio:toggle:bgm', Audio._onToggleBGM);

    /* ---------- 游戏音效 ---------- */
    Audio.off('audio:play:sound', Audio._onPlaySound);
  },

  _onPlayBGM({ level, maxLevel = 99 }) {
    Audio.playBGM(level, maxLevel);
  },

  _onStopBGM() {
    Audio.stopBGM();
  },

  _onToggleBGM({ level, maxLevel = 99 }) {
    Audio.emit('audio:play:sound', { sound: 'BGM_TOGGLED' });
    Audio.toggleBGM(level, maxLevel);
  },

  _onPlaySound({ sound, lines }) {
    const handler = Audio.Sounds[sound];

    if (isFunction(handler)) {
      handler(lines);
    }
  },
};

export default Audio;
