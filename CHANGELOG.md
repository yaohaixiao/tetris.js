# [1.10.0](https://github.com/yaohaixiao/tetris.js/compare/1.9.0...1.10.0) (2026-05-30)

### Features

- 添加 Hold 暂存方块功能 ([d856580](https://github.com/yaohaixiao/tetris.js/commit/d856580ad6f8009fd6de6460a4f0ad65b6a102da))

# [1.9.0](https://github.com/yaohaixiao/tetris.js/compare/1.8.0...1.9.0) (2026-05-28)

### Bug Fixes

- 修复 1×4、1×5、2×3 等非正方形矩阵旋转可能出现的错误， 修复负数 rotation 溢出问题 (curRotation +
  direction + 4) % 4
  ([2f67571](https://github.com/yaohaixiao/tetris.js/commit/2f675710aa3b8a5961aff4d788a36422068a099c))

### Features

- 添加 Lock
  Delay 机制 ([d163a6f](https://github.com/yaohaixiao/tetris.js/commit/d163a6f63fee50de14da69725af47313aa621c89))
- 添加 SRS
  KICK 墙踢数据 ([d9a0795](https://github.com/yaohaixiao/tetris.js/commit/d9a0795febcce38f30506f0494126ded43d493d8))
- KeyboardController 添加 DAS/ARR 支持 ([4f4e5de](https://github.com/yaohaixiao/tetris.js/commit/4f4e5de18b1af24074f96d91302aa20ea238f9ec))

# [1.8.0](https://github.com/yaohaixiao/tetris.js/compare/1.7.3...1.8.0) (2026-05-28)

### Features

- 调增绘制预览方块的细节，减少预览方块间的间隙； ([88595f2](https://github.com/yaohaixiao/tetris.js/commit/88595f233893a21ffef6b45aad425e9f8dbe9330))
- 添加3中方块绘制风格：gradient（渐变风格）、pixel（矩形像素风格）、shaded（立体风格） ([ef56dc5](https://github.com/yaohaixiao/tetris.js/commit/ef56dc5146d9338dcd79581e9780a7138b4a1da4))
- 调整暂停时钟样式；

## [1.7.3](https://github.com/yaohaixiao/tetris.js/compare/1.7.2...1.7.3) (2026-05-27)

### Bug Fixes

- 调整暂停时钟秒针颜色，修复0-1点秒针和电子时间显示不清新得问题； ([2c96e9c](https://github.com/yaohaixiao/tetris.js/commit/2c96e9c456d4f7dab03d939f715c55df30949b8c))

### Features

- Scheduler 升级 ([9216220](https://github.com/yaohaixiao/tetris.js/commit/9216220b1fd982648ce1c4c79796bee4ca2702e8))

## [1.7.2](https://github.com/yaohaixiao/tetris.js/compare/1.7.1...1.7.2) (2026-05-25)

### Bug Fixes

- 修复 crypto.randomUUID() 在非 HTTPS 站点导致的报错问题； ([e5245db](https://github.com/yaohaixiao/tetris.js/commit/e5245db73a3b20ea741f37c9f29dba67c1422b0c))

## [1.7.1](https://github.com/yaohaixiao/tetris.js/compare/1.7.0...1.7.1) (2026-05-25)

### Bug Fixes

- 修复调整 resize.js 设置 next
  piece 预览区域显示问题； ([fc3ab51](https://github.com/yaohaixiao/tetris.js/commit/fc3ab51420dc821ebab4a5627cd2d2ef59192528))

# [1.7.0](https://github.com/yaohaixiao/tetris.js/compare/1.6.0...1.7.0) (2026-05-25)

### Features

- 添加根据等级，播放不同的消除音效，也是 16 级，更换1次； ([86e2da5](https://github.com/yaohaixiao/tetris.js/commit/86e2da556317d4425e23fbc552f18fc820df1794))
- 添加在移动设备访问时，显示 GAME
  BOY 模拟按键，对游戏进行操作的能力； ([bb538b9](https://github.com/yaohaixiao/tetris.js/commit/bb538b98d8d0d42e09bcb6bcdbff8060dd2a80fb))

# [1.6.0](https://github.com/yaohaixiao/tetris.js/compare/1.5.0...1.6.0) (2026-05-24)

### Bug Fixes

- 修复 create-snapshot.js 模块中 state.curr 为 null 时的逻辑漏洞； ([69f50ef](https://github.com/yaohaixiao/tetris.js/commit/69f50efbd71a8833489e0370935a43d2000ee162))

### Features

- 调整 clear-score-animation.js 的动画效果，使文本移动位移更明显；并使用 renderText() 方法重构 render-clear-score.js;
  ([b3393af](https://github.com/yaohaixiao/tetris.js/commit/b3393af87def1e7bb64c3559e9eb7495eb11bacd))
- 添加方块落地闪亮特效； ([9213894](https://github.com/yaohaixiao/tetris.js/commit/9213894eb214dac9c3b82ce9e52b9e9ef3f87ad4))
- 优化 render-text.js，增加对 alpha 参数的支持； ([3f29997](https://github.com/yaohaixiao/tetris.js/commit/3f2999781752048e6cddb50902e71341913a7eb1))

# [1.5.0](https://github.com/yaohaixiao/tetris.js/compare/1.4.0...1.5.0) (2026-05-23)

### Bug Fixes

- 修复 apply-clear-lines.js 调整得分和等级计算后的计算不准问题； ([a8c980e](https://github.com/yaohaixiao/tetris.js/commit/a8c980e3a1fd7902958b925e673fb1fbad27e610))

### Features

- 添加消除行时显示等分动画； ([45b693a](https://github.com/yaohaixiao/tetris.js/commit/45b693adc4d5690aa2b74fde84b4c64d7bf7debd))

# [1.4.0](https://github.com/yaohaixiao/tetris.js/compare/1.3.0...1.4.0) (2026-05-23)

### Bug Fixes

- 修复初始化没有更新 HUD 的问题； ([e4c1e5e](https://github.com/yaohaixiao/tetris.js/commit/e4c1e5e5cadebfb44829f66d9d45e1ab99486c72))

### Features

- 添加背景音乐，现在是 256 关，没 16 级更换一次背景音乐； ([7678967](https://github.com/yaohaixiao/tetris.js/commit/7678967c4564c2ed78d6ccb8c8db747f0816f1dd))
- 游戏升级速度变化，算法变为最大等级（256级），到60%的管卡，速度极限到120ms间隔； ([7867951](https://github.com/yaohaixiao/tetris.js/commit/7867951a1c123ab916af658994e68f779bf6d502))
- 致敬 FC 俄罗斯方案，游戏规则向 FC 版本靠近，最大关卡 256 关； ([ae51afc](https://github.com/yaohaixiao/tetris.js/commit/ae51afc414b4f6c24c0a0311ef1dc3f85b37d22e))
- 致敬 FC 俄罗斯方块，更具等级不同，修改方块配色方案； ([ee68b57](https://github.com/yaohaixiao/tetris.js/commit/ee68b57963bbd465bdaffd642fbd1cf950999f81))
- 致敬 FC 俄罗斯方块，消除分数调整，按 FC 规则，分数：CLEAR_LINE_SCORES[cleared] \*
  currentLevel；每升级1次，升级消除行 +5 行，90行封顶； ([33dbc10](https://github.com/yaohaixiao/tetris.js/commit/33dbc10ee2acc75091aa3d7a50d4e17dbe16794b))

# [1.3.0](https://github.com/yaohaixiao/tetris.js/compare/1.2.1...1.3.0) (2026-05-22)

### Features

- 优化 AI 决策配置，HARD 和 EXPERT 都更加“智能”； ([6e96b20](https://github.com/yaohaixiao/tetris.js/commit/6e96b209ef484c5208b051acc399f2d2a392e79a))
- 优化动画管理，使用 Scheduler 统一接管，统一时间线； ([1c543f7](https://github.com/yaohaixiao/tetris.js/commit/1c543f76403887340db95bac4bfd1a04392cb765))

## [1.2.1](https://github.com/yaohaixiao/tetris.js/compare/1.2.0...1.2.1) (2026-05-21)

### Bug Fixes

- 修复 gamepad 手柄控制模块，依赖注入 Store 初始化未注入导致的控制失效问题； ([5df5e42](https://github.com/yaohaixiao/tetris.js/commit/5df5e4205ef5cbc57c945b23d1d5a460d1244acb))
- 修复游戏手柄切换 HUMAN/AI 的问题，更换为 RB 键； ([13d3876](https://github.com/yaohaixiao/tetris.js/commit/13d387641db114caa568ffba3e93446cb779058a))
- gamepad 控制时，difficulty
  BACK 键定义 BACK 指令，playing 状态未恢复 QUIT 指令，导致无法强行结束游戏的问题； ([d0eaec1](https://github.com/yaohaixiao/tetris.js/commit/d0eaec1b837f79c2ea4af119a847081eec130136))

### Features

- 调整 evaluateBoard() 方法做功能抉择时消除行 completeLines 的权重，并调整 AIDifficulty 的权重值配置； ([0910e38](https://github.com/yaohaixiao/tetris.js/commit/0910e38504b7a36246ffc3ba0319eb05230bdb7e))

# [1.2.0](https://github.com/yaohaixiao/tetris.js/compare/1.1.0...1.2.0) (2026-05-20)

### Bug Fixes

- 修复 replay 播放完毕，stopPlay() 重置 game-over 状态导致的无法开始的问题； ([a77b3af](https://github.com/yaohaixiao/tetris.js/commit/a77b3afcc5435e172f042644db7f749a03199f14))
- 修复更新 UI 状态消息错误的问题（忘记使用 scope 消息） ([1fa5e75](https://github.com/yaohaixiao/tetris.js/commit/1fa5e75d3fe46e81bd68622bceab8c327a8c367c))
- 修复在添加 AI 控制后 reset 未处理更新 controller 信息和停止 AI 控制的问题，同时修复了在 Replay 过程中按 enter 开始游戏，方块无法 tick 自动下落的问题； ([c2d49f1](https://github.com/yaohaixiao/tetris.js/commit/c2d49f14932267017b1c20e1be7c998de03fe246))

### Features

- 优化 AI 控制逻辑，添加更具 difficulty 难度等级调整 AI 控制的决策权重； ([916cfca](https://github.com/yaohaixiao/tetris.js/commit/916cfca449ed554e3494a2aec611152cd696abcb))
- 优化 AIController 的 think() 方法 ([18e015a](https://github.com/yaohaixiao/tetris.js/commit/18e015a0a4222f016f513a2334eb9172a803acfe))

# [1.1.0](https://github.com/yaohaixiao/tetris.js/compare/1.0.0...1.1.0) (2026-05-19)

### Bug Fixes

- 修复 audio/index.js 中 emit() 方法接入错误的问题； ([eee6c50](https://github.com/yaohaixiao/tetris.js/commit/eee6c50f3bd703dc1aa2fb15f6b81ebfe603c775))

### Features

- 根据时间显示不同颜色的数字时钟； ([db59f6d](https://github.com/yaohaixiao/tetris.js/commit/db59f6df89b077ef8a65f9cec8a09ac660b8d566))
- 添加 普通用户/AI 切换功能，用户可以挂机，实现简单的 AI； ([8306ee8](https://github.com/yaohaixiao/tetris.js/commit/8306ee8e2e4df10545f4286f5272b0fe47566bf5))
- 添加 AI 功能； ([23cd85d](https://github.com/yaohaixiao/tetris.js/commit/23cd85df37d5d9d85d9c37a498b0b0e77f43e69b))

# [1.0.0](https://github.com/yaohaixiao/tetris.js/compare/0.7.5...1.0.0) (2026-05-13)

## 完成核心功能的单元测试和E2E测试

- 架构和功能基本问题，发布 1.0.0 版本；

## [0.7.5](https://github.com/yaohaixiao/tetris.js/compare/0.7.4...0.7.5) (2026-05-09)

### Bug Fixes

- 修复 countdown 界面第一个数字动画没有音效的问题； ([316cf7c](https://github.com/yaohaixiao/tetris.js/commit/316cf7c13c492e780029866fd9d20157ddf6385e))

### Features

- 背景曲目调整： ([07c7db5](https://github.com/yaohaixiao/tetris.js/commit/07c7db570f1abba43ca805256fae9e10f91e8536))

## [0.7.4](https://github.com/yaohaixiao/tetris.js/compare/0.7.3...0.7.4) (2026-05-08)

### Bug Fixes

- 修复 replay:stop:record 未监听的问题 ([f6c2a0f](https://github.com/yaohaixiao/tetris.js/commit/f6c2a0f19413f412ed9bdcb99595284df8d89509))

### Test

- 单元测试覆盖所有核心模块；
- E2E 测试覆盖游戏全流程；

## [0.7.3](https://github.com/yaohaixiao/tetris.js/compare/0.7.2...0.7.3) (2026-05-07)

### Bug Fixes

- 修复调整 EventBus 后，将录无法结束的问题； ([a632710](https://github.com/yaohaixiao/tetris.js/commit/a632710bb44867ae96e1e852f892dcf9ecbf11b3))

## [0.7.2](https://github.com/yaohaixiao/tetris.js/compare/0.7.1...0.7.2) (2026-05-07)

### Bug Fixes

- 修复 EventBus 重构后，playBGM 一直播放同1曲背景音乐的问题；([368f993](https://github.com/yaohaixiao/tetris.js/commit/368f993afc5e4211042f50e34578fa741f7a2903))

### Features

- 调整代码，将游戏最大级别，游戏画布的 cols,rows 调整成可配置；([44513d9](https://github.com/yaohaixiao/tetris.js/commit/44513d933c5ecf92332818dab65ac2a8b12e19ca))
- 调整下落速度算法，改成达到最大管卡70%左右，就达到极限的线路速度，间隔 120ms 就下落1格； ([5ffab93](https://github.com/yaohaixiao/tetris.js/commit/5ffab93acabe1fad7731a4c4bdc6a610f6dada80))
- 添加新背景音乐曲子，调整曲目播放顺序，调整背景音乐播放细节，根据不同 wave 配置 gate； ([672b74c](https://github.com/yaohaixiao/tetris.js/commit/672b74cf79d742702f39bcefabb13a60e96430d2))

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
