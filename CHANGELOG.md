## [0.7.3](https://github.com/yaohaixiao/tetris.js/compare/0.7.2...0.7.3) (2026-05-07)


### Bug Fixes

* 修复调整 EventBus 后，将录无法结束的问题； ([a632710](https://github.com/yaohaixiao/tetris.js/commit/a632710bb44867ae96e1e852f892dcf9ecbf11b3))


## [0.7.2](https://github.com/yaohaixiao/tetris.js/compare/0.7.1...0.7.2) (2026-05-07)


### Bug Fixes

* 修复 EventBus 重构后，playBGM 一直播放同1曲背景音乐的问题；([368f993](https://github.com/yaohaixiao/tetris.js/commit/368f993afc5e4211042f50e34578fa741f7a2903))


### Features

* 调整代码，将游戏最大级别，游戏画布的 cols,rows 调整成可配置；([44513d9](https://github.com/yaohaixiao/tetris.js/commit/44513d933c5ecf92332818dab65ac2a8b12e19ca))
* 调整下落速度算法，改成达到最大管卡70%左右，就达到极限的线路速度，间隔 120ms 就下落1格； ([5ffab93](https://github.com/yaohaixiao/tetris.js/commit/5ffab93acabe1fad7731a4c4bdc6a610f6dada80))
* 添加新背景音乐曲子，调整曲目播放顺序，调整背景音乐播放细节，根据不同 wave 配置 gate； ([672b74c](https://github.com/yaohaixiao/tetris.js/commit/672b74cf79d742702f39bcefabb13a60e96430d2))


## [0.7.1](https://github.com/yaohaixiao/tetris.js/compare/0.7.0...0.7.1) (2026-05-07)

### Bug Fixes

- 修复 replay.update() 方法完毕设置 game-over 导致返回主菜单选择级别变结束界面的问题； ([528bbb9](https://github.com/yaohaixiao/tetris.js/commit/528bbb90f57c8d349d8f0812d259f61761cef047))
- 修复分数计算的错误：score: prev.score + CLEAR_LINE_SCORES[cleared] \*
  prev.level，调整为：score: prev.score + CLEAR_LINE_SCORES[cleared]
  ([cc9355a](https://github.com/yaohaixiao/tetris.js/commit/cc9355a86f170a6656098d5e83495fa717e41b85))

### Features

- 优化更新分数动画，将 highScore 也添加了动画，并且调整了分数变更的表现效果； ([70c504c](https://github.com/yaohaixiao/tetris.js/commit/70c504cfd1493aef9d9ae43a5ef2b3edc5869da1))

**提示：** 现在得 100000 以上的分数，难度大大增加了！

# [0.7.0](https://github.com/yaohaixiao/tetris.js/compare/0.6.1...0.7.0) (2026-05-05)

### Bug Fixes

- 修复 const {store} =
  Game 在第一桢结构导致的报错问题； ([af8b0c0](https://github.com/yaohaixiao/tetris.js/commit/af8b0c034af0301253ebbb3acdd51e032d4abc81))
- 修复上次发版后导致的无法更新 highScore 的 BUG
  ([a9849bb](https://github.com/yaohaixiao/tetris.js/commit/a9849bb12626e9c5b754bf9b7486482fbf113b13))

### Features

- 调整更新 highScore 分数机制，clearLines 后立刻对比触发 ([84087d1](https://github.com/yaohaixiao/tetris.js/commit/84087d1a9d357a3edc5122254ee5f116685d95c1))
- 添加从难度选择返回等级选择的按钮支持； ([0fa5a80](https://github.com/yaohaixiao/tetris.js/commit/0fa5a80c8719cdbb5de480b68aad4fcbbd8ed970))
- 添加游戏难度选择：easy:0 行，normal: 3 行，hard: 6 行，expert:
  9 行； ([0184b10](https://github.com/yaohaixiao/tetris.js/commit/0184b10c3009620ea108b05e697a02b75d857a74))
- 添加游戏手柄通过方向按钮上下键调整游戏等级； ([307b5d4](https://github.com/yaohaixiao/tetris.js/commit/307b5d48299da361650b6909491be7fd7824c383))

## [0.6.1](https://github.com/yaohaixiao/tetris.js/compare/0.6.0...0.6.1) (2026-05-04)

### Bug Fixes

- 修复 replay 模式下，无法按 ENTER 或者手柄的 START 回到主菜单的问题； ([fc8c0ed](https://github.com/yaohaixiao/tetris.js/commit/fc8c0ed0f151c1a7b424f0e96022e31d82934b27))

# [0.6.0](https://github.com/yaohaixiao/tetris.js/compare/0.5.2...0.6.0) (2026-05-04)

### Bug Fixes

- 修复 render-chinese-hour-animal.js 中凌晨 1点前取数错误的问题； ([f9b6396](https://github.com/yaohaixiao/tetris.js/commit/f9b63963154515fd6af6d84facd6b451e70a7c9f))

### Features

- 接入了 replay 功能，游戏结束，会自动重放之前的操作 ([a831ea6](https://github.com/yaohaixiao/tetris.js/commit/a831ea694adf844cb2ec94a372b4079d0629253a))
- 添加 gamepad-controller.js 模块，支持游戏手柄的控制游戏； ([4c64ae3](https://github.com/yaohaixiao/tetris.js/commit/4c64ae36e683672170dbf972a2c63a8f76bebd61))
- 完善 replay，将自动下落作为记录捕捉到回放数据中；将 replay 播放和游戏 tick 分离； ([79831cd](https://github.com/yaohaixiao/tetris.js/commit/79831cd4aea127afdc087255fc4dd415c8b7ebcd))
- 优化 Replay 回放效果，处理暂停的和升级界面的影响 ([0a09a17](https://github.com/yaohaixiao/tetris.js/commit/0a09a17ffc8c5e6e09769a031653506c4d37f735))

## [0.5.2](https://github.com/yaohaixiao/tetris.js/compare/0.5.1...0.5.2) (2026-05-01)

### Bug Fixes

- 去掉 clearImagesCache() 调整后多余的 URL.revoke 的处理； ([1114fbf](https://github.com/yaohaixiao/tetris.js/commit/1114fbfde67f96c82e508b5ed059c3fef4640579))
- 暂时无法完成重力效果，连续下落的逻辑，干脆干掉这个效果； ([4b39c47](https://github.com/yaohaixiao/tetris.js/commit/4b39c47d6f0d789c5013730ebceaa76e83b6c329))

### Features

- 调整游戏进行中的UI设计（12时辰文字的位置和大小） ([a4b9817](https://github.com/yaohaixiao/tetris.js/commit/a4b98172b601e5608a706edcb94a9b29255a58e4))
- 调整暂停界面 UI，添加新的3个表盘的配色；优化模式时钟的代码结构； ([8ab8110](https://github.com/yaohaixiao/tetris.js/commit/8ab8110288b446717d4ba7696c54adfb85cf0d9e))
- 优化背景音乐，添加多首背景音乐，根据级别播放不同的背景音乐 ([b5eeb01](https://github.com/yaohaixiao/tetris.js/commit/b5eeb010b7d0f8ee9a5299cff693c348704b852c))

## [0.5.1](https://github.com/yaohaixiao/tetris.js/compare/0.4.0...0.5.1) (2026-04-22)

### Bug Fixes

- 放弃重力下落，保持纯粹的经典（就是目前搞不定重力） ([c2a1a93](https://github.com/yaohaixiao/tetris.js/commit/c2a1a93db6755455317541cab16c817ff6121be2))
- 修复 formatTime 方法，hh 表示时没有补0； ([12a7627](https://github.com/yaohaixiao/tetris.js/commit/12a76278477b87336c856dfdd7737e64e03aab45))
- 修复 PausedAnimation 动画中 active 属性初始化错误导致的问题； ([9ab0057](https://github.com/yaohaixiao/tetris.js/commit/9ab0057df8cf9f7f1a400de5b5f6ce6d0c40fd76))
- 修复切换BGM失败的问题； ([570ff69](https://github.com/yaohaixiao/tetris.js/commit/570ff6926285887744c669a9abc782699ebbbe91))

### Features

- 给各给界面添加背景图片，丰富UI效果；完善重力下落算法； ([99498a5](https://github.com/yaohaixiao/tetris.js/commit/99498a51a174456def0e0abddd2cfa56cffc463e))
- 添加长度5的长条，并且添加1次减5层奖励1200分； ([04a2f1c](https://github.com/yaohaixiao/tetris.js/commit/04a2f1ce73e92c4701c814c0465912f89cc1c31c))

# [0.5.0](https://github.com/yaohaixiao/tetris.js/compare/0.4.0...0.5.0) (2026-04-21)

### Bug Fixes

- 修复 formatTime 方法，hh 表示时没有补0； ([12a7627](https://github.com/yaohaixiao/tetris.js/commit/12a76278477b87336c856dfdd7737e64e03aab45))
- 修复 PausedAnimation 动画中 active 属性初始化错误导致的问题； ([9ab0057](https://github.com/yaohaixiao/tetris.js/commit/9ab0057df8cf9f7f1a400de5b5f6ce6d0c40fd76))
- 修复切换BGM失败的问题； ([570ff69](https://github.com/yaohaixiao/tetris.js/commit/570ff6926285887744c669a9abc782699ebbbe91))

### Features

- 添加 replay.js 模块，准备添加回放功能； ([5e1aa68](https://github.com/yaohaixiao/tetris.js/commit/5e1aa682018ed6676c35df66f3086f1694e0f75c))
- 添加玩法，支持重力消减，即消减后，方块可以掉落到缝隙； ([4ba4025](https://github.com/yaohaixiao/tetris.js/commit/4ba402502a2c1c5af3b0219f4ce4353eeaaa2116))
- 添加长度5的长条，并且添加1次减5层奖励1200分； ([04a2f1c](https://github.com/yaohaixiao/tetris.js/commit/04a2f1ce73e92c4701c814c0465912f89cc1c31c))
- 优化代码架构，引入 Command
  Queue，解耦 input 输出与 action 行为的耦合； ([9566e22](https://github.com/yaohaixiao/tetris.js/commit/9566e22478b3f1885d2decc490746d56c867d4c0))
- n 如果是 null / undefined / NaN 会直接炸或输出 "NaN"；len <=
  0 或不是整数时没有保护；负数时补零行为不一定符合预期（比如 -3 →
  "-03"？） ([743c6d7](https://github.com/yaohaixiao/tetris.js/commit/743c6d746a14c744e4c1208b88982cc8c4b6c545))

# [0.4.0](https://github.com/yaohaixiao/tetris.js/compare/0.3.1...0.4.0) (2026-04-18)

### Bug Fixes

- 修复 renderHud 动画缓存的问题 ([cb0b3b3](https://github.com/yaohaixiao/tetris.js/commit/cb0b3b30e7d99c334aa2ad2a8a5593d2006eb2e8))
- 修复3个界面（主菜单、暂停、游戏结束），全局快捷键的禁用问题； ([bb11d82](https://github.com/yaohaixiao/tetris.js/commit/bb11d821fe5ed607aa4e041270bb377fcf13cae4))
- 修复碰撞检测 game-over 没有显示结束界面的问题； ([f397d29](https://github.com/yaohaixiao/tetris.js/commit/f397d2901fa9092d54a9d5f7bf33182edcad5e74))

### Features

- 更新动画，优化升级庆祝动画的显示 ([1b44308](https://github.com/yaohaixiao/tetris.js/commit/1b443088b162d749f383681e15dc1678e3343620))
- 添加 animation
  animationsSystem 处理动画渲染； ([ba9bc9f](https://github.com/yaohaixiao/tetris.js/commit/ba9bc9f396c93e8400f881010d5a525662f925cf))
- 添加游戏核心 engine 层，控制游戏整体逻辑；添加 inout 层，处理输入输出，解耦控制和UI的逻辑； ([9520086](https://github.com/yaohaixiao/tetris.js/commit/9520086f798b1cec0c2866c043592c415830acc4))

# [0.3.1](https://github.com/yaohaixiao/tetris.js/compare/0.3.0...0.4.0) (2026-04-13)

### Bug Fixes

- 修复选择了大于1的层级，游戏开始有，右侧数据面板的层级没有变化的问题； ([98bf058](https://github.com/yaohaixiao/tetris.js/commit/98bf058202f5a7350966af56786b0e1ca2d41399))

### Features

- 使用 requestAnimationFrame 替换 setInterval, 优化主程序动画性能 ([dcc48fb](https://github.com/yaohaixiao/tetris.js/commit/dcc48fbb70bfdab715584397b46cf3b6e033f320))

# [0.3.0](https://github.com/yaohaixiao/tetris.js/compare/0.2.0...0.3.0) (2026-04-12)

### Features

- 调整优化各个特效页面 ([a816d4b](https://github.com/yaohaixiao/tetris.js/commit/a816d4b5d809baea95724dbd4a8c4ffadd29f9cc))
- 调整游戏开始声音 ([283e5fe](https://github.com/yaohaixiao/tetris.js/commit/283e5fe2041dc9810c608a76d896ab25cb44eba2))
- 添加游戏开始倒计时特效 ([417e6ac](https://github.com/yaohaixiao/tetris.js/commit/417e6acf4e7e648acd77b99cb911392c84a1257c))
- 最大级别调整到 99 级 ([18a7ec2](https://github.com/yaohaixiao/tetris.js/commit/18a7ec2d59c6579dd563df7aa12c0811ff235a89))

# 0.2.0 (2026-04-11)

### Bug Fixes

- 修复 findFullLines() 在升级的时候，清理方块行数执行2次的问题 ([a5de47d](https://github.com/yaohaixiao/tetris.js/commit/a5de47d58d9183f9e432c702c411639775fe545d))
- 修复结束时，方块没有叠加到顶部 ([0005f85](https://github.com/yaohaixiao/tetris.js/commit/0005f854007ac6d7eed805225ffcca6f7e346479))

### Features

- 调整清理层的音频效果，改得更加清脆了 ([34feef6](https://github.com/yaohaixiao/tetris.js/commit/34feef6f2df0f26baf5b77493ab87157486ac1dd))
- 添加升级庆祝动画 ([b35bcd3](https://github.com/yaohaixiao/tetris.js/commit/b35bcd38fa77501e6dad2432abaf0c79b0717928))
- 添加消除行特效 ([18524bb](https://github.com/yaohaixiao/tetris.js/commit/18524bb601ee0a2c6033b1e43e6e6772799d3ba8))
