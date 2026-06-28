# Architecture

简体中文 | [English](./02-architecture.en.md)

> 架构不是设计出来的，而是在不断解决问题的过程中演进出来的。

![System Architecture Diagram](assets/img/architecture-poster.png)

## 为什么要写这一章？

很多项目介绍架构时，都会直接给出一张模块图。例如：

```
Engine
│
├── Renderer
├── Audio
├── AI
├── Replay
└── ...
```

这样的架构图当然没有问题。但它只能告诉我们：

> **现在是什么样。**

却无法回答一个更重要的问题：

> **为什么会变成这样？**

事实上，绝大多数软件架构都不是一次设计完成的。它们是在不断解决真实问题的过程中，逐渐演进出来的。tetris.js 也是如此。

## 一切，都从一个简单的俄罗斯方块开始。

项目最初的版本并没有 Runtime、没有 Scheduler、没有 Replay，也没有 AI。

它只是一个最普通的浏览器小游戏。整个程序可能只有几个核心部分：

- Canvas
- Board
- Piece
- Keyboard
- Render

游戏循环也非常简单。

```
setInterval()
↓
更新棋盘
↓
Canvas 重绘
```

对于一个最简单的俄罗斯方块来说。这样的实现完全没有问题。甚至可以说，这是大多数教程都会采用的方式。

但是，随着功能不断增加，新的问题开始出现。

## 第一个问题：代码开始变得越来越分散

当增加键盘控制时。代码需要监听：

```
keydown
```

增加暂停功能。又需要：

```
keyup
```

增加触摸控制。又会出现：

```
touchstart
touchmove
touchend
```

后来加入 Gamepad 游戏手柄支持，又增加了一套新的输入。 渐渐地，不同输入设备开始直接修改游戏状态。例如：

```
Keyboard
↓
moveLeft()
↓
Board
```

```
Touch
↓
moveLeft()
↓
Board
```

```
Gamepad
↓
moveLeft()
↓
Board
```

它们都能够直接修改游戏。代码虽然还能工作。但已经开始出现重复逻辑。

## 第二个问题：越来越多的系统开始依赖游戏逻辑

后来，动画加入了、 音效加入了、Replay 加入了、AI 加入了、 Battle 加入了。如果每一个模块都直接修改游戏状态。那么整个项目最终会变成：

```
Keyboard ─────┐
Touch ────────┤
Gamepad ──────┤
Replay ───────┤
AI ───────────┤
Battle ───────┤
               ▼
           Game State
```

每一个模块都知道如何操作游戏。每一个模块也都依赖游戏实现。新增一个功能。意味着需要修改多个地方。这也是很多小游戏最终越来越难维护的原因。

## 第一次架构演进：输入与游戏解耦

于是，项目开始进行第一次比较大的调整。所有输入，不再直接修改游戏。而是先转换成统一的 Command。例如：

```
Keyboard
↓
MoveLeft Command
```

```
Gamepad
↓
MoveLeft Command
```

```
AI
↓
MoveLeft Command
```

Runtime 并不知道，这个 Command 来自哪里，它只负责执行。

这样，Replay、AI、Gamepad、Touch、都拥有了完全一致的执行流程。这也是整个 Runtime 最重要的一步。

## 第二次架构演进：状态集中管理

随着模块继续增加。新的问题又出现了。Renderer 需要读取状态、AI 需要读取状态、Replay 需要读取状态、动画也需要读取状态。如果所有模块都能够修改数据。那么最终状态一定会越来越混乱。

于是，游戏状态开始集中管理。所有状态更新，统一经过 Runtime。其它模块只负责读取状态，或者响应状态变化。

从这一刻开始，游戏真正拥有了一套稳定的数据流。

## 第三次架构演进：Scheduler

后来，越来越多异步行为出现。例如：

- 动画
- 消行动画
- 音效播放
- 倒计时
- 延迟任务

如果继续大量使用：

```
setTimeout()

setInterval()
```

不同系统之间就很容易出现节奏不一致的问题。于是，项目增加了 Scheduler。

所有需要"等待"的事情，都交给 Scheduler 统一调度。从此，动画、音效、Runtime 开始共享同一套时间轴。

## 第四次架构演进：Replay

当 Runtime 保证了状态更新的确定性之后。Replay 也变得简单起来。Replay 不再保存棋盘。也不录制视频。

它只保存：

```
Command
```

因为，Runtime 保证：

```
相同输入
↓
相同状态变化
↓
相同结果
```

Replay 因此拥有极小的数据量。同时能够完整重现整局游戏。

## 第五次架构演进：AI

AI 是整个项目演进过程中最复杂的一步。如果 AI 直接修改真实棋盘。 那么：

- Replay 将失效；
- Battle 会变得复杂；
- 调试也会越来越困难；

因此，AI 被设计成只负责思考。真正执行操作的，依然是 Runtime。AI 完成搜索以后。最终仍然只提交：`Command`。AI 与玩家，真正共享了一套游戏规则。

## 架构从来不是最终目标

直到今天，Replay、Battle、AI、Gamepad、Scheduler、Renderer、Audio、这些模块都建立在同一套 Runtime 之上。

它们并不是独立开发出来的功能。而是在统一架构下自然演进出来的能力。这也是 tetris.js 最希望表达的设计思想。

> 好的架构，并不是为了展示设计技巧。而是能够在项目不断成长的过程中，让新的能力持续生长，而不用一次又一次推倒重来。

## 下一步阅读

这一章介绍了整个项目的架构演进过程。下一章将真正进入 Runtime。了解：

- Runtime 如何工作？
- Game Loop 如何组织整个系统？
- Command 如何驱动所有模块？
- Scheduler 又是如何融入整个运行时？

**下一章：[03-runtime.md](./03-runtime.md)**
