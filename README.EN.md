# tetris.js

[![npm version](https://img.shields.io/npm/v/@yaohaixiao/tetris.js)](https://www.npmjs.com/package/@yaohaixiao/tetris.js)
[![prettier code style](https://img.shields.io/badge/code_style-prettier-07b759.svg)](https://prettier.io)
[![npm downloads](https://img.shields.io/npm/dt/@yaohaixiao/tetris.js)](https://npmcharts.com/compare/@yaohaixiao/tetris.js?minimal=true)
[![MIT License](https://img.shields.io/github/license/yaohaixiao/tetris.js.svg)](https://github.com/yaohaixiao/tetris.js/blob/main/LICENSE)

English | [简体中文](./README.md)

![Tetris Game - Screenshot](assets/img/screen-shot.png)

tetris.js is a zero-dependency, vanilla JavaScript Tetris game built on Canvas,
supporting multi-platform input and AI control. The project adopts a fixed-frame
loop architecture, combining a Scheduler, Command Queue, and Replay system to
create a clear game update pipeline — a lightweight example of front-end game
engine design and architectural practice.

## Features

![Tetris Game - Features](assets/img/features-poster.png)

The game fully implements classic Tetris core mechanics, including piece
generation, movement, rotation, dropping, collision detection, line clearing,
leveling up, and score tracking, complemented by rich UI rendering, animation
effects, and interactive feedback.

### Game Controls

- **Keyboard**: Arrow keys for movement and rotation, Space for hard drop, P to
  pause, M to toggle background music, R to restart, Q to quit, S to toggle AI
  mode;
- **Gamepad**: Fully supported, with left stick and D-pad controls;
- **Mobile Touch**: GameBoy-style virtual buttons for complete touchscreen
  control;

<p align="center">
  <img src="assets/img/game-boy-layout.png" alt="Tetris Game Screenshot - GameBoy Layout">
</p>

### Levels & Difficulty

- **Level Selection**: Supports levels 1-10 (keyboard keys 1-9 / T, gamepad and
  touch use up/down);
- **Difficulty Selection**: Easy / Normal / Hard / Expert (keyboard E/N/H/X,
  gamepad and touch A/B/Y/X);
- **256 Total Levels**: A tribute to classic FC design — after level 256, levels
  loop back;

### Game Rules

- **Drop Speed**: Level 1 starts at 1000ms drop interval, smoothly accelerating
  to a 100ms limit within the first 60% of levels;
- **Scoring**: Score = Base Points × Current Level (1 line = 100 pts, 4 lines =
  800 pts);
- **Leveling**: Dynamic level-up thresholds — starts at 10 lines, increases
  gradually, capping at 60 lines per level;

### Audio-Visual Experience

- **16 Background Music Tracks**: Auto-switching every 16 levels, covering
  classical, electronic, folk, synthwave and more;
- **16 Line-Clear Sound Sets**: Chord and timbre parameters evolve with levels
  for a layered auditory experience;
- **8 Block Color Palettes**: Rotating every 32 levels, transitioning from
  classic bright to neon and jewel themes;
- **Animation Effects**: Countdown, line-clear flashing, floating scores,
  landing highlights, level-up celebrations, pause ticking, and more;

### System Capabilities

- **Replay**: Watch full game replays after game over (Video:
  https://www.bilibili.com/video/BV1oRVA6uEXG/?vd_source=8d9b68dd3ed316bb9b3a13e3f3f778eb);
- **AI Control**: Multi-step lookahead with board evaluation for optimal
  placement decisions, with configurable difficulty levels (Video:
  https://www.bilibili.com/video/BV1GPG86KEcy/?vd_source=8d9b68dd3ed316bb9b3a13e3f3f778eb);
- **Local Storage**: Persistently saves high scores;
- **Responsive Layout**: Perfectly adapts to desktop, tablet, and mobile
  screens;

### Technical Highlights

- **Vanilla JavaScript**: Pure native JavaScript, zero external dependencies;
- **Modular Design**: ES Module (ESM) based, with highly decoupled modules
  (audio, rendering, logic) for easy maintenance and replacement;
- **Layered Architecture**: Adopts a layered architecture with component-based
  design;
- **Centralized State Management**: GameStore-based centralized state management
  with pure function updates, fully separating game logic from rendering.
  Combined with the Command Pattern, natively supports replay recording and AI
  training;
- **Independent Scheduler**: All animations and audio driven by a dedicated
  Scheduler, unaffected by browser frame rate;
- **Comprehensive Testing**: Unit tests with Jest, end-to-end tests with
  Cypress;

## Architecture

This project uses a layered architecture with clear structure, high modularity,
and strong maintainability. It is not only suitable for Tetris-style game
development but also serves as a general architectural reference for small
front-end 2D canvas games, easily adaptable to other game types.

![System Architecture Diagram](assets/img/architecture-poster.png)

## Architectural Advantages

- **Clear Module Boundaries**: Each layer has distinct responsibilities with low
  coupling. Utilities, game rules, services, and runtime core each perform their
  own roles for easy maintenance and extension.
- **Centralized State Management**: All core game state is stored in
  `GameStore`, updated via pure `stateHandler` functions, avoiding scattered
  data. This design natively supports **replay**, and lays the foundation for
  advanced features like time-travel debugging.
- **Command Pattern Main Loop**: Player actions, AI decisions, and automatic
  piece drops are all encapsulated as standard Command objects, enabling
  operation recording, replay, and governance — the underlying support for the
  replay system and AI gameplay.
- **Event Bus Decoupling**: Modules communicate via publish-subscribe. Events
  such as line clears, level-ups, and game over are broadcast, with rendering,
  audio, and animation modules responding independently without
  inter-dependencies.
- **Unified Scheduling System**: A dedicated `Scheduler` orchestrates all timed
  tasks, ensuring precise timing for piece drops, animations, audio, and AI
  computations, unaffected by frame rate fluctuations, with deterministic game
  logic.
- **Unified Multi-Input Abstraction**: Keyboard, gamepad, and touch inputs are
  all mapped to standard game commands. Upper logic layers are input-device
  agnostic, reducing integration cost for new devices.
- **Deterministic Game Logic**: State changes depend only on commands and time,
  with no random side-effects or implicit dependencies. The same input always
  produces consistent results, suitable for replay, debugging, and AI
  simulation.
- **Pluggable Extension Design**: Audio, animations, AI, and replay are all
  independent, pluggable modules that do not intrude on core logic, making new
  features and version iterations more flexible.
- **AI Isolated from Core Logic**: AI only deduces optimal strategies from game
  state snapshots without directly modifying runtime data, ensuring
  architectural robustness and facilitating algorithm and difficulty iteration.
- **Separation of Runtime and Presentation**: The core runtime layer handles
  rules and state management, while the rendering layer focuses on drawing.
  Currently Canvas-based, it can be extended to WebGL rendering, or have core
  logic ported to server-side, mini-programs, and other multi-platform
  environments.

## Development Guide

- Game configuration: `lib/configuration.js`;
- Modifying block styles/colors:
  - Color palettes: `lib/game/constants/color-palettes.js`;
  - Block styles: `lib/game/constants/shapes.js`;
- Adding background music / sound effects: Append resources and level mappings
  in the audio module:
  - BGM: `lib/services/audio/constants/bgm`;
  - Register BGM: `lib/services/audio/constants/musics.js`;
  - Sound effects: `lib/services/audio/sounds.js`;
- Game animation configuration:
  - Animation management system: `lib/runtime/animation-system.js`;
  - Adding animations: `lib/services/animations`, refer to existing animation
    code and comments;
  - Registering animations:
    - Subscribe to animation messages: listen for animation triggers in
      `lib/game/index.js`;
    - Execute animation:
      `this.Animations.register(new CountdownAnimation({ Scheduler, Game: this }))`;
    - Dependency injection: `{ Scheduler, Game: this }` is the dependency
      configuration — inject as needed;
- EventBus event management:
  - Event registration: `lib/events/event-catalog.js`;
  - Event routing: `lib/events/router` (add routing module when module
    subscriptions exceed 6 events);
- Customizing game rules (speed, scoring, leveling): Modify rule calculation
  functions:
  - Speed: `lib/game/rules/get-speed.js`;
  - Line clear scores: `lib/game/constants/game.js`;
  - Scoring / leveling: `lib/game/actions/apply-clear-lines.js`;
- Adding new input devices:
  - Add new adapters in `lib/services/input` (extend the `Base` class, implement
    dependency injection and pub-sub messaging);
  - Register in `lib/game/index.js` within the game core module (refer to
    existing Keyboard, Gamepad, and Touch);
- Input / command mapping:
  - Input mapping: `lib/engine/dispatch-input.js`;
  - Command mapping: `lib/engine/dispatch-command.js`;
  - Adding command sets: `lib/game/actions/difficulty-actions.js`;
- AI configuration:
  - Difficulty configuration: `lib/ai/core/ai-difficulty.js`;
  - Decision planning: `lib/ai/planner/self-play.js`;

## Browser Compatibility

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" width="24"/>](#) Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" width="24"/>](#) Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" width="24"/>](#) Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" width="24"/>](#) Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" width="24"/>](#) Opera |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 128 – 131                                                                                                              | 130 – 132                                                                                                                       | 109 – 131                                                                                                                    | 17.5 – 18.1                                                                                                                  | 113 – 114                                                                                                                 |

**Note**: This project uses standard ES6+, Canvas, and Gamepad APIs, and is not
compatible with IE browsers.

## Key Bindings

tetris.js supports multiple control methods: keyboard, gamepad, and mobile
GameBoy-style virtual buttons.

### Keyboard

- Enter: Start game
- ↑: Rotate piece
- ← / →: Move left / right
- ↓: Soft drop
- Space: Hard drop
- M: Toggle background music
- P: Pause / resume
- R: Restart
- Q: Quit
- B: Return to level select from difficulty screen
- S: Toggle AI / Human control
- C: Hold piece

#### Level Selection

- 1–9: Select levels 1–9
- T: Select level 10

#### Difficulty Selection

- E: Easy (0 starting rows)
- N: Normal (3 starting rows)
- H: Hard (6 starting rows)
- X: Expert (9 starting rows)

### Gamepad

- START: Start game
- BACK:
  - In-game: Force quit
  - Difficulty screen: Return to level select
- RB: Toggle AI / Human control
- RT: Hold piece
- Left stick / D-pad:
  - ↑: Rotate piece
  - ← / →: Move left / right
  - ↓: Soft drop
- X: Restart
- Y: Pause / resume
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
- BACK: Force quit
- HOLD: Hold piece
- A: Toggle background music
- B: Soft drop
- X: Pause
- Y: Restart

#### Level Selection

- ↑ / ↓: Adjust level (min 1, max 10)
- START: Enter difficulty selection

#### Difficulty Selection

- A: Easy
- B: Normal
- Y: Hard
- X: Expert
- BACK: Return to level select

## Game Rules

### Drop Speed

Drop interval is calculated by `getSpeed()`. Starting at level 1 (1000ms/cell),
the formula:

`step = ceil(1000 / floor(MAX_LEVEL × 0.6))`

ensures smooth linear acceleration within the first 60% of `MAX_LEVEL` (256),
reaching a 100ms/cell limit. The remaining 40% of levels maintain this limit,
focusing on survival.

### Scoring

Final Score = Base Points × Current Level

| Lines Cleared    | Base Points |
| :--------------- | :---------- |
| 1 line           | 100         |
| 2 lines          | 300         |
| 3 lines          | 500         |
| 4 lines (Tetris) | 800         |
| 5 lines          | 1200        |

**Example**: Clearing 4 lines at level 1 = 800 × 1 = 800 pts; at level 50 = 800
× 50 = 40,000 pts.

### Leveling

The game uses `levelUpSteps` for dynamic leveling. The first level-up requires
only 10 lines, with each subsequent level requiring 2 more lines (10 → 12 →
14…), capping at 60 lines per level.

There are 256 levels in total. After the maximum level, the level value loops
back, honoring classic FC game design.

### Block Color Rules

The game includes 8 distinct color palettes that switch every 32 levels, keeping
visuals fresh even at high levels.

| Level Range | Palette | Style           |
| :---------- | :------ | :-------------- |
| 1-32        | Classic | Default bright  |
| 33-64       | Warm    | Vibrant warm    |
| 65-96       | Cool    | Fresh cool      |
| 97-128      | Candy   | Sweet candy     |
| 129-160     | Forest  | Natural forest  |
| 161-192     | Sunset  | Warm sunset     |
| 193-224     | Neon    | Bright neon     |
| 225-256     | Jewel   | Brilliant jewel |

### Background Music Rules

The game features 16 BGM tracks that auto-switch every 16 levels.

| Level Range | Track Name       | Style            |
| :---------- | :--------------- | :--------------- |
| 1-16        | TetrisTheme      | Classic theme    |
| 17-32       | SpringFestival   | Festive cheer    |
| 33-48       | FirstDivision    | Classic folk     |
| 49-64       | GongXiFaCai      | Festive wishes   |
| 65-80       | Loginska         | Electronic       |
| 81-96       | BeyondTheWall    | Mysterious       |
| 97-112      | Technotris       | Tech electronic  |
| 113-128     | GoldenSnakeDance | Oriental charm   |
| 129-144     | Korobeiniki      | Classic folk     |
| 145-160     | Ascension        | Ethereal         |
| 161-176     | NeonNights       | Synthwave        |
| 177-192     | FrozenPeaks      | Icy solitude     |
| 193-208     | CyberRush        | Cyber high-speed |
| 209-224     | Starlight        | Starry dream     |
| 225-240     | FinalPush        | Final challenge  |
| 241-256     | JourneyToWest    | Epic finale      |

**PS**: Have fun playing! Don't forget to STAR if you like it!

## License

- tetris.js project: Licensed under the
  [MIT License](http://opensource.org/licenses/mit-license.html)
- Press Start 2P font (Google Fonts): Licensed under the
  [OFL License](assets/font/OFL.txt)
