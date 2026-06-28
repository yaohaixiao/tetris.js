# Battle

简体中文 | [English](./06-battle.en.md)

> Battle 并不是另一套游戏，而是多个 Runtime 在同一场比赛中协同运行。

## 为什么需要 Battle？

对于俄罗斯方块来说多人对战并不仅仅意味着：**同时显示两个棋盘**。真正复杂的是：

- 双方需要同时运行
- 双方拥有独立状态
- 双方需要交换 Garbage
- 双方仍然保持确定性

很多项目会为了多人模式重新实现一套新的游戏逻辑，这样虽然能够实现功能，但单人与多人会逐渐演变成两套不同的系统。随着项目不断扩展，维护成本也会越来越高。

## Battle 不是另一套游戏

因此，tetris.js 并没有设计成两套不同的系统。Battle 并不会修改 Gameplay，也不会修改 Runtime，真正发生变化的只是 Runtime 的数量。

**单人模式：**

```text
Runtime
```

**多人模式：**

```text
Runtime A
↓
Battle Controller
↑
Runtime B
```

双方依然运行各自完整的游戏，Battle
Controller 只负责协调双方之间需要交换的信息。因此，Battle 并没有创造新的游戏规则，它只是组织多个 Runtime 共同运行。

## 每位玩家都是独立的 Runtime

Battle 中每一位玩家都拥有自己独立的：

- Board
- Store
- Scheduler
- Renderer
- Audio
- Replay
- AI（可选）

也就是说 Battle 并不存在："**共享棋盘**"，双方始终拥有完全独立的游戏状态。这种设计让：

- 玩家 vs 玩家
- 玩家 vs AI
- AI vs AI

都能够建立在同一套架构之上。

## Garbage 如何同步？

Battle 真正需要协调的只有双方交互的数据。例如：

- 消行数量
- 连击（Combo）
- Back-to-Back
- Garbage

当一方完成攻击，Battle
Controller 会根据游戏规则计算对应的 Garbage。然后将这一事件发送给另一方 Runtime。

真正修改棋盘的依然是接收方自己的 Runtime，Battle
Controller 从不会直接修改任何玩家的游戏状态。

## Battle 与 AI

AI 并不知道自己正在进行 Battle 它仍然只是思考输出 Command，真正参与 Battle 的依然是 Runtime。

因此：

- 玩家 vs 玩家
- 玩家 vs AI
- AI vs AI

整个执行流程完全一致，Battle 并不会因为 AI 的加入而产生新的游戏逻辑。

## Battle Controller

Battle 模块真正负责的是：

- 管理多个 Runtime
- 转发 Battle 事件
- 同步 Garbage
- 判断胜负
- 控制比赛生命周期

它不会：

- 控制玩家
- 控制 AI
- 修改棋盘
- 绘制画面

Battle Controller 更像比赛裁判，而不是另一套游戏引擎。

## 为什么 Battle 能够自然加入？

Battle 看起来是整个项目增加的新玩法，实际上它只是 Runtime 架构自然演进后的结果。

因为：

- Runtime 已经负责组织游戏
- Command 已经统一输入
- Store 已经集中管理状态
- Replay 已经保证确定性

Battle 几乎不需要重新设计这些系统，它只是让多个 Runtime 同时运行。这也是整个架构可扩展性的体现。

## 小结

Battle 并没有重新实现俄罗斯方块，它只是让多个 Runtime 在同一场比赛中协同工作。每位玩家，无论是真人还是 AI，都拥有属于自己的 Runtime。Battle
Controller 则负责协调它们之间的交互。

因此，Battle 并不是架构之外的新功能，它只是 Runtime 能力自然延伸出来的一种应用。

## 下一步阅读

到这里 Runtime、AI、Replay 与 Battle 已经介绍完成，接下来将进入开发指南。了解整个项目的目录组织、模块划分以及如何参与开发。

**下一章：[07-development.md](./07-development.md)**
