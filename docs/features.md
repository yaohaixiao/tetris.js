# Features

> 从一个俄罗斯方块，到一套现代 JavaScript 游戏运行时。

---

## 一个不断演进的项目

tetris.js 最初只是一个使用 JavaScript 与 HTML5 Canvas 编写的俄罗斯方块。随着项目不断迭代，它逐渐拥有了越来越多的能力。Replay、AI、Battle、Scheduler、Command、Game Runtime……，这些能力并不是最初就规划好的目标。它们都是在解决真实问题的过程中，一步一步演进出来的。

今天，俄罗斯方块仍然是这套 Runtime 所承载的第一个游戏。但 tetris.js 已经不仅仅是一个俄罗斯方块项目。它更像是一套围绕浏览器游戏开发持续演进的实践。

---

# 核心能力

整个项目可以大致划分为几个相互独立、又紧密协作的系统。每个系统都有明确的职责，共同组成完整的游戏运行时。

---

## 🎮 Gameplay

完整实现经典俄罗斯方块的大部分核心玩法。

包括：

* 七袋随机（7-Bag Randomizer）
* Hold
* Ghost Piece
* Hard Drop / Soft Drop
* Super Rotation System（SRS）
* 连击（Combo）
* Back-to-Back
* T-Spin
* Perfect Clear
* 多级速度
* 多套主题
* 响应式布局

Gameplay 本身只负责游戏规则。它并不知道 AI、Replay 或 Battle 是否存在。这也是整个架构保持可维护性的基础。

> 深入阅读：
>
> **Runtime** → `03-runtime.md`

---

## ⚙️ Runtime

Runtime 是整个项目最重要的组成部分。所有系统都围绕 Runtime 协同工作。

包括：

* 输入系统
* 游戏循环（Game Loop）
* Command Dispatch
* 状态更新
* Scheduler
* Renderer
* Audio
* AI
* Replay

对于 Runtime 来说，AI 与玩家没有区别。Replay 与键盘没有区别。Battle 与 Gamepad 也没有区别。它只负责按照统一规则执行 Command。

这也是 Replay、AI 与多人对战能够共享同一套执行流程的重要原因。

> 深入阅读：
>
> **Architecture** → `02-architecture.md`
>
> **Runtime** → `03-runtime.md`

---

## 🧠 AI

AI 使用与玩家完全一致的游戏规则。它不会直接修改真实棋盘。而是在独立的模拟环境中完成：

* Move Generation
* Snapshot
* Board Simulation
* Evaluation
* Beam Search
* Decision Making

最终，AI 会像玩家一样，将操作转换为 Command，再交由 Runtime 执行。

因此，整个项目始终只有一套游戏逻辑。

> 深入阅读：
>
> **AI** → `04-ai.md`

---

## 🎬 Replay

Replay 并不会录制画面。也不会保存每一帧棋盘。Replay 保存的是：

> 玩家在游戏过程中产生的 Command。

由于 Runtime 保证了状态更新的确定性（Deterministic），因此，同一组 Command，始终能够重现同一局游戏。这种方式不仅数据量极小，同时也为 AI 调试、问题复现以及未来的网络同步提供了基础。

> 深入阅读：
>
> **Replay** → `05-replay.md`

---

## ⚔️ Battle

Battle 建立在单人模式之上。并没有重新实现一套新的游戏。双方共享同一套 Runtime。通过垃圾行（Garbage）、攻击（Attack）以及胜负规则实现实时对战。

目前支持：

* Player vs Player
* Player vs AI
* Garbage
* Combo Attack
* Back-to-Back Attack

Battle 的实现充分复用了已有 Runtime 与 Gameplay。新增功能几乎没有破坏已有系统。

> 深入阅读：
>
> **Battle** → `06-battle.md`

---

## 🎮 Input

项目支持多种输入方式。包括：

* Keyboard
* Gamepad
* Touch

所有输入设备都会经过统一抽象。最终转换为 Runtime 可以识别的 Command。

因此，游戏逻辑完全无需关心输入来源。未来新增新的输入设备，通常只需要增加一个新的 Input Adapter。

---

## 🎨 Renderer

Renderer 专注于画面绘制。它不会参与任何游戏逻辑计算。所有渲染均来自当前游戏状态。这种设计保证了：

* Replay
* AI
* Battle

都能够共享同一套 Renderer，而无需针对不同模式编写不同的绘制逻辑。

---

## 🎵 Audio

音频系统同样属于 Runtime 的一部分。音效播放并不是直接写在游戏逻辑中。而是通过 Scheduler 与事件系统统一调度。这样能够保证：

* 动画
* 音效
* 游戏状态

始终保持一致的时间节奏。

---

## 🧩 模块化设计

整个项目遵循模块化设计。各系统之间职责明确。例如：

* Gameplay 负责规则
* Runtime 负责调度
* Renderer 负责绘制
* AI 负责决策
* Replay 负责记录
* Audio 负责声音

模块之间通过统一接口协作。随着项目不断扩展，更多功能能够建立在已有 Runtime 之上，而不是推倒重来。

---

# 当前能力

目前项目已经实现：

* ✅ 经典俄罗斯方块玩法
* ✅ Game Runtime
* ✅ Command Dispatch
* ✅ Scheduler
* ✅ Renderer
* ✅ Audio
* ✅ Replay
* ✅ AI Decision
* ✅ Human vs Human
* ✅ Human vs AI
* ✅ Gamepad
* ✅ Touch Support
* ✅ Responsive Layout
* ✅ 多主题
* ✅ 多音效

整个项目仍在持续演进。未来还将继续探索更多围绕 Runtime 的能力。

---

# 下一步阅读

如果你已经了解了 tetris.js 的整体能力。下一章将介绍整个项目最核心的话题：**《Architecture》**

它将解释：为什么这些系统能够共享同一套 Runtime，以及整个架构是如何一步一步演进到今天这个样子的。

➡ **下一章：02-architecture.md**
