# tetris.js

[![npm version](https://img.shields.io/npm/v/@yaohaixiao/tetris.js)](https://www.npmjs.com/package/@yaohaixiao/tetris.js)
[![prettier code style](https://img.shields.io/badge/code_style-prettier-07b759.svg)](https://prettier.io)
[![npm downloads](https://img.shields.io/npm/dt/@yaohaixiao/tetris.js)](https://npmcharts.com/compare/@yaohaixiao/tetris.js?minimal=true)
[![MIT License](https://img.shields.io/github/license/yaohaixiao/tetris.js.svg)](https://github.com/yaohaixiao/tetris.js/blob/main/LICENSE)

[简体中文](./README.md) | English

![Tetris Game Screenshot](assets/img/screen-shot.png)

tetris.js is a zero-dependency, highly extensible vanilla JavaScript Tetris
game. It is a pure front-end implementation compatible with multiple platforms
and input devices. The project features a production-grade layered architecture,
making it ready for commercial or personal use, and also serving as an excellent
reference for learning 2D Canvas game architecture.

## Features

The game fully implements the core mechanics of classic Tetris, including piece
generation, movement, rotation, dropping, collision detection, line clearing,
leveling up, and score tracking, complemented by rich UI rendering, animations,
and interactive feedback.

### Game Controls

- **Keyboard**: Arrow keys for movement and rotation, Space for hard drop, P to
  pause, M to toggle background music, R to restart, Q to quit, S to toggle AI
  mode;
- **Gamepad**: Fully supported, with Left Stick and D-Pad operation;
- **Mobile Touch**: Replicates a GameBoy-style virtual keypad for complete touch
  screen support;

<p align="center">
  <img src="assets/img/game-boy-layout.png" alt="Tetris Screenshot - GAME BOY Layout">
</p>

### Levels & Difficulty

- **Level Selection**: Supports Levels 1–10 (Keyboard: 1-9 keys / T key;
  Gamepad/Touch: Up/Down buttons);
- **Difficulty Selection**: Easy / Normal / Hard / Expert (Keyboard: E/N/H/X
  keys; Gamepad/Touch: A/B/Y/X buttons);
- **Total 256 Stages**: A tribute to classic console design. The stages loop
  back after reaching Stage 256;

### Game Rules

- **Drop Speed**: The initial drop interval at Level 1 is 1000ms. It smoothly
  accelerates within the first 60% of stages, reaching a maximum speed of 100ms.
- **Scoring Rules**: Clear Score = Base Score × Current Stage Level (e.g., 100
  points for 1 line, 800 points for a Tetris).
- **Level-Up Rules**: Dynamic leveling conditions are used. Initially, only 10
  lines are needed to level up. The required lines gradually increase, up to a
  maximum of 60 lines per single level.

### Audiovisual Experience

- **16 Background Music Tracks**: Automatically switches tracks every 16 stages,
  covering Classic, Electronic, Folk, Synthwave, and various other styles;
- **16 Line-Clear Sound Effect Sets**: Chord and sound parameters change
  progressively with stages for an evolving auditory experience;
- **8 Piece Color Palettes**: Switches every 32 stages, transitioning from
  classic bright colors to special themes like Neon and Gem;
- **Animation Effects**: Includes countdowns, line-clear flashes, floating
  scores, landing highlights, level-up celebrations, and pause timers;

### System Capabilities

- **Replay**: After the game ends, watch a complete replay of the entire
  session's actions (Video:
  https://www.bilibili.com/video/BV1oRVA6uEXG/?vd_source=8d9b68dd3ed316bb9b3a13e3f3f778eb)
- **AI Control**: Features multi-step look-ahead, selecting optimal placement
  strategies via board evaluation algorithms with support for different
  difficulty levels; (Video:
  https://www.bilibili.com/video/BV1GPG86KEcy/?vd_source=8d9b68dd3ed316bb9b3a13e3f3f778eb)
- **Local Storage**: Automatically persists the highest game score;
- **Responsive Layout**: Perfectly adapts to desktop, tablet, and mobile
  screens;

### Technical Highlights

- **Vanilla JavaScript**: Developed with pure vanilla JavaScript and zero
  third-party dependencies;
- **Modular Design**: Based on the ES Module (ESM) specification, each module
  (audio, rendering, logic) is highly decoupled, making maintenance and
  replacement easy;
- **Layered Architecture**: Adopts a Layered Architecture with component-based
  design;
- **Centralized State Management**: GameStore-based centralized state management
  uses pure functions for data updates, completely separating game logic from
  rendering. Combined with the Command Pattern, it natively supports replay and
  AI training;
- **Independent Scheduler**: Uses a dedicated scheduler to drive all animations
  and sound effects, unaffected by browser frame rate;
- **Comprehensive Testing Suite**: Unit tests with Jest, End-to-End tests with
  Cypress;

## Architecture

This project adopts a layered architecture design with clear structure, high
modularity, and strong maintainability. It is not only suitable for developing
games like Tetris but also serves as a general architectural reference for small
front-end 2D canvas games, easily adaptable to other game genres.

![System Architecture Diagram](assets/img/architecture-poster.png)

## Architecture Advantages

- **Clear Module Division**: Each layer has well-defined responsibilities with
  low coupling between modules. Utilities, game rules, service modules, and the
  runtime core each perform their specific duties, making maintenance and
  expansion straightforward.
- **Centralized State Management**: All core game state is unified in the
  `GameStore` and updated via the pure function `stateHandler`, preventing
  scattered data. This design natively supports **replay** and reserves
  extensibility for advanced features like time-travel debugging.
- **Command Pattern Driven Main Loop**: Player actions, AI decisions, and
  automatic piece drops are encapsulated as standard command objects, enabling
  the recording, replay, and management of operations. This is the underlying
  support for the replay system and AI gameplay.
- **Event Bus for Module Decoupling**: Communication uses the publish-subscribe
  pattern. Events like line clears, level-ups, and game over are broadcast
  uniformly. Rendering, audio, and animation modules respond independently
  without mutual dependency.
- **Unified Task Scheduling System**: A dedicated `Scheduler` coordinates all
  timed tasks, ensuring precise timing for piece drops, animations, sound
  effects, and AI calculations, unaffected by frame rate fluctuations. Game
  logic is stably reproducible.
- **Unified Abstraction for Multiple Input Channels**: Keyboard, gamepad, and
  touch inputs are all mapped to standard game commands. Upper-level logic does
  not need to perceive the input device type, reducing integration costs for new
  devices.
- **Deterministic Game Logic**: State changes are solely determined by commands
  and time, with no random side effects or implicit dependencies. The same input
  always produces consistent results, suitable for replays, issue reproduction,
  and AI simulation scenarios.
- **Pluggable Extension Design**: Audio, animation, AI, and replay
  functionalities are independent, pluggable modules that do not intrude on core
  logic, making feature additions and version iterations more flexible.
- **Isolation of AI and Core Logic**: The AI only deduces optimal strategies
  using game state snapshots and never directly modifies runtime data. The
  architecture is robust and facilitates iteration of different algorithms and
  difficulty modes.
- **Separation of Runtime and Presentation Layers**: The core runtime layer
  handles rules and state management, while the rendering layer focuses on
  drawing. Canvas rendering can be seamlessly replaced with WebGL, and the core
  logic can be ported to server-side or Mini-Program environments.

## Development Guide

- Game Base Configuration: `lib/configuration.js`;
- **Modifying Piece Style/Color Palette**:
  - Color Configuration: `lib/game/contants/color-paletters.js`;
  - Piece Styles: `lib/game/contants/shapes.js`;
- **Adding Background Music/Sound Effects**: Add resources and stage mappings in
  the audio module:
  - Background Music:
    - Add BGMs: `lib/services/audio/constants/bgm`;
    - Register BGMs: `lib/services/audio/constants/musics.js`;
  - Sound Effects: `lib/services/audio/sounds.js`;
- **Game Animation Configuration**:
  - Animation Management System: `lib/runtime/animation-system.js`;
  - Adding Animations: `lib/services/animations`. Refer to existing animation
    code comments for implementation details;
  - Registering Animations:
    - Subscribe to Animation Messages: Listen for animation trigger messages in
      `lib/game/index.js`;
    - Execute Animation:
      `this.Animations.register(new CountdownAnimation({ Scheduler, Game: this }))`;
    - Dependency Injection: The `{ Scheduler, Game: this }` configuration object
      contains the required dependencies. Inject dependencies as needed;
- **EventBus Event Management**:
  - Event Registration: `lib/events/event-catalog.js`;
  - Event Routing: Add routing modules in `lib/events/router` (when a module
    subscribes to more than 6 events);
- **Customizing Game Rules (Speed, Scoring, Level-Up)**: Modify rule calculation
  functions:
  - Speed Configuration: `lib/game/rules/get-speed.js`;
  - Line Clear Base Score: `lib/game/constants/game.js`;
  - Scoring/Leveling: `lib/game/actions/apply-clear-lines.js`;
- **Extending New Input Devices**:
  - Adding: Add a new adapter in the `lib/services/input` layer (extend the Base
    class, implement dependency injection and message publishing/subscription);
  - Registering: Register it in the game core module at `lib/game/index.js`
    (refer to existing Keyboard, Gamepad, and Touch implementations);
- **Input/Command Mapping**:
  - Input Mapping: `lib/engine/dispatch-input.js`;
  - Command Mapping: `lib/engine/dispatch-command.js`;
  - Adding Instruction Sets: `lib/game/actions/difficulty-actions.js`;
- **AI Configuration**:
  - Difficulty Configuration: `lib/ai/core/ai-difficulty.js`;
  - Decision Planning Configuration: `lib/ai/planner/self-play.js`;

## Browser Compatibility

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" width="24"/>](#) Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" width="24"/>](#) Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" width="24"/>](#) Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" width="24"/>](#) Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" width="24"/>](#) Opera |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 128 – 131                                                                                                              | 130 – 132                                                                                                                       | 109 – 131                                                                                                                    | 17.5 – 18.1                                                                                                                  | 113 – 114                                                                                                                 |

**Note**: This project uses standard ES6+, Canvas, and Gamepad APIs and is not
compatible with IE browsers.

## Control Instructions

tetris.js supports multiple control methods: Keyboard, Gamepad, and a simulated
GAME BOY keypad for mobile devices.

### Keyboard Controls

- Enter: Start Game
- ↑: Rotate Piece
- ← / →: Move Piece Left/Right
- ↓: Soft Drop
- Space: Hard Drop
- M: Toggle Background Music
- P: Pause/Resume Game
- R: Restart Game
- Q: Force Quit Game
- B: Return to Level Selection from Difficulty Selection
- S: Toggle AI / Manual Control

#### Level Selection

- 1–9: Select Levels 1 through 9
- T: Select Level 10

#### Difficulty Selection

- E: Easy (Start with 0 preset rows)
- N: Normal (Start with 3 preset rows)
- H: Hard (Start with 6 preset rows)
- X: Expert (Start with 9 preset rows)

### Gamepad Controls

- START: Start Game
- BACK:
  - Force Quit Game during gameplay
  - Return to Level Selection from Difficulty Selection
- RB: Toggle AI / Manual Control
- Left Stick / D-Pad:
  - ↑: Rotate Piece
  - ← / →: Move Piece Left/Right
  - ↓: Soft Drop
- X: Restart Game
- Y: Pause/Resume Game
- A: Toggle Background Music
- B: Hard Drop

#### Level Selection

- D-Pad ↑: Increase Level
- D-Pad ↓: Decrease Level

#### Difficulty Selection

- A: Easy
- B: Normal
- Y: Hard
- X: Expert

### Mobile Touch Controls (GameBoy Layout)

- ↑: Rotate Piece
- ↓: Soft Drop
- ←: Move Left
- →: Move Right
- BACK: Force Quit Game
- A: Toggle Background Music
- B: Soft Drop
- X: Pause Game
- Y: Restart Game

#### Level Selection

- ↑ / ↓: Adjust Level (Min 1, Max 10)
- START: Enter Difficulty Selection

#### Difficulty Selection

- A: Easy
- B: Normal
- Y: Hard
- X: Expert
- BACK: Return to Level Selection

## Game Rules

### Drop Speed

The piece drop interval is calculated by the `getSpeed()` function. The game
starts at Level 1 (1000ms/cell), using the formula:

`step = ceil(1000 / floor(MAX_LEVEL × 0.6))`

Within the first 60% of the maximum level `MAX_LEVEL` (256), the drop speed
increases smoothly and linearly until it reaches its limit. The remaining 40% of
stages maintain the maximum speed of 100ms/cell, focusing the player on
survival.

### Scoring Rules

Final Score = Single Clear Base Score × Current Stage Level

| Lines Cleared    | Base Score |
| :--------------- | :--------- |
| 1 Line           | 100        |
| 2 Lines          | 300        |
| 3 Lines          | 500        |
| 4 Lines (Tetris) | 800        |
| 5 Lines          | 1200       |

**Example**: Clearing 4 lines at Level 1 gives 800 × 1 = 800 points; clearing 4
lines at Level 50 gives 800 × 50 = 40,000 points.

### Level-Up Rules

The game implements dynamic level-up conditions via `levelUpSteps`. The first
level-up requires clearing only 10 lines. Subsequently, the required number of
lines increases by 2 per level (10 → 12 → 14...), up to a maximum requirement of
60 lines per single level.

The game features a total of 256 stages. After reaching the maximum stage, the
level number loops back, honoring classic console game design.

### Piece Color Palette Rules

The game includes 8 distinct piece color palettes, automatically switching every
32 stages to maintain a rich visual experience even at higher levels.

| Stages  | Palette | Style Description        |
| :------ | :------ | :----------------------- |
| 1-32    | Classic | Default vibrant colors   |
| 33-64   | Warm    | Energetic warm tones     |
| 65-96   | Cool    | Refreshing cool tones    |
| 97-128  | Candy   | Sweet candy colors       |
| 129-160 | Forest  | Natural forest tones     |
| 161-192 | Sunset  | Warm sunset hues         |
| 193-224 | Neon    | Bright neon colors       |
| 225-256 | Gem     | Brilliant gemstone tones |

### Background Music Rules

The game includes 16 background music tracks of different styles, automatically
switching as stages progress. Tracks change every 16 stages.

| Stages  | Track Name       | Style               |
| :------ | :--------------- | :------------------ |
| 1-16    | TetrisTheme      | Classic Main Theme  |
| 17-32   | SpringFestival   | Festive Celebration |
| 33-48   | FirstDivision    | Classic Folk        |
| 49-64   | GongXiFaCai      | Festive Blessing    |
| 65-80   | Loginska         | Electronic Groove   |
| 81-96   | BeyondTheWall    | Distant Mystery     |
| 97-112  | Technotris       | Techno Electronic   |
| 113-128 | GoldenSnakeDance | Eastern Flair       |
| 129-144 | Korobeiniki      | Classic Folk        |
| 145-160 | Ascension        | Ethereal Ascent     |
| 161-176 | NeonNights       | Neon Synthwave      |
| 177-192 | FrozenPeaks      | Cold & Solitary     |
| 193-208 | CyberRush        | Cyber High-Speed    |
| 209-224 | Starlight        | Starry Dream        |
| 225-240 | FinalPush        | Ultimate Challenge  |
| 241-256 | JourneyToWest    | Epic Finale         |

**PS**: Have fun playing! If you like it, please consider starring the project to support it!

## License

- tetris.js Project: Open-sourced under the
  [MIT License](http://opensource.org/licenses/mit-license.html)
- Press Start 2P Font (Google Open Source Font): Open-sourced under the
  [OFL License](assets/font/OFL.txt)
