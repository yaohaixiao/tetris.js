# Development

English | [简体中文](./07-development.md)

> This chapter introduces tetris.js project structure, module division, and development philosophy, helping developers quickly understand the entire project.

---

## Development Philosophy

tetris.js is not organized around a single page, nor does it add modules by "stacking features." The entire project always revolves around Runtime.

Adding new features typically means adding new modules rather than modifying existing ones. Therefore, as the project continues to evolve, the overall architecture still maintains low coupling.

---

## Project Structure

The project is mainly organized using a modular directory structure. A typical directory structure looks like this:

```text
lib/
│
├── ai/
│
├── battle/
│
├── core/
│
├── engine/
│
├── game/
│
├── runtime/
│
├── services/
│
├── state/
│
└── utils/
```

Different modules are responsible for different responsibilities and try to remain as independent as possible from each other.

---

## Module Responsibilities

The core modules of tetris.js include: Engine, Core, Game, State, Services, Runtime, AI, Battle, and Utils.

### Engine

The core of the entire project. It is the concrete Runtime responsible for organizing the entire game lifecycle, including:

* Game Loop
* Command Dispatch
* Input Dispatch
* State Update
* Scheduler
* Renderer

Engine is not responsible for specific gameplay; it drives all modules to work together.

---

### Core

The foundational module of the project, including:

* Base Class
* Command System - includes Command and Command Queue
* Event Bus

Responsible for module base classes (dependency injection), command management, and event bus publish/subscribe messaging.

### Game

The Game module is responsible for the rules of Tetris itself. For example:

* Piece generation
* Collision detection
* Line clearing
* Hold
* Score
* Level

These rules serve both players and AI.

---

### State

Store saves the state of the Game instance. For example:

* Board
* Current Piece
* Hold
* Next Queue
* Score
* Level

All Game submodules share the same state to avoid multiple modules maintaining different copies of data.

---

### Services

Services provide various general capabilities. For example:

* Input system
* Audio system
* UI
* Animation

They usually do not depend on specific game rules and can therefore be reused across different modules.

---

### Runtime

Runtime provides additional runtime auxiliary capabilities. For example:

* Replay Controller
* Animation System

They handle game replay and control the registration and playback of game animations.

---

### AI

AI is responsible for:

* Search
* Simulation
* Scoring
* Decision-making

The final output is Command, which Runtime executes uniformly. Therefore, AI never directly modifies game state.

---

### Battle

Battle is responsible for managing multiple Runtimes.

For example:

* Player vs Player
* Player vs AI

Battle itself does not modify any Runtime; it is only responsible for coordinating data exchange between both sides.

---

### Utils

Provides globally shared utility functions.

---

## How Do Modules Collaborate?

The data flow of the entire project remains consistent at all times.

![Modules Diagram](assets/img/modules-diagram.png)

AI, Replay, and Battle all follow the same workflow. This design ensures that the entire project always has only one set of game logic.

---

## Adding a New Feature

As the project continues to expand, adding new features typically follows these principles:

* Prioritize adding modules rather than modifying existing ones.
* Do not directly modify the core flow of Runtime.
* Do not bypass Command to modify state.
* Do not directly manipulate Store.
* Keep Renderer decoupled from Gameplay.

For example, adding a new input method usually only requires:

```text
New Input Controller
↓
Command
↓
Runtime
```

No modification to Gameplay is needed.

Similarly, adding a new AI only requires outputting new Commands; Runtime does not need any adjustment.

---

## Development Suggestions

When reading the source code, it is recommended to understand the entire project in the following order:

1. Runtime
2. Game
3. Store
4. Renderer
5. Scheduler
6. AI
7. Replay
8. Battle

Once Runtime is understood, the data flow of the entire project becomes very clear, and subsequent modules are easier to understand.

---

### Secondary Development Guide

- Game base configuration: `lib/engine/state/engine-state.js`;
- Modify piece styles/color schemes:
  - Color palette configuration: `lib/game/constants/color-palettes.js`;
  - Piece shapes: `lib/game/constants/shapes.js`;
- Add background music/sound effects: Add resources and level mappings in the audio module:
  - Background music:
    - Add background music: `lib/services/audio/constants/bgm.js`;
    - Register background music: `lib/services/audio/constants/musics.js`;
  - Game sound effects: `lib/services/audio/sounds.js`;
- Game animation configuration:
  - Animation management system: `lib/runtime/animation-system.js`;
  - Add new animation: `lib/services/animations`, refer to existing animation code comments for implementation;
  - Register animation:
    - Subscribe to animation messages: Listen for animation trigger messages in `lib/game/index.js`;
    - Execute animation: `this.Animations.register(new CountdownAnimation({ Scheduler, Game: this }))`;
    - Dependency injection: `{ Scheduler, Game: this }`
      Configuration information is the dependencies to be injected; inject dependencies as needed;
- EventBus event management:
  - Message registration: `lib/events/event-catalog.js`;
  - Event routing: `lib/events/router` (add routing module when a module subscribes to more than 6 messages);
- Custom game rules (speed, scoring, leveling): Modify rule calculation functions:
  - Speed configuration: `lib/game/rules/get-speed.js`;
  - Lines cleared scoring: `lib/game/constants/game.js`;
  - Scoring/leveling: `lib/game/actions/apply-clear-lines.js`;
- Extend new input devices:
  - Add new adapter in `lib/services/input` layer (inherit Base class, implement dependency injection and message subscription/publishing);
  - Register: Register in the game core module in `lib/game/index.js` (refer to existing Keyboard, Gamepad, and Touch);
- Input/Command mapping:
  - Input mapping: `lib/engine/dispatch-input.js`;
  - Command mapping: `lib/engine/dispatch-command.js`;
  - Add instruction set: `lib/game/actions`;
- AI configuration:
  - Difficulty configuration: `lib/ai/core/ai-difficulty.js`;
  - Decision planning configuration: `lib/ai/planner/self-play.js`;

---

## Summary

The engineering structure of tetris.js is not organized around pages, but around Runtime. Each module has clear responsibilities. Adding new features typically means adding new modules rather than continuously modifying existing code.

This modular design allows the project to maintain a unified data flow and low maintenance costs as features continue to increase.

---

## Next Reading

Now that you understand how to do secondary development, we need to learn about tetris.js game rules and game control mappings.

**Next Chapter: [08-controls-and-rules.en.md](08-controls-and-rules.en.md)**
