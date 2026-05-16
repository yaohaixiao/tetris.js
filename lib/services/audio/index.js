import Base from '@/lib/core';
import Sounds from '@/lib/services/audio/sounds.js';
import playBGM from '@/lib/services/audio/play-bgm.js';
import stopBGM from '@/lib/services/audio/stop-bgm.js';
import toggleBGM from '@/lib/services/audio/toggle-bgm.js';
import isFunction from '@/lib/utils/is-function.js';

class Audio extends Base {
  constructor(options) {
    super(options);

    this.initialize(options);
  }

  initialize(options) {
    const Context = new AudioContext();

    this.Context = Context;

    this.Sounds = new Sounds({
      ...options,
      Context,
    });

    this.bgmSchedulerId = 0;
  }

  playBGM(level, maxLevel) {
    playBGM(this, level, maxLevel);
  }

  stopBGM() {
    stopBGM(this);
  }

  toggleBGM(level, maxLevel) {
    toggleBGM(this, level, maxLevel);
  }

  subscribe() {
    /* ---------- 背景音乐 ---------- */
    this.on('audio:play:bgm', this._onPlayBGM);
    this.on('audio:stop:bgm', this._onStopBGM);
    this.on('audio:toggle:bgm', this._onToggleBGM);

    /* ---------- 游戏音效 ---------- */
    this.on('audio:play:sound', this._onPlaySound);
  }

  unsubscribe() {
    /* ---------- 背景音乐 ---------- */
    this.off('audio:play:bgm', this._onPlayBGM);
    this.off('audio:stop:bgm', this._onStopBGM);
    this.off('audio:toggle:bgm', this._onToggleBGM);

    /* ---------- 游戏音效 ---------- */
    this.off('audio:play:sound', this._onPlaySound);
  }

  _onPlayBGM = ({ level, maxLevel = 99 }) => {
    this.playBGM(level, maxLevel);
  };

  _onStopBGM = () => {
    this.stopBGM();
  };

  _onToggleBGM = ({ level, maxLevel = 99 }) => {
    this.emit('audio:play:sound', { sound: 'BGM_TOGGLED' });
    this.toggleBGM(level, maxLevel);
  };

  _onPlaySound = ({ sound, lines }) => {
    const handler = this.Sounds[sound];

    if (isFunction(handler)) {
      handler(lines);
    }
  };
}

export default Audio;
