# [0.4.0](https://github.com/yaohaixiao/tetris.js/compare/0.3.1...0.4.0) (2026-04-18)

### Bug Fixes

- 修复 updateHUD 动画缓存的问题 ([cb0b3b3](https://github.com/yaohaixiao/tetris.js/commit/cb0b3b30e7d99c334aa2ad2a8a5593d2006eb2e8))
- 修复3个界面（主菜单、暂停、游戏结束），全局快捷键的禁用问题； ([bb11d82](https://github.com/yaohaixiao/tetris.js/commit/bb11d821fe5ed607aa4e041270bb377fcf13cae4))
- 修复碰撞检测 game-over 没有显示结束界面的问题； ([f397d29](https://github.com/yaohaixiao/tetris.js/commit/f397d2901fa9092d54a9d5f7bf33182edcad5e74))

### Features

- 更新动画，优化升级庆祝动画的显示 ([1b44308](https://github.com/yaohaixiao/tetris.js/commit/1b443088b162d749f383681e15dc1678e3343620))
- 添加 animation
  system 处理动画渲染； ([ba9bc9f](https://github.com/yaohaixiao/tetris.js/commit/ba9bc9f396c93e8400f881010d5a525662f925cf))
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
