import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';

const GameRuntime = {
  subscribe: () => {
    EventBus.on('game:update:gamepad:connected', ({ connected }) => {
      Game.store.setGamepadConnected(connected);
    });

    EventBus.on('game:update:mode', ({ mode }) => {
      Game.store.setMode(mode);
    });

    EventBus.on('game:update:level', ({ level }) => {
      Game.store.setLevel(level);
    });

    EventBus.on('game:select:level', ({ level }) => {
      Game.selectLevel(level);
    });

    EventBus.on('game:switch:difficulty', () => {
      Game.switchToDifficulty();
    });

    EventBus.on('game:select:difficulty', ({ difficulty }) => {
      Game.selectDifficulty(difficulty);
    });

    EventBus.on('game:switch:to:main:menu', () => {
      Game.switchToMainMenu();
    });

    EventBus.on('game:start', () => {
      Game.start();
    });

    EventBus.on('game:toggle:pause', () => {
      Game.togglePause();
    });

    EventBus.on('game:reset', () => {
      Game.reset();
    });

    EventBus.on('game:restart', () => {
      Game.restart();
    });

    EventBus.on('game:over', () => {
      Game.over();
    });

    EventBus.on('game:move', ({ ox, oy }) => {
      Game.move(ox, oy);
    });

    EventBus.on('game:rotate', () => {
      Game.rotate();
    });

    EventBus.on('game:drop', () => {
      Game.drop();
    });

    EventBus.on('game:tick', () => {
      Game.tick();
    });

    EventBus.on('game:toggle:bgm', () => {
      const level = Game.store.getLevel();
      EventBus.emit('audio:toggle:bgm', {level});
    });
  }
};

export default GameRuntime;
