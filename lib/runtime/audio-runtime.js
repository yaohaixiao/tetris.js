import EventBus from '@/lib/core/event-bus';
import Audio from '@/lib/services/audio/index.js';

const AudioRuntime = {
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

export default AudioRuntime;
