# tetris.js

[![npm version](https://img.shields.io/npm/v/@yaohaixiao/tetris.js)](https://www.npmjs.com/package/@yaohaixiao/tetris.js)
[![prettier code style](https://img.shields.io/badge/code_style-prettier-07b759.svg)](https://prettier.io)
[![npm downloads](https://img.shields.io/npm/dt/@yaohaixiao/tetris.js)](https://npmcharts.com/compare/@yaohaixiao/tetris.js?minimal=true)
[![MIT License](https://img.shields.io/github/license/yaohaixiao/tetris.js.svg)](https://github.com/yaohaixiao/tetris.js/blob/main/LICENSE)

![俄罗斯方块游戏截图](./img/screen-shot.png)

tetris.js - 基于原生 JavaScript 开发的纯前端俄罗斯方块游戏，无任何外部依赖，可直接在浏览器中运行。游戏实现了经典俄罗斯方块的全部核心功能，包括方块生成、移动、旋转、下落、碰撞检测、消行、升级、分数统计等，同时添加了丰富的 UI 渲染、动画特效和交互反馈，整体架构分层清晰、模块化程度高，易于维护和扩展。

## Features

### 游戏控制
- **电脑键盘**：方向键移动/旋转，空格硬降，P 暂停，M 切换音乐，R 重开，Q 退出，S 切换 AI
- **游戏手柄**：完整支持，含左摇杆与十字键
- **移动端触控**：手机专属 GameBoy 风格按钮布局，触控操作完整覆盖

<p align="center">
  <img src="./img/game-boy-layout.png" alt="俄罗斯方块游戏截图-GAME BODY 布局">
</p>

### 等级与难度
- **等级选择**：1-10 级（键盘 1-9/T 键，手柄/触控上下键）
- **难度选择**：EASY / NORMAL / HARD / EXPERT（键盘 E/N/H/X，手柄/触控 A/B/Y/X）
- **最高 256 关**：致敬 FC 经典，256 关后循环

### 游戏规则
- **下落速度**：1 级 1000ms 起步，前 60% 等级平滑加速至 100ms 极限
- **计分**：固定分 × 当前等级（1 行 100，4 行 800）
- **升级**：动态步长，初始 10 行/级，逐级递增，封顶 60 行/级

### 视听体验
- **16 首背景音乐**：每 16 关自动切换，涵盖经典、电子、民谣、合成波等风格
- **16 套消行音效**：和弦 + 配器参数随等级变化
- **8 套方块配色**：每 32 关切换，从鲜艳到霓虹宝石
- **特效动画**：倒计时、消行闪烁、得分飘字、落地高亮、升级烟花、暂停滴答

### 系统特性
- **操作回放**：游戏结束后可回放完整操作过程
- **AI 控制**：支持多步前瞻，按棋盘评分决策，难度分级（演示地址：https://www.bilibili.com/video/BV1GPG86KEcy/?vd_source=8d9b68dd3ed316bb9b3a13e3f3f778eb）
- **本地存储**：最高分持久化缓存
- **自适应布局**：桌面端、平板、手机全适配

### 技术亮点
- 纯原生 JavaScript，零依赖
- 状态集中管理 + 纯函数更新，逻辑与渲染分离
- 独立于 RAF 的 Scheduler 驱动所有动画和音效
- 完整 Jest 单元测试 + Cypress E2E 覆盖

## Architecture

tetris.js 项目采用分层架构设计，整体结构清晰、模块化程度高、可维护性强。不仅适用于俄罗斯方块游戏，也可作为小型前端游戏的通用架构参考，通过轻微调整，可扩展到其他类型的 2D 画布游戏开发中。

![System Architecture Diagram](./img/architecture-poster.png)

## Architecture Highlights

- **模块化清晰**：各层职责明确，模块间耦合度低。基础工具、游戏规则、服务模块、运行时核心各司其职，便于维护和扩展。
- **状态集中管理**：所有核心状态统一存储于 `GameStore`，状态变更由纯函数 `stateHandler` 处理，避免状态散乱问题。该设计原生支持**操作回放（Replay）**，也为时间旅行调试等高级能力预留了扩展空间。
- **命令模式驱动核心循环**：玩家操作、AI 决策、方块自动下落均抽象为标准 Command 对象，实现操作的记录、回放与管控，是回放系统和 AI 对战能力的底层支撑。
- **事件总线解耦模块通信**：基于发布/订阅模式实现模块解耦，消行、升级、游戏结束等事件统一广播，渲染、音频、动画模块独立响应，互不依赖。
- **统一时间调度系统**：由独立 `Scheduler` 统筹所有定时任务，保障方块下落、动画、音效、AI 运算的时序精度，不受页面帧率干扰，游戏逻辑稳定可复现。
- **多输入通道统一抽象**：键盘、游戏手柄、移动端触控均映射为标准游戏指令，上层逻辑无需感知输入来源，降低新设备接入成本。
- **确定性游戏逻辑**：状态更新仅依赖命令与时间，无随机副作用与隐式依赖，相同输入必然产出一致结果，完美适配回放、问题复现与 AI 推演场景。
- **插件化高扩展设计**：音频、动画、AI、回放等功能均为可插拔独立模块，不侵入核心逻辑，新增功能与迭代维护更加灵活。
- **AI 与核心逻辑隔离**：AI 仅通过游戏状态快照推演最优策略，不会直接篡改运行状态，架构健壮，便于持续迭代不同难度与算法模型。
- **运行时与表现层解耦**：核心运行时负责规则与状态，渲染层专注画面绘制，可无缝将 Canvas 渲染替换为 WebGL，也能将核心逻辑移植至服务端、小程序等多端环境。

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" width="24"/>](#) Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" width="24"/>](#) Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" width="24"/>](#) Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" width="24"/>](#) Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" width="24"/>](#) Opera |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 128 – 131                                                                                                              | 130 – 132                                                                                                                       | 109 – 131                                                                                                                    | 17.5 – 18.1                                                                                                                  | 113 – 114                                                                                                                 |

## Game Controls

### Keyboard Controls
- Enter：开始游戏
- ↑：转动方块
- ← / →：左右移动方块
- ↓：加速下落
- Space：直接落底
- M：开启/关闭背景音乐
- P：暂停/继续游戏
- R：重新开始游戏
- Q：强制结束游戏
- B：从难度选择返回等级选择
- S：切换 AI / 人工控制

#### Level Selection
- 1–9：选择 1 至 9 级
- T：选择 10 级

#### Difficulty Selection
- E：简单（开局 0 行预填充方块）
- N：普通（开局 3 行预填充方块）
- H：困难（开局 6 行预填充方块）
- X：专家（开局 9 行预填充方块）

### Gamepad Controls
- START：开始游戏
- BACK：
  - 游戏中强制结束游戏
  - 从难度选择返回等级选择
- RB：切换 AI / 人工控制
- 左摇杆 / 十字方向键：
  - ↑：转动方块
  - ← / →：左右移动方块
  - ↓：加速下落
- X：重新开始游戏
- Y：暂停/继续游戏
- A：开启/关闭背景音乐
- B：直接落底

#### Level Selection
- 十字方向键 ↑：提升等级
- 十字方向键 ↓：降低等级

#### Difficulty Selection
- A：简单
- B：普通
- Y：困难
- X：专家

### Mobile Touch Controls (Game Boy Layout)
- ↑：转动方块
- ↓：加速下落
- ←：向左移动
- →：向右移动
- BACK：强制结束游戏
- A：开启/关闭背景音乐
- B：加速下落
- X：暂停游戏
- Y：重新开始游戏
-
#### Level Selection
- ↑ / ↓：调整等级（最低 1 级，最高 10 级）
- START：进入难度选择界面

#### Difficulty Selection
- A：简单
- B：普通
- Y：困难
- X：专家
- BACK：返回等级选择界面


## Game Rules

### Falling Speed

方块下落间隔由 `getSpeed()` 函数计算。游戏从第 1 级（1000ms/格）起步。算法采用
`step = ceil(1000 / floor(MAX_LEVEL × 0.6))` 的动态步长公式，确保在达到最大等级
`MAX_LEVEL`
(256) 的前 60% 阶段，速度平滑线性递增，直至极限。后 40% 的等级将保持在 100ms/格的极限速度，让玩家在后期专注于生存挑战。

### Scoring System

最终得分 = 单次消除固定分 × 消除时的最终等级。

| 消除行数          | 固定分 |
| :---------------- | :----- |
| 1 行              | 100    |
| 2 行              | 300    |
| 3 行              | 500    |
| 4 行 (俄罗斯方块) | 800    |
| 5 行              | 1200   |

**举例**：在第 1 级消除 4 行可得 800 × 1 = 800 分；在第 50 级消除 4 行则可得 800
× 50 = 40,000 分。

### Level Up Rules

游戏采用动态升级步长（`levelUpSteps`）。初始升级仅需消除 10 行，此后每次升级所需消除的行数将增加 2 行（即 10
→ 12 →
14...），步长封顶为 60 行/级。游戏共设 256 关，达到后再升级将触发关卡数值循环，致敬 FC 经典设计。

### Block Color Rules

为保持视觉新鲜感，游戏内置 8 套鲜艳的方块配色方案。每 32 关会自动切换至下一套配色，让你在高等级时也能拥有色彩鲜明的游戏体验。

| 关卡段     | 配色方案 | 主题         |
| :--------- | :------- | :----------- |
| 1-32 关    | 经典     | 默认鲜艳配色 |
| 33-64 关   | 暖色     | 活力暖色系   |
| 65-96 关   | 冷色     | 清爽冷色系   |
| 97-128 关  | 糖果     | 甜美糖果色   |
| 129-160 关 | 森林     | 自然森林色   |
| 161-192 关 | 日落     | 温暖日落色   |
| 193-224 关 | 霓虹     | 高亮霓虹色   |
| 225-256 关 | 宝石     | 璀璨宝石色   |

### Background Music Rules

游戏内置 16 首风格各异的背景音乐，随等级提升自动切换，每 16 关为一个切换区间。

| 关卡段     | 音乐曲目         | 风格           |
| :--------- | :--------------- | :------------- |
| 1-16 关    | TetrisTheme      | 经典 Theme     |
| 17-32 关   | SpringFestival   | 喜庆佳节       |
| 33-48 关   | FirstDivision    | 经典 Troika 风 |
| 49-64 关   | GongXiFaCai      | 节日祝福       |
| 65-80 关   | Loginska         | 电子律动       |
| 81-96 关   | BeyondTheWall    | 神秘悠远       |
| 97-112 关  | Technotris       | 科技电子       |
| 113-128 关 | GoldenSnakeDance | 东方韵味       |
| 129-144 关 | Korobeiniki      | 经典民谣       |
| 145-160 关 | Ascension        | 飞升空灵       |
| 161-176 关 | NeonNights       | 霓虹合成波     |
| 177-192 关 | FrozenPeaks      | 冰峰孤高       |
| 193-208 关 | CyberRush        | 赛博高速       |
| 209-224 关 | Starlight        | 星河漫游       |
| 225-240 关 | FinalPush        | 最终冲刺       |
| 241-256 关 | JourneyToWest    | 史诗压轴       |

祝：玩得愉快！

## License

- tetris.js - Licensed under
  [MIT License](http://opensource.org/licenses/mit-license.html).

- Press Start 2P fonts (GOOGLE) - Licensed under [OFL License](./font/OFL.txt)
