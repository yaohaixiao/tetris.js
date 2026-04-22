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

- 修复 clearLines() 在升级的时候，清理方块行数执行2次的问题 ([a5de47d](https://github.com/yaohaixiao/tetris.js/commit/a5de47d58d9183f9e432c702c411639775fe545d))
- 修复结束时，方块没有叠加到顶部 ([0005f85](https://github.com/yaohaixiao/tetris.js/commit/0005f854007ac6d7eed805225ffcca6f7e346479))

### Features

- 调整清理层的音频效果，改得更加清脆了 ([34feef6](https://github.com/yaohaixiao/tetris.js/commit/34feef6f2df0f26baf5b77493ab87157486ac1dd))
- 添加升级庆祝动画 ([b35bcd3](https://github.com/yaohaixiao/tetris.js/commit/b35bcd38fa77501e6dad2432abaf0c79b0717928))
- 添加消除行特效 ([18524bb](https://github.com/yaohaixiao/tetris.js/commit/18524bb601ee0a2c6033b1e43e6e6772799d3ba8))
