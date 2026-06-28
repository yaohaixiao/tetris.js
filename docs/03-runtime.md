# Runtime

---

简体中文 | [English](./03-runtime.md)

> Runtime 并不是一个模块，而是整个游戏运行期间所有系统协同工作的核心。

---

## 什么是 Runtime？

很多开发者第一次接触游戏开发时，都会直接开始编写游戏逻辑。例如：

* 监听键盘
* 更新棋盘
* 绘制 Canvas
* 播放音效

随着功能不断增加。代码也会越来越多。最终，一个游戏通常会包含：

* 输入
* 游戏逻辑
* 渲染
* 动画
* 音效
* AI
* Replay
* Battle

如果这些模块彼此直接调用。整个项目很快就会变得难以维护。

因此，需要有一个统一的组织者。这个组织者，就是 Runtime。它并不是负责某一个具体功能。而是负责让所有系统能够按照统一的规则协同工作。

---

## Runtime 的职责

Runtime 并不会决定俄罗斯方块怎么玩、它也不会负责绘制画面、更不会参与 AI 搜索。它真正负责的是：

* 管理游戏生命周期
* 驱动 Game Loop
* 分发 Command
* 更新游戏状态
* 调度各个系统
* 保证所有模块共享同一套时间轴

换句话说，Runtime 更像整个游戏的大脑。其它系统只需要完成自己的职责，而不用关心整个游戏如何组织运行。

---

## 一个游戏为什么需要 Runtime？

假设一个最简单的俄罗斯方块。整个流程可能只有：

```text
setInterval()
↓
更新棋盘
↓
Canvas 重绘
```

当项目很小时，这样的实现已经足够。但是，随着：

* AI
* Replay
* Battle
* Scheduler
* Audio
* Animation

更多功能模块的不断加入，游戏已经不再只有更新棋盘。它开始拥有越来越多需要协同工作的系统。如果没有 Runtime，这些模块最终都会互相依赖。而 Runtime 的出现，就是为了让它们彼此解耦。

---

## Runtime 如何组织整个游戏？

Runtime 可以理解成整个游戏的调度中心。游戏启动以后，所有模块都会围绕 Runtime 工作。整个执行流程可以简化为：

```text
Input
↓
Command
↓
Runtime
↓
Gameplay
↓
Store
↓
Renderer
↓
Audio
↓
Animation
```

对于 Runtime 来说，Command 来自哪里并不重要。可能来自：

* Keyboard
* Gamepad
* Touch
* Replay
* AI
* Battle

Runtime 唯一关心的是：**执行 Command**。因此，整个游戏始终只有一套执行流程。

---

## Game Loop

Runtime 的核心是 Game Loop。Game Loop 是整个游戏不断运行的心跳。每一次循环，Runtime 都会完成：

1. 处理输入
2. 执行 Command
3. 更新游戏状态
4. 推进游戏时间
5. 调度 Scheduler
6. 更新动画
7. 更新音频
8. 渲染画面

整个游戏始终围绕这一循环不断运行，Game Loop 并不关心具体模块如何实现，它只负责组织执行顺序。

---

## Command Dispatch

Runtime 中所有操作，最终都会转换成 Command。例如：

* Move Left
* Move Right
* Rotate
* Hard Drop
* Hold
* Pause

这些 Command 并没有来源的概念。它们可能来自：

- 玩家
- Replay
- AI
- （甚至未来的）网络同步

Runtime 负责按照统一规则依次执行它们。因此，Replay 与 AI 完全可以共享同一套执行流程。

---

## Store

Runtime 并不会直接保存所有数据，真正的游戏状态由 Store 管理。例如：

* Board
* Current Piece
* Hold
* Next Queue
* Score
* Level
* Combo
* Back-to-Back

Runtime 负责更新状态，Renderer、Audio、Animation 等系统则根据状态完成自己的工作。这种职责划分使系统之间保持较低耦合。

---

## Scheduler

除了游戏逻辑，很多行为都具有时间属性。例如：

* 消行动画
* 音效播放
* 延迟生成 Garbage
* 倒计时
* 特效

这些任务如果全部使用 `setTimeout()`，将很难保证节奏一致。Scheduler 因此成为 Runtime 的一部分。

所有需要等待执行的任务，都会统一进入 Scheduler。 Game Loop 每一帧都会推进 Scheduler，从而保证整个游戏始终运行在同一时间轴上。

---

## Renderer

Renderer 不参与游戏逻辑，它只负责根据当前状态完成画面绘制。Runtime 更新状态，Renderer 读取状态。

这样，无论当前运行的是：

* 单人模式
* Replay
* AI
* Battle

Renderer 都无需修改任何逻辑。

---

## AI、Replay 与 Runtime

AI 与 Replay 都建立在 Runtime 之上，Replay 保存的是 Command，AI 输出的也是 Command。

因此，对于 Runtime 来说，Replay 与玩家没有区别，AI 与键盘也没有区别。Runtime 始终执行统一的数据流，这也是整个项目能够保持确定性的关键。

---

## Runtime 带来了什么？

随着 Runtime 的建立，越来越多的新能力开始自然生长。例如：

* Replay
* AI
* Battle
* Gamepad
* Touch
* Scheduler
* Audio

它们都不需要重新实现一套新的游戏，而是共享同一套 Runtime。

因此，新增功能更多意味着增加新的模块，而不是修改已有系统。这也是 Runtime 最大的价值。

---

## 小结

Runtime 并不是为了让架构看起来更复杂。恰恰相反，它让复杂的系统拥有了统一的组织方式。

- 对于 Gameplay 来说，它只关心游戏规则；
- 对于 Renderer 来说，它只关心画面；
- 对于 AI 来说，它只关心决策；

而 Runtime 负责把这一切组织在一起，这也是整个 tetris.js 的核心。

---

## 下一步阅读

Runtime 负责组织整个游戏。而真正决定游戏行为的，是 Gameplay 与 AI。下一章将进入整个项目最复杂的系统之一：**AI**。了解 AI 如何在不修改真实棋盘的情况下完成搜索、模拟与决策。

**下一章：[04-ai.md](./04-ai.md)**
