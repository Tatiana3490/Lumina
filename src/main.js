import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { LevelFear } from './scenes/LevelFear';
import { LevelHope } from './scenes/LevelHope';
import { LoadingScreen } from './scenes/LoadingScreen';
import { EndingScreen } from './scenes/EndingScreen';
import { PauseScene } from './scenes/PauseScene';
import { Settings } from './scenes/Settings';
import './style.css';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'app',
  backgroundColor: '#020205',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: [
    Boot,
    Preloader,
    LoadingScreen,
    MainMenu,
    Settings,
    Game,
    LevelFear,
    LevelHope,
    EndingScreen,
    PauseScene
  ]
};

export default new Phaser.Game(config);
