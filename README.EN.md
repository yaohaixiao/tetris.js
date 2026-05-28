# tetris.js

[![npm version](https://img.shields.io/npm/v/@yaohaixiao/tetris.js)](https://www.npmjs.com/package/@yaohaixiao/tetris.js)
[![prettier code style](https://img.shields.io/badge/code_style-prettier-07b759.svg)](https://prettier.io)
[![npm downloads](https://img.shields.io/npm/dt/@yaohaixiao/tetris.js)](https://npmcharts.com/compare/@yaohaixiao/tetris.js?minimal=true)
[![MIT License](https://img.shields.io/github/license/yaohaixiao/tetris.js.svg)](https://github.com/yaohaixiao/tetris.js/blob/main/LICENSE)

[简体中文](./README.md) | English

![Tetris game screenshot](assets/img/screen-shot.png)

tetris.js is a zero-dependency native JavaScript Tetris game built on Canvas,
supporting multi-platform input and AI control. The project adopts a fixed-frame
process-driven architecture, combined with a Scheduler, Command Queue, and
Replay system to achieve a clear game update pipeline. It serves as a
lightweight example of front-end game engine design and architectural practices.

## Features

![Tetris game-Features](assets/img/features-poster.png)

The game fully implements the core features of classic Tetris, including piece
generation, movement, rotation, descent, collision detection, line clearing,
leveling up, score tracking, etc., complemented by rich interface rendering,
animations, and interactive feedback.

### Game Controls

- **Computer Keyboard**: Arrow keys for movement and rotation, Spacebar for hard
  drop, P to pause, M to toggle background music, R to restart, Q to quit, S to
  toggle AI mode.
- **Gamepad**: Fully supported, works with both left analog stick and D-pad.
- **Mobile Touch**: Replicates GameBoy-style virtual buttons, fully supports
  touchscreen operation.

<p align="center">
  <img src="assets/img/game-boy-layout.png" alt="Tetris game screenshot - GAME BOY layout">
</p>

### Level & Difficulty

- **Level Selection**: Supports levels 1-10 (Keyboard keys 1-9 / T,
  gamepad/touch use up/down buttons).
- **Difficulty Selection**: Easy / Normal / Hard / Expert (Keyboard keys
  E/N/H/X, gamepad/touch buttons A/B/Y/X).
- **Total 256 Levels**: Pays homage to classic FC game design; level cycles
  after reaching 256.

### Game Rules

- **Fall Speed**: Initial fall interval at level 1 is 1000ms, smoothly
  accelerates within the first 60% of levels, reaching a terminal speed of
  100ms.
- **Scoring Rules**: Score = Base points × Current level (100 points for 1 line,
  800 points for 4 lines).
- **Level Up Rules**: Uses dynamic level-up conditions. Initially requires
  clearing 10 lines to level up; required lines increase gradually, max 60 lines
  per level.

### Audiovisual Experience

- **16 BGM Tracks**: Automatically switches tracks every 16 levels, covering
  classic, electronic, folk, synthwave, and more.
- **16 Line-Clear SFX**: Chords and instrumentation parameters change with
  levels, offering progressive auditory feedback.
- **8 Color Palettes**: Switches every 32 levels, transitioning from classic
  bright colors to neon, gemstone, and other themed palettes.
- **Animation Effects**: Includes countdown, line-clear flash, floating scores,
  landing highlight, level-up celebration, pause timer, and more.

### System Capabilities

- **Action Replay**: After a game ends, you can watch a full replay of the
  entire gameplay session (Video: link).
- **AI Control**: Features multi-step lookahead, selecting optimal placements
  via board evaluation algorithms, with adjustable difficulty levels (Video:
  link).
- **Local Storage**: Automatically persists the highest score.
- **Responsive Layout**: Perfectly adapts to desktop, tablet, and mobile
  screens.

### Technical Highlights

- **Native JavaScript**: Developed purely in native JavaScript, zero third-party
  dependencies.
- **Modular Design**: Based on ES Module (ESM) specification; modules (audio,
  rendering, logic) are highly decoupled, easy to maintain and replace.
- **Layered Architecture**: Adopts layered architecture and component-based
  design.
- **Centralized State Management**: Uses GameStore for centralized state
  management, updating data via pure functions, achieving complete separation of
  game logic and rendering. Combined with Command Pattern, natively supports
  recording and AI training.
- **Independent Scheduler**: A dedicated scheduler drives all animations and
  sound effects, unaffected by browser frame rate.
- **Comprehensive Testing**: Uses Jest for unit testing and Cypress for
  end-to-end testing.

## Architecture Description

This project adopts a layered architecture design, offering clear structure,
high modularity, and strong maintainability. It serves not only as a reference
for Tetris development but also as a general architecture for small front-end 2D
canvas games, adaptable to other game types with minor modifications.

![System Architecture Diagram](assets/img/architecture-poster.png)

## Architecture Advantages

- **Clear Modularization**: Clear responsibilities for each layer, low coupling
  between modules. Base utilities, game rules, services, and core runtime each
  have their roles, making maintenance and extension very convenient.
- **Centralized State Management**: All core game states are stored in
  `GameStore`, updated via pure functions in `stateHandler`, avoiding scattered
  data. This design natively supports **action replay** and allows for future
  extensions like time-travel debugging.
- **Command Pattern Drives Main Loop**: Player actions, AI decisions, and
  automatic piece descent are all encapsulated as standard command objects,
  enabling recording, replay, and management of operations, forming the
  foundation for replay and AI features.
- **Event Bus for Module Decoupling**: Based on publish-subscribe pattern,
  events like line clear, level up, game over are broadcast uniformly.
  Rendering, audio, and animation modules respond independently without
  depending on each other.
- **Unified Task Scheduling System**: A dedicated `Scheduler` coordinates all
  timed tasks, ensuring precise timing for piece descent, animations, sound
  effects, and AI calculations, unaffected by frame rate fluctuations, ensuring
  reproducible game logic.
- **Unified Abstraction for Multiple Input Channels**: Keyboard, gamepad, and
  touch actions are all mapped to standard game commands. Upper-layer logic
  doesn't need to know the input device type, reducing integration costs for new
  devices.
- **Deterministic Game Logic**: State changes are determined solely by commands
  and time, with no random side effects or implicit dependencies. Same input
  always yields the same result, suitable for replay, bug reproduction, and AI
  simulation.
- **Plug-in Extension Design**: Audio, animation, AI, replay, etc., are
  independent pluggable modules, not intruding into core logic, allowing
  flexible addition of new features and version iterations.
- **AI Separation from Core Logic**: AI only simulates optimal strategies based
  on game state snapshots, without modifying runtime data. The architecture is
  robust, facilitating iteration of different algorithms and difficulty modes.
- **Separation of Runtime and Presentation**: The core runtime handles rules and
  state management, while the rendering layer focuses on drawing. Currently
  using Canvas, it can be extended to WebGL or port the core logic to
  server-side, mini-program, and other environments.

## Development Guide

- Basic game configuration: `lib/configuration.js`.
- Modify block styles/color palettes:
  - Color palette config: `lib/game/constants/color-palettes.js`.
  - Block shapes: `lib/game/constants/shapes.js`.
- Add BGM/SFX: Add resources and level mappings in audio module.
  - BGM:
    - Add BGM: `lib/services/audio/constants/bgm`.
    - Register BGM: `lib/services/audio/constants/musics.js`.
  - Game SFX: `lib/services/audio/sounds.js`.
- Game animation configuration:
  - Animation management system: `lib/runtime/animation-system.js`.
  - Add new animations: `lib/services/animations`, refer to existing animation
    code comments.
  - Register animations:
    - Subscribe to animation trigger messages in `lib/game/index.js`.
    - Execute animation:
      `this.Animations.register(new CountdownAnimation({ Scheduler, Game: this }))`.
    - Dependency injection: `{ Scheduler, Game: this }` provides needed
      dependencies.
- EventBus event management:
  - Message registration: `lib/events/event-catalog.js`.
  - Event routing: Add router module in `lib/events/router` (if module
    subscribes to >6 messages).
- Custom game rules (speed, scoring, leveling): Modify rule calculation
  functions:
  - Speed config: `lib/game/rules/get-speed.js`.
  - Lines cleared scoring: `lib/game/constants/game.js`.
  - Scoring/Leveling: `lib/game/actions/apply-clear-lines.js`.
- Extend for new input devices:
  - Add adapter in `lib/services/input` layer (inherit Base class, implement
    dependency injection and message pub/sub).
  - Register in `lib/game/index.js` (refer to existing Keyboard, Gamepad, and
    Touch).
- Input/Command mapping:
  - Input mapping: `lib/engine/dispatch-input.js`.
  - Command mapping: `lib/engine/dispatch-command.js`.
  - Add command set: `lib/game/actions/difficulty-actions.js`.
- AI configuration:
  - Difficulty config: `lib/ai/core/ai-difficulty.js`.
  - Decision planning config: `lib/ai/planner/self-play.js`.

## Browser Compatibility

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" width="24"/>](#) Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" width="24"/>](#) Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" width="24"/>](#) Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" width="24"/>](#) Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" width="24"/>](#) Opera |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 128 – 131                                                                                                              | 130 – 132                                                                                                                       | 109 – 131                                                                                                                    | 17.5 – 18.1                                                                                                                  | 113 – 114                                                                                                                 |

**Note**: The project uses standard ES6+, Canvas, Gamepad API, and is not
compatible with Internet Explorer.

## Game Controls

tetris.js supports various control methods: keyboard, gamepad, and simulated
GAME BOY buttons for mobile devices.

### Keyboard Controls

- Enter: Start game
- ↑: Rotate piece
- ← / →: Move piece left/right
- ↓: Soft drop
- Space: Hard drop
- M: Toggle background music
- P: Pause/Resume game
- R: Restart game
- Q: Force quit game
- B: Return to level selection from difficulty selection
- S: Toggle AI / Human control

#### Level Selection

- 1–9: Select level 1 to 9
- T: Select level 10

#### Difficulty Selection

- E: Easy (0 preset lines)
- N: Normal (3 preset lines)
- H: Hard (6 preset lines)
- X: Expert (9 preset lines)

### Gamepad Controls

- START: Start game
- BACK:
  - Force quit during game
  - Return to level selection from difficulty selection
- RB: Toggle AI / Human control
- Left analog stick / D-pad:
  - ↑: Rotate piece
  - ← / →: Move piece left/right
  - ↓: Soft drop
- X: Restart game
- Y: Pause/Resume game
- A: Toggle background music
- B: Hard drop

#### Level Selection

- D-pad ↑: Increase level
- D-pad ↓: Decrease level

#### Difficulty Selection

- A: Easy
- B: Normal
- Y: Hard
- X: Expert

### Mobile Touch (GameBoy Layout)

- ↑: Rotate piece
- ↓: Soft drop
- ←: Move left
- →: Move right
- BACK: Force quit game
- A: Toggle background music
- B: Soft drop
- X: Pause game
- Y: Restart game

#### Level Selection

- ↑ / ↓: Adjust level (min 1, max 10)
- START: Enter difficulty selection

#### Difficulty Selection

- A: Easy
- B: Normal
- Y: Hard
- X: Expert
- BACK: Return to level selection

## Game Rules

### Fall Speed

The piece fall interval is calculated by `getSpeed()`. The game starts at level
1 (1000 ms/cell). Formula:

`step = ceil(1000 / floor(MAX_LEVEL × 0.6))`

Within the first 60% of the `MAX_LEVEL` (256 levels), the fall speed increases
linearly until reaching the limit. The remaining 40% of levels maintain the
terminal speed of 100 ms/cell, allowing players to focus on survival challenges.

### Scoring Rules

Final Score = Base points per clear × Current level

| Lines cleared    | Base points |
| :--------------- | :---------- |
| 1 line           | 100         |
| 2 lines          | 300         |
| 3 lines          | 500         |
| 4 lines (Tetris) | 800         |
| 5 lines          | 1200        |

**Example**: Clearing 4 lines at level 1 gives 800 × 1 = 800 points. Clearing 4
lines at level 50 gives 800 × 50 = 40000 points.

### Level Up Rules

The game uses `levelUpSteps` for dynamic level-up conditions. The first level-up
requires clearing only 10 lines, and each subsequent level requires 2 more lines
(10 → 12 → 14...), max 60 lines per level.

There are 256 levels in total. Upon reaching the maximum level, the level value
cycles back, paying homage to classic FC game design.

### Color Palette Rules

The game includes 8 built-in color palettes, automatically switching every 32
levels to maintain visual variety at higher levels.

| Level range | Palette | Style description        |
| :---------- | :------ | :----------------------- |
| 1-32        | Classic | Default bright colors    |
| 33-64       | Warm    | Energetic warm tones     |
| 65-96       | Cool    | Refreshing cool tones    |
| 97-128      | Candy   | Sweet candy colors       |
| 129-160     | Forest  | Natural forest hues      |
| 161-192     | Sunset  | Warm sunset tones        |
| 193-224     | Neon    | High-brightness neon     |
| 225-256     | Gem     | Brilliant gemstone tones |

### Background Music Rules

The game features 16 different BGM tracks, automatically switching every 16
levels as the game progresses.

| Level range | Track name       | Style                     |
| :---------- | :--------------- | :------------------------ |
| 1-16        | TetrisTheme      | Classic main theme        |
| 17-32       | SpringFestival   | Festive celebratory style |
| 33-48       | FirstDivision    | Classic folk style        |
| 49-64       | GongXiFaCai      | Festive blessing style    |
| 65-80       | Loginska         | Electronic rhythmic style |
| 81-96       | BeyondTheWall    | Mysterious ethereal style |
| 97-112      | Technotris       | Tech electronic style     |
| 113-128     | GoldenSnakeDance | Oriental charm style      |
| 129-144     | Korobeiniki      | Classic folk              |
| 145-160     | Ascension        | Ethereal ascension style  |
| 161-176     | NeonNights       | Neon synthwave            |
| 177-192     | FrozenPeaks      | Cold, lofty style         |
| 193-208     | CyberRush        | Cyber high-speed style    |
| 209-224     | Starlight        | Starry dreamy style       |
| 225-240     | FinalPush        | Ultimate challenge style  |
| 241-256     | JourneyToWest    | Epic finale style         |

**PS**: Enjoy the game, and don't forget to STAR if you like it!

## Open Source License

- tetris.js project: Open-sourced under the
  [MIT License](http://opensource.org/licenses/mit-license.html)
- Press Start 2P font (Google open-source font): Open-sourced under the
  [OFL License](assets/font/OFL.txt)
