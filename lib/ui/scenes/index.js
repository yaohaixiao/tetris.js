import mainMenuScene from '@/lib/ui/scenes/main-menu-scene';
import pausedScene from '@/lib/ui/scenes/paused-scene';
import gameOverScene from '@/lib/ui/scenes/game-over-scene';
import playingScene from '@/lib/ui/scenes/playing-scene';

const scenes = {
  'main-menu': () => {
    mainMenuScene();
  },

  paused: () => {
    pausedScene();
  },

  'game-over': () => {
    gameOverScene();
  },

  playing: () => {
    playingScene();
  },
};

export default scenes;
