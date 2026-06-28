# Replay

简体中文 | [English](./05-replay.en.md)

> Replay 不是录像，它只是另一种输入方式。

# 为什么需要 Replay？

对于大多数游戏来说，Replay 通常意味着：**重新播放一局游戏**。

实现方法有很多，例如：

- 录制视频
- 保存每一帧画面
- 保存每一帧游戏状态

这些方案都能够实现 Replay，但它们都有一个共同的问题：**数据量非常大**。同时，Replay 与真实游戏往往会逐渐产生偏差，随着游戏越来越复杂，维护成本也会越来越高。

# Replay 并不是录像

因此，tetris.js 选择了另一种 Replay 方式。Replay 不会录制 Canvas，也不会保存每一帧棋盘。它真正记录的。只有玩家产生的操作。例如：

```text
Move Left

Rotate

Soft Drop

Hard Drop

Hold
```

这些操作都会转换成统一的 Command，Replay 保存的正是这些 Command。

# 为什么只保存 Command？

因为 Runtime 保证了游戏运行的确定性（Deterministic）。 对于 Runtime 来说，只要：

- 初始状态相同
- 随机序列相同
- Command 相同

最终得到的游戏结果一定相同。因此，Replay 不需要保存：

- Board
- Score
- Animation
- Canvas

这些状态都会自然重新计算出来，Replay 只需要重新输入同样的 Command，整个游戏便能够重新运行一次。

# Replay 如何工作？

正常游戏：

```text
Player
↓
Command
↓
Runtime
↓
Game State
```

Replay：

```text
Replay Records
↓
Command
↓
Runtime
↓
Game State
```

Replay 的工作方式其实非常简单，与正常游戏相比唯一发生变化的只是 Command 的来源。

Runtime 完全不知道当前 Command 来自玩家，还是来自 Replay。因此，Replay 与正常游戏拥有完全一致的执行流程。

# Replay 为什么能够保持同步？

Replay 成立的前提并不是 Command，真正重要的是：**Runtime 的确定性**。

如果同一个 Command 今天执行一次，明天执行一次，得到不同结果，那么 Replay 将立即失效。因此，整个项目始终遵循一个原则：**相同输入，产生相同输出**。

这不仅保证了 Replay，也让 AI 调试、Bug 复现以及未来网络同步成为可能。

# Replay 与 AI

Replay 保存的是 Command，AI 输出的也是 Command。因此，Replay 根本不需要知道操作来自玩家，还是来自 AI。因为 Runtime 始终按照统一的数据流执行。

这意味着 AI 对局，同样可以生成 Replay。Replay 回放时也无需关心当时究竟是谁完成了操作。

# Replay 带来的价值

Replay 的意义远远不只是"回放一局游戏"。由于 Replay 本质上保存的是
`Command`，它还能用于：

- Bug 重现
- AI 调试
- 性能测试
- 自动化测试
- 数据分析

开发过程中，只要能够复现同一组 Command，整个游戏便能够重新回到当时的状态。这也是 Runtime 最大的优势之一。

# Runtime 才是真正的主角

Replay 看起来像一个独立模块，实际上它几乎没有自己的游戏逻辑。Replay 做的事情非常简单：读取 Command。然后依次提交给 Runtime。

真正推动整个游戏运行的，始终都是 Runtime。Replay 只是 Runtime 的另一种输入来源。这一设计也让 Replay 与：

- 玩家
- AI
- Battle

共享完全一致的执行流程。

# 小结

Replay 并不是录像，它也不是棋盘快照。Replay 保存的只是游戏过程中产生的 Command。

真正让 Replay 成立的不是 Replay 本身，而是 Runtime 的确定性。正因为整个游戏始终遵循：**相同输入，产生相同输出**。

Replay 才能够以极小的数据量完整重现整局游戏，这也是整个项目架构设计所带来的自然结果。

# 下一步阅读

Replay 记录了游戏如何发生，下一章将介绍：**Battle**。了解多人对战如何建立在同一套 Runtime 之上，而无需重新实现另一套游戏逻辑。

**下一章：[06-battle.md](./06-battle.md)**
