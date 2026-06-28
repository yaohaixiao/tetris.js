# Runtime

English | [简体中文](./03-runtime.md)

> Runtime is not a module, but the core that coordinates all systems throughout
> the entire game runtime.

## What is Runtime?

Many developers, when first getting into game development, start writing game
logic directly. For example:

- Listen to keyboard
- Update board
- Draw Canvas
- Play audio

As features continue to increase, the code grows. Eventually, a game typically
includes:

- Input
- Game Logic
- Rendering
- Animation
- Audio
- AI
- Replay
- Battle

If these modules call each other directly, the entire project quickly becomes
difficult to maintain.

Therefore, a unified organizer is needed. This organizer is the Runtime. It is
not responsible for any specific function. Instead, it ensures all systems work
together according to unified rules.

## Runtime Responsibilities

Runtime does not determine how Tetris is played, nor does it handle screen
rendering, nor does it participate in AI search. What it is truly responsible
for is:

- Managing the game lifecycle
- Driving the Game Loop
- Dispatching Commands
- Updating game state
- Scheduling various systems
- Ensuring all modules share the same timeline

In other words, Runtime is more like the brain of the entire game. Other systems
only need to fulfill their own responsibilities, without worrying about how the
entire game is organized and run.

## Why Does a Game Need Runtime?

Consider the simplest Tetris game. The entire flow might be:

```text
setInterval()
↓
Update Board
↓
Canvas Redraw
```

When the project is small, this implementation is sufficient. However, as more
functional modules join:

- AI
- Replay
- Battle
- Scheduler
- Audio
- Animation

The game is no longer just about updating the board. It starts to have more and
more systems that need to work together. Without Runtime, these modules would
eventually become interdependent. The emergence of Runtime is precisely to
decouple them from each other.

## How Does Runtime Organize the Entire Game?

Runtime can be understood as the scheduling center of the entire game. Once the
game starts, all modules work around the Runtime. The entire execution flow can
be simplified as:

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

For Runtime, where a Command comes from doesn't matter. It could come from:

- Keyboard
- Gamepad
- Touch
- Replay
- AI
- Battle

Runtime only cares about one thing: **executing Commands**. Therefore, the
entire game always has only one set of execution flow.

## Game Loop

The core of Runtime is the Game Loop. The Game Loop is the heartbeat that keeps
the entire game running continuously. Each cycle, Runtime completes:

1. Process input
2. Execute Commands
3. Update game state
4. Advance game time
5. Schedule Scheduler
6. Update animation
7. Update audio
8. Render the screen

The entire game continuously runs around this loop. The Game Loop doesn't care
how specific modules are implemented; it is only responsible for organizing the
execution order.

## Command Dispatch

All operations in Runtime are ultimately converted into Commands. For example:

- Move Left
- Move Right
- Rotate
- Hard Drop
- Hold
- Pause

These Commands have no concept of source. They may come from:

- Players
- Replay
- AI
- (or even future) network synchronization

Runtime is responsible for executing them sequentially according to unified
rules. Therefore, Replay and AI can completely share the same execution flow.

## Store

Runtime does not directly store all data. The actual game state is managed by
the Store. For example:

- Board
- Current Piece
- Hold
- Next Queue
- Score
- Level
- Combo
- Back-to-Back

Runtime is responsible for updating state, while systems like Renderer, Audio,
and Animation perform their work based on the state. This division of
responsibilities keeps the coupling between systems low.

## Scheduler

In addition to game logic, many behaviors have temporal attributes. For example:

- Line Clear Animation
- Audio Playback
- Delayed Garbage Generation
- Countdown
- Special Effects

If all these tasks use `setTimeout()`, it becomes difficult to maintain
consistent timing. Therefore, Scheduler becomes part of Runtime.

All tasks that require waiting are uniformly entered into Scheduler. The Game
Loop advances Scheduler every frame, ensuring the entire game always runs on the
same timeline.

## Renderer

Renderer does not participate in game logic. It is only responsible for
rendering the screen based on the current state. Runtime updates state, Renderer
reads state.

This way, regardless of whether currently running:

- Single-player Mode
- Replay
- AI
- Battle

Renderer does not need to modify any logic.

## AI, Replay, and Runtime

Both AI and Replay are built on top of Runtime. Replay saves Commands, and AI
outputs Commands as well.

Therefore, for Runtime, Replay is no different from a player, and AI is no
different from a keyboard. Runtime always executes a unified data flow. This is
also the key to maintaining determinism throughout the entire project.

## What Does Runtime Bring?

With the establishment of Runtime, more and more new capabilities begin to grow
naturally. For example:

- Replay
- AI
- Battle
- Gamepad
- Touch
- Scheduler
- Audio

None of them need to re-implement a new game. Instead, they share the same
Runtime.

Therefore, adding new features more often means adding new modules rather than
modifying existing systems. This is also the greatest value of Runtime.

## Summary

Runtime is not intended to make the architecture look more complex. On the
contrary, it gives complex systems a unified way of organization.

- For Gameplay, it only cares about game rules;
- For Renderer, it only cares about visuals;
- For AI, it only cares about decision-making;

And Runtime is responsible for bringing all of these together. This is the core
of the entire tetris.js.

## Next Reading

Runtime is responsible for organizing the entire game. What truly determines
game behavior is Gameplay and AI. The next chapter will dive into one of the
most complex systems in the entire project: **AI**. Learn how AI completes
search, simulation, and decision-making without modifying the real board.

**Next Chapter: [04-ai.en.md](./04-ai.en.md)**
