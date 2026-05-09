import Sounds from '@/lib/services/audio/sounds.js';
import playBGM from '@/lib/services/audio/play-bgm.js';
import stopBGM from '@/lib/services/audio/stop-bgm.js';
import toggleBGM from '@/lib/services/audio/toggle-bgm.js';
import EventBus from '@/lib/core/event-bus/index.js';

const Audio = {
  Sounds,
  playBGM,
  stopBGM,
  toggleBGM,
  subscribe() {
    EventBus.on('audio:play:bgm', ({ level }) => {
      Audio.playBGM(level);
    });

    EventBus.on('audio:stop:bgm', () => {
      Audio.stopBGM();
    });

    EventBus.on('audio:toggle:bgm', ({ level }) => {
      Audio.toggleBGM(level);
    });

    EventBus.on('audio:sounds:level:start', () => {
      Audio.Sounds.levelStart();
    });

    EventBus.on('audio:sounds:game:over', () => {
      Audio.Sounds.gameOver();
    });

    EventBus.on('audio:sounds:fall', () => {
      Audio.Sounds.fall();
    });

    EventBus.on('audio:sounds:rotate', () => {
      Audio.Sounds.rotate();
    });

    EventBus.on('audio:sounds:move', () => {
      Audio.Sounds.move();
    });

    EventBus.on('audio:sounds:drop', () => {
      Audio.Sounds.drop();
    });

    EventBus.on('audio:sounds:pause', () => {
      Audio.Sounds.pause();
    });

    EventBus.on('audio:sounds:resume', () => {
      Audio.Sounds.resume();
    });

    EventBus.on('audio:sounds:clear', ({ lines }) => {
      Audio.Sounds.clear(lines);
    });

    EventBus.on('audio:sounds:second:tick', () => {
      Audio.Sounds.secondTick();
    });

    EventBus.on('audio:sounds:level:up', () => {
      Audio.Sounds.levelUp();
    });

    EventBus.on('audio:sounds:level:select', () => {
      Audio.Sounds.levelSelect();
    });

    EventBus.on('audio:sounds:difficulty:select', () => {
      Audio.Sounds.difficultySelect();
    });

    EventBus.on('audio:sounds:countdown', () => {
      Audio.Sounds.countdown();
    });
  },
};

export default Audio;
