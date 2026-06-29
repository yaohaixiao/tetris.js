# tetris.js

[![npm version](https://img.shields.io/npm/v/@yaohaixiao/tetris.js)](https://www.npmjs.com/package/@yaohaixiao/tetris.js)
[![prettier code style](https://img.shields.io/badge/code_style-prettier-07b759.svg)](https://prettier.io)
[![npm downloads](https://img.shields.io/npm/dt/@yaohaixiao/tetris.js)](https://npmcharts.com/compare/@yaohaixiao/tetris.js?minimal=true)
[![MIT License](https://img.shields.io/github/license/yaohaixiao/tetris.js.svg)](https://github.com/yaohaixiao/tetris.js/blob/main/LICENSE)

简体中文 | [English](./README.EN.md)

> A Modern JavaScript Game Runtime & Tetris Engine

<p align="center">
    <img src="docs/assets/img/screen-shot.gif" alt="tetris.js">
</p>

## 项目简介

**tetris.js** 是一个基于原生 JavaScript 与 HTML5
Canvas 开发的俄罗斯方块项目，不依赖任何第三方游戏引擎。

项目最初只是为了实现一个完整、可玩的俄罗斯方块，但随着不断迭代，它逐渐演变成一套围绕
**游戏运行时（Game Runtime）** 构建的完整架构实践。

如今，俄罗斯方块只是这套运行时的第一个实践项目。真正希望探索的，不是如何再实现一个俄罗斯方块。 而是：

- 如何设计一套可以持续演进的游戏架构？
- 如何让游戏状态始终保持确定性（Deterministic）？
- 如何让 AI、Replay、动画、音效、多人对战共享同一套 Runtime？
- 如何在不断增加功能的同时，保持系统简单且易于维护？

因此，你在这个项目中看到的，不仅仅是一个可以运行的俄罗斯方块。 更是一套围绕现代 JavaScript 游戏开发不断演进的实践。

随着项目不断演进，越来越多的新功能都建立在同一套 Runtime 之上。 Replay、AI、Battle、Scheduler、动画系统、输入系统……

它们并不是独立开发出来的模块。 而是在统一架构之下自然生长出来的能力。 这也是整个项目最希望表达的设计理念。

> **对我而言，俄罗斯方块只是开始。**
> **真正希望沉淀下来的，是一套可以不断演进、不断复用的 JavaScript 游戏架构。**

## 为什么会有这个项目？

GitHub 上已经有很多优秀的俄罗斯方块项目。 它们实现了完整的玩法，也展示了各种不同的技术方案。

而 **tetris.js** 更希望回答另外一些问题。 例如：

- 一个游戏为什么需要自己的 Runtime？
- 为什么游戏状态需要集中管理？
- 为什么 Replay 不需要录制视频？
- 为什么 AI 不应该直接修改游戏状态？
- 为什么输入系统应该与游戏逻辑解耦？
- 为什么动画、音效和游戏逻辑应该运行在统一的时间轴上？

整个项目的架构演进，几乎都是围绕这些问题一步一步完成的。

因此，与其说这是一个俄罗斯方块项目。 我更希望它是一份关于现代 JavaScript 游戏架构的实践记录。

## 核心能力

相比传统的 Canvas 游戏 Demo，tetris.js 更关注整个游戏运行时的设计，而不仅仅是玩法本身。

![System Architecture Diagram](docs/assets/img/architecture-poster.png)

> 深入阅读：[Features](./docs/01-features.md)

### ⚙️ 独立的 Game Runtime

项目并没有将游戏逻辑直接写在浏览器事件中，而是建立了一套独立的运行时。

所有输入、状态更新、动画、音效、AI、Replay、多人对战，都围绕这一套 Runtime 运行。

Runtime 是整个项目最核心的组成部分。

> 深入阅读：[Runtime](./docs/03-runtime.md)

### 🧠 AI 决策系统

AI 与玩家共享同一套游戏逻辑。

它不会直接修改真实棋盘，而是在独立的模拟环境中完成搜索、评估与决策，最终再将结果转换成标准命令交由 Runtime 执行。

因此，人类玩家与 AI 并不存在两套不同的游戏逻辑。

> 深入阅读：[AI](./docs/04-ai.md)

### 🎬 Replay 回放系统

Replay 并不是录制 Canvas，也不是保存每一帧画面。

它仅记录游戏过程中产生的命令（Command）。

借助确定性的 Runtime，相同的命令序列可以稳定地重现整个游戏过程。

> 深入阅读：[Replay](./docs/05-replay.md)

### 🎯 Command 驱动架构

无论输入来自键盘、手柄、触摸屏，还是 AI。最终都会被转换成统一的 Command。

Runtime 只处理 Command，而不关心它来自哪里。

这一设计使 Replay、AI、多人同步等功能能够共享同一套执行流程。

### 🗂️ 集中的状态管理

游戏中的所有状态均由统一的 Store 管理。

渲染、动画、音效等模块不会直接修改游戏数据，而是根据状态变化完成各自的工作。

这样能够有效降低模块之间的耦合，使整个系统更加容易维护。

### ⏱️ Scheduler 调度系统

动画、延时任务、音效播放以及其他异步行为，统一交由 Scheduler 管理。

相比大量使用 `setTimeout()` 或
`setInterval()`，这种方式能够保证不同模块之间保持一致的时间节奏。

### 🔌 模块化设计

输入系统、AI、动画、音效、Replay、Renderer 等模块均保持相对独立。

随着项目不断扩展，新功能通常只需要增加模块，而不需要修改已有代码。

### 🌍 多平台输入支持

支持键盘、Gamepad 与移动端触摸操作。

<p align="center">
  <img src="docs/assets/img/game-boy-layout.png" alt="Tetris Game Screenshot - GAME BOY Layout">
</p>

不同输入设备都会经过统一的输入抽象，最终转换为 Runtime 可识别的 Command。游戏逻辑无需关心输入来源。

### 📦 零依赖

整个项目基于现代 JavaScript 实现，不依赖 Phaser、PixiJS 等游戏框架。

除了浏览器原生 API，没有引入任何游戏运行时相关依赖。

## 浏览器兼容

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" width="24"/>](#) Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" width="24"/>](#) Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" width="24"/>](#) Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" width="24"/>](#) Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" width="24"/>](#) Opera |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 128 – 131                                                                                                              | 130 – 132                                                                                                                       | 109 – 131                                                                                                                    | 17.5 – 18.1                                                                                                                  | 113 – 114                                                                                                                 |

**备注**：项目使用标准 ES6+、Canvas、Gamepad API，不兼容 IE 系列浏览器。

## 项目文档

1. [Architecture](./docs/02-architecture.md)
2. [Runtime](./docs/03-runtime.md)
3. [AI](./docs/04-ai.md)
4. [Replay](./docs/05-replay.md)
5. [Battle](./docs/06-battle.md)
6. [Development](./docs/07-development.md)
7. [Game Controls and Rules](./docs/08-controls-and-rules.md)

## 致谢

本项目在开发过程中，充分借助了现代 AI 工具。感谢它们在架构设计、代码优化、测试、文档编写等方面提供的建议与协助。

- ChatGPT：参与架构设计讨论、Runtime 演进分析、文档编写及架构图设计。
- DeepSeek：参与代码注释、测试用例编写，以及部分功能模块的实现与优化。

## 开源许可

- tetris.js 项目：基于
  [MIT 许可证](http://opensource.org/licenses/mit-license.html) 开源
- Press Start 2P 字体（谷歌开源字体）：基于 [OFL 许可证](assets/font/OFL.txt)
  开源
