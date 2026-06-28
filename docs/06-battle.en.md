# Battle

English | [简体中文](./06-battle.md)

> Battle is not another game, but multiple Runtimes working together in the same match.

---

## Why Battle?

For Tetris, multiplayer battles are not just about: **displaying two boards simultaneously**. What is truly complex is:

* Both sides need to run simultaneously
* Both sides have independent states
* Both sides need to exchange Garbage
* Both sides still need to remain deterministic

Many projects re-implement a new set of game logic for multiplayer mode. While this can achieve the functionality, single-player and multiplayer gradually evolve into two different systems. As the project continues to expand, maintenance costs increase.

---

## Battle is Not Another Game

Therefore, tetris.js is not designed as two different systems. Battle does not modify Gameplay, nor does it modify Runtime. What truly changes is the number of Runtimes.

**Single-player mode:**

```text
Runtime
```

**Multiplayer mode:**

```text
Runtime A
↓
Battle Controller
↑
Runtime B
```

Both sides still run their own complete games. The Battle Controller is only responsible for coordinating the information that needs to be exchanged between them. Therefore, Battle does not create new game rules; it only organizes multiple Runtimes to run together.

---

## Each Player Has Their Own Independent Runtime

In Battle, each player has their own independent:

* Board
* Store
* Scheduler
* Renderer
* Audio
* Replay
* AI (optional)

That is to say, Battle does not have a "shared board." Both sides always have completely independent game states. This design allows:

* Player vs Player
* Player vs AI
* AI vs AI

All to be built on the same architecture.

---

## How Does Garbage Synchronize?

What Battle truly needs to coordinate is only the data exchanged between both sides. For example:

* Number of lines cleared
* Combo
* Back-to-Back
* Garbage

When one side completes an attack, the Battle Controller calculates the corresponding Garbage according to the game rules. It then sends this event to the other side's Runtime.

What truly modifies the board is still the receiving side's own Runtime. The Battle Controller never directly modifies any player's game state.

---

## Battle and AI

AI does not know it is in a Battle. It still only thinks and outputs Commands. What truly participates in Battle is still Runtime.

Therefore:

* Player vs Player
* Player vs AI
* AI vs AI

The entire execution flow is completely consistent. Battle does not generate new game logic just because AI joins.

---

## Battle Controller

What the Battle module is truly responsible for:

* Managing multiple Runtimes
* Forwarding Battle events
* Synchronizing Garbage
* Determining win/loss
* Controlling the match lifecycle

It does not:

* Control players
* Control AI
* Modify the board
* Render the screen

The Battle Controller is more like a match referee than another game engine.

---

## Why Can Battle Naturally Join?

Battle may look like a new feature added to the project. In reality, it is just a natural result of the Runtime architecture's evolution.

Because:

* Runtime is already responsible for organizing the game
* Commands already unify input
* Store already centrally manages state
* Replay already ensures determinism

Battle almost doesn't need to redesign these systems. It simply makes multiple Runtimes run simultaneously. This is also a demonstration of the entire architecture's extensibility.

---

## Summary

Battle did not re-implement Tetris. It simply makes multiple Runtimes work together in the same match. Each player, whether human or AI, has their own Runtime. The Battle Controller coordinates the interaction between them.

Therefore, Battle is not a feature outside the architecture. It is just an application naturally extended from Runtime capabilities.

---

## Next Reading

Up to this point, Runtime, AI, Replay, and Battle have all been covered. Next, we will enter the development guide. Learn about the entire project's directory structure, module division, and how to participate in development.

**Next Chapter: [07-development.en.md](./07-development.en.md)**
