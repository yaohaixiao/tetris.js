# tetris.js

[![npm version](https://img.shields.io/npm/v/@yaohaixiao/tetris.js)](https://www.npmjs.com/package/@yaohaixiao/tetris.js)
[![prettier code style](https://img.shields.io/badge/code_style-prettier-07b759.svg)](https://prettier.io)
[![MIT License](https://img.shields.io/github/license/yaohaixiao/tetris.js.svg)](https://github.com/yaohaixiao/tetris.js/blob/master/LICENSE)

tetris.js - 一款 JavaScript 开发的仿 FC 经典俄罗斯方块游戏

![俄罗斯方块游戏截图](./img/screen-shot.png)

## Features

- 游戏控制：
  - 按键控制：
    - Enter：开始游戏；
    - ↑：转动方块；
    - ← →：移动方块；
    - ↓：加速下落；
    - SPACE：迅速落底；
    - M：暂停/继续播放背景音乐；
    - P：暂停/继续游戏；
    - R: 重新开始游戏；
    - Q: 强制结束游戏；
  - 等级控制：
    - 等级选择：
      - 普通等级选择：按 1-9 键选择等级；
      - 特殊等级选择：按 T 键，选择 10 级；
    - 最高等级：99 级;
- 游戏特效：
  - 开始特效：等级选择后，播放倒计时动画；
  - 消除特效：消除方块时，播放消除层闪动动画；
  - 升级特效：进入下一级时，播放庆祝动画；
  - 暂停特效：暂停游戏时时，播放暂停动画；
- 游戏音效：
  - 等级选择音效；
  - 等级开始音效；
  - 开始倒计时音效；
  - 方块移动音效；
  - 方块旋转音效；
  - 方块快速下落音效；
  - 方块落地音效；
  - 方块消除音效；
  - 升级庆祝音效；
  - 暂停游戏音效；
  - 暂停时钟音效；
  - 恢复游戏音效；
  - 游戏结束音效；
  - 背景音乐开/关音效；
  - 背景音乐；
- 游戏界面：自适应浏览器窗口大小
  - 预览方块（右侧上方）：，显示下一个出现的方块；
  - 数据显示（右侧中间）：
    - 当前分数；
    - 当前等级；
    - 消减行数；
    - 最好分数；
  - 游戏快捷键（右侧下方）：显示游戏常用的快捷键说明；
- 数据存储：本地缓存最高分数；

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" width="24"/>](#) Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" width="24"/>](#) Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" width="24"/>](#) Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" width="24"/>](#) Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" width="24"/>](#) Opera |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 128 – 131                                                                                                              | 130 – 132                                                                                                                       | 109 – 131                                                                                                                    | 17.5 – 18.1                                                                                                                  | 113 – 114                                                                                                                 |

祝：玩得愉快！

## License

- tetris.js - Licensed under
  [MIT License](http://opensource.org/licenses/mit-license.html).

- Press Start 2P fonts (GOOGLE) - Licensed under [OFL License](./font/OFL.txt)
