# Architecture

---

English | [简体中文](./02-architecture.md)

> Architecture is not designed, but evolved through the continuous process of solving problems.

![System Architecture Diagram](assets/img/architecture-poster.png)

---

## Why Write This Chapter?

Many projects introduce their architecture by presenting a module diagram. For example:

```
Engine
│
├── Renderer
├── Audio
├── AI
├── Replay
└── ...
```

Such architecture diagrams are certainly fine. But they can only tell us:

> **What it looks like now.**

Yet they fail to answer a more important question:

> **Why did it become this way?**

In fact, the vast majority of software architectures are not designed all at once. They gradually evolve through the continuous process of solving real problems. tetris.js is no exception.

---

## It All Started with a Simple Tetris Game

The initial version of the project had no Runtime, no Scheduler, no Replay, and no AI.

It was just an ordinary browser mini-game. The entire program probably consisted of just a few core parts:

* Canvas
* Board
* Piece
* Keyboard
* Render

The game loop was also very simple.

```
setInterval()
↓
Update Board
↓
Canvas Redraw
```

For the simplest Tetris game, this implementation is perfectly fine. It could even be said that this is the approach most tutorials adopt.

However, as features continued to increase, new problems began to emerge.

---

## First Problem: Code Started to Become Increasingly Scattered

When keyboard control was added, the code needed to listen for:

```
keydown
```

When pause functionality was added, it needed:

```
keyup
```

When touch control was added, it needed:

```
touchstart
touchmove
touchend
```

Later, when Gamepad support was added, another new set of inputs appeared. Gradually, different input devices started directly modifying the game state. For example:

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

They could all directly modify the game. The code still worked, but duplicate logic had already begun to appear.

---

## Second Problem: More and More Systems Started Depending on Game Logic

Later, animation was added, audio was added, Replay was added, AI was added, and Battle was added. If every module could directly modify the game state, then the entire project would eventually become:

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

Every module knows how to operate the game. Every module also depends on the game implementation. Adding a new feature meant modifying multiple places. This is exactly why many small games become increasingly difficult to maintain over time.

---

## First Architectural Evolution: Decoupling Input from Game Logic

So, the project underwent its first major adjustment. All inputs no longer directly modified the game. Instead, they were first converted into unified Commands. For example:

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

The Runtime doesn't know where the Command comes from; it is only responsible for executing it.

This way, Replay, AI, Gamepad, and Touch all share the exact same execution flow. This was the most important step for the entire Runtime.

---

## Second Architectural Evolution: Centralized State Management

As more modules continued to be added, new problems emerged. The Renderer needed to read state, AI needed to read state, Replay needed to read state, and animation also needed to read state. If all modules could modify data, then the state would inevitably become increasingly chaotic.

So, game state began to be centrally managed. All state updates were unified through the Runtime. Other modules were only responsible for reading state or responding to state changes.

From this moment on, the game truly had a stable data flow.

---

## Third Architectural Evolution: Scheduler

Later, more and more asynchronous behaviors appeared. For example:

* Animation
* Line Clear Animation
* Audio Playback
* Countdown
* Delayed Tasks

If we continued to heavily use:

```
setTimeout()
setInterval()
```

Different systems would easily suffer from timing inconsistencies. So, the project added a Scheduler.

All things that required "waiting" were handed over to the Scheduler for unified scheduling. From then on, animation, audio, and Runtime began sharing the same timeline.

---

## Fourth Architectural Evolution: Replay

Once the Runtime ensured deterministic state updates, Replay became simple as well. Replay no longer saved the board. It didn't record video either.

It only saved:

```
Command
```

Because the Runtime guarantees:

```
Same Input
↓
Same State Change
↓
Same Result
```

Replay therefore has an extremely small data footprint while being able to completely reproduce the entire game.

---

## Fifth Architectural Evolution: AI

AI was the most complex step in the entire project's evolution. If AI directly modified the real board, then:

- Replay would break;
- Battle would become complicated;
- Debugging would become increasingly difficult;

Therefore, AI was designed to only be responsible for thinking. The one that actually performed the operations was still the Runtime. After AI completed its search, it would still only submit: `Command`. AI and players truly shared a single set of game rules.

---

## Architecture Has Never Been the Ultimate Goal

To this day, Replay, Battle, AI, Gamepad, Scheduler, Renderer, Audio—all these modules are built on the same Runtime.

They are not independently developed features. They are capabilities that naturally evolved under a unified architecture. This is the design philosophy that tetris.js most wants to express.

> Good architecture is not about showcasing design skills. It is about allowing new capabilities to continuously grow as the project evolves, without having to start over from scratch again and again.

---

## Next Reading

This chapter introduced the entire project's architectural evolution process. The next chapter will truly dive into the Runtime. You will learn:

* How does the Runtime work?
* How does the Game Loop organize the entire system?
* How do Commands drive all modules?
* How does the Scheduler integrate into the entire runtime?

**Next Chapter: [03-runtime.en.md](./03-runtime.en.md)**
