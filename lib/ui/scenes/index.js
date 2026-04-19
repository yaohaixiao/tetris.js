import mainMenuScene from '@/lib/ui/scenes/main-menu-scene';
import pausedScene from '@/lib/ui/scenes/paused-scene';
import gameOverScene from '@/lib/ui/scenes/game-over-scene';
import playingScene from '@/lib/ui/scenes/playing-scene';

const scenes = {
  'main-menu': (state) => {
    mainMenuScene(state);
  },

  paused: (state) => {
    pausedScene(state);
  },

  'game-over': (state) => {
    gameOverScene(state);
  },

  playing: (state) => {
    playingScene(state);
  },
};

export default scenes;
