# tetris.js

[![npm version](https://img.shields.io/npm/v/@yaohaixiao/tetris.js)](https://www.npmjs.com/package/@yaohaixiao/tetris.js)
[![prettier code style](https://img.shields.io/badge/code_style-prettier-07b759.svg)](https://prettier.io)
[![npm downloads](https://img.shields.io/npm/dt/@yaohaixiao/tetris.js)](https://npmcharts.com/compare/@yaohaixiao/tetris.js?minimal=true)
[![MIT License](https://img.shields.io/github/license/yaohaixiao/tetris.js.svg)](https://github.com/yaohaixiao/tetris.js/blob/main/LICENSE)

[中文](./README.md) | English

![Tetris Game Screenshot](assets/img/screen-shot.png)

tetris.js is a zero-dependency, vanilla JavaScript Tetris game built on Canvas, supporting multi-device input and AI control. The project uses a fixed-frame pipeline architecture with Scheduler, Command Queue, and Replay systems to deliver a clear game update pipeline—a lightweight frontend game engine design and architecture practice example.

## Features

![Tetris Game Features](assets/img/features-poster.png)

The game fully implements classic Tetris core features including piece generation, movement, rotation, dropping, collision detection, line clearing, leveling, and scoring, paired with rich interface rendering, animation effects, and interaction feedback.

### Game Controls

- **Keyboard**: Arrow keys for movement and rotation, Space for hard drop, P to pause, M to toggle music, R to restart, Q to quit, S to toggle AI mode
- **Gamepad**: Full support with left stick and D-pad operation
- **Mobile Touch**: GameBoy-style virtual buttons with complete touchscreen support

<p align="center">
  <img src="assets/img/game-boy-layout.png" alt="Tetris Game Screenshot - GAME BOY Layout">
</p>

### Levels & Difficulty

- **Level Selection**: Supports levels 1-10 (keys 1-9 / T on keyboard, up/down on gamepad and touch)
- **Difficulty Selection**: Easy / Normal / Hard / Expert (keys E/N/H/X on keyboard, A/B/Y/X on gamepad and touch)
- **256 Total Levels**: Homage to classic FC console design, levels cycle after reaching 256

### Game Rules

- **Drop Speed**: Initial drop interval of 1000ms at level 1, smoothly accelerating through the first 60% of levels to a maximum speed of 100ms
- **Scoring**: Clear score = base points × current level (100pts for 1 line, 800pts for 4 lines)
- **Level Up**: Dynamic leveling conditions—10 lines for first level up, incrementally increasing to a maximum of 60 lines per level

### Audio & Visual

- **16 Background Music Tracks**: Automatically switching every 16 levels, covering classic, electronic, folk, synthwave, and more
- **16 Line Clear Sound Effects**: Chord and orchestration parameters evolve with levels for a progressive audio experience
- **8 Color Palettes**: Switching every 32 levels, transitioning from classic bright colors to neon, jewel, and other distinctive themes
- **Animation Effects**: Countdown, line clear flash, floating score, landing highlight, level up celebration, pause timer, and more

### System Capabilities

- **Replay**: Watch full gameplay replays after each game (Video: https://www.bilibili.com/video/BV1oRVA6uEXG/)
- **AI Control**: Multi-step lookahead AI that selects optimal placements via board evaluation, with distinct difficulty levels (Video: https://www.bilibili.com/video/BV1GPG86KEcy/)
- **Local Storage**: Automatically persists high scores
- **Responsive Layout**: Perfectly adapts to desktop, tablet, and mobile screens

### Technical Highlights

- **Vanilla JavaScript**: Built with pure native JavaScript, zero third-party dependencies
- **Modular Design**: ES Module (ESM) based, with highly decoupled modules (audio, rendering, logic) for easy maintenance and replacement
- **Layered Architecture**: Uses layered architecture with component-based design
- **Centralized State Management**: GameStore-based centralized state with pure function updates, completely separating game logic from rendering. Combined with Command Pattern, natively supports replay and AI training
- **Independent Scheduler**: Drives all animations and sound effects with its own scheduler, unaffected by browser frame rate
- **Comprehensive Testing**: Unit tests with Jest, end-to-end tests with Cypress

## Architecture

The project uses a layered architecture with clear structure, high modularity, and strong maintainability. It works not only for Tetris-style games but also as a general architecture reference for small frontend 2D canvas games, easily adaptable to other game types.

![System Architecture Diagram](assets/img/architecture-poster.png)

## Architecture Advantages

- **Clear Modularity**: Distinct responsibilities per layer, low coupling between modules. Utilities, game rules, services, and runtime core each have defined roles, making maintenance and extension straightforward
- **Centralized State Management**: All core game state stored in `GameStore`, updated via pure function `stateHandler`, preventing data scattering. This design natively supports **replay** and leaves room for advanced features like time-travel debugging
- **Command Pattern Main Loop**: Player actions, AI decisions, and auto-drop all encapsulated as standard command objects, enabling recording, replay, and control—the foundation of the replay system and AI gameplay
- **Event Bus Decoupling**: Pub-sub based communication—line clears, level ups, game over events broadcast uniformly, with rendering, audio, and animation modules responding independently
- **Unified Task Scheduler**: Dedicated `Scheduler` coordinates all timed tasks, ensuring precise timing for piece drops, animations, sound effects, and AI computation, unaffected by frame rate fluctuations for stable, reproducible game logic
- **Multi-Input Abstraction**: Keyboard, gamepad, and touch inputs all mapped to standard game commands; upper-layer logic never needs to know the device type, reducing integration cost for new devices
- **Deterministic Game Logic**: State changes determined only by commands and time, with no random side effects or implicit dependencies—identical input always produces identical results, suitable for replay, bug reproduction, and AI simulation
- **Pluggable Extensions**: Audio, animation, AI, and replay are all pluggable independent modules that never intrude on core logic, enabling flexible feature additions and version iteration
- **AI Isolation**: AI only deduces optimal strategies from game state snapshots without directly modifying runtime data, ensuring architectural robustness and easy iteration of different algorithms and difficulty modes
- **Runtime/Rendering Separation**: Core runtime handles rules and state management; rendering layer focuses on drawing. Currently Canvas-based, but can be extended to WebGL or ported to server-side, mini-program, and other multi-platform environments

## AI Control

tetris.js features a built-in AI system with multi-step lookahead capabilities, selecting optimal placements through board evaluation algorithms across distinct difficulty levels.

### AI Decision Architecture

![AI Architecture Diagram](assets/img/ai-poster.png)

### Core Capabilities

- **Multi-Step Lookahead**: AI can predict 2-4 moves ahead (depending on difficulty), using deterministic 7-bag piece sequences for precise placement planning
- **Beam Search Pruning**: Intelligent search tree pruning enables depth=4 decisions in milliseconds
- **Sandbox Simulation**: AI simulates in isolated copies, never contaminating real game state
- **Emergent Well Strategy**: Without explicit well programming, AI naturally learns to leave wells for I-piece Tetrises through its evaluation system

### Evaluation System

AI evaluates each candidate placement on these metrics:

- **Height Control**: Aggregate height background pressure + exponential penalty for tallest column in danger zone
- **Hole Penalty**: Heavy weight penalty for holes—one hole can ruin everything
- **Surface Flatness**: Bumpiness penalty between adjacent columns to maintain a flat board
- **Line Clear Rewards**: Table-driven tiered rewards, with high bonuses guiding Tetris (4-line) clears
- **Scoring Awareness**: T-Spin, Back-to-Back, All Clear, Combo—all advanced scoring rules factored into evaluation

### Difficulty Levels

| Difficulty | Lookahead | Error Rate | Delay | Description |
|------------|-----------|------------|-------|-------------|
| Easy | 2 moves | 25% | 580ms | Occasional mistakes, slower reactions |
| Normal | 3 moves | 15% | 480ms | Occasional errors, medium speed |
| Hard | 4 moves | 5% | 280ms | Rarely errs, fast response |
| Expert | 4 moves | 0% | 150ms | Never errs, extreme reaction speed |

All difficulties share the same core values (evaluation weights), differing only in lookahead depth, random error rate, and response speed.

## Development Guide

- Game Configuration: `lib/configuration.js`
- Customizing Block Styles/Colors:
  - Color Palettes: `lib/game/contants/color-paletters.js`
  - Block Shapes: `lib/game/contants/shapes.js`
- Adding Background Music/Sound Effects: Append resources and level mappings in the audio module:
  - Background Music:
    - Add tracks: `lib/services/audio/constants/bgm`
    - Register tracks: `lib/services/audio/constants/musics.js`
  - Sound Effects: `lib/services/audio/sounds.js`
- Game Animation Configuration:
  - Animation Manager: `lib/runtime/animation-system.js`
  - Adding Animations: `lib/services/animations` (reference existing animation code comments)
  - Registering Animations:
    - Subscribe to animation messages in `lib/game/index.js`
    - Execute: `this.Animations.register(new CountdownAnimation({ Scheduler, Game: this }))`
    - Dependency Injection: `{ Scheduler, Game: this }` — inject dependencies as needed
- EventBus Management:
  - Event Registration: `lib/events/event-catalog.js`
  - Event Routing: `lib/events/router` (add router module when a module subscribes to more than 6 events)
- Custom Game Rules (speed, scoring, leveling):
  - Speed Config: `lib/game/rules/get-speed.js`
  - Line Clear Scores: `lib/game/constants/game.js`
  - Scoring/Leveling: `lib/game/actions/apply-clear-lines.js`
- Extending Input Devices:
  - Add: New adapters in `lib/services/input` (extend Base class, implement dependency injection and pub-sub)
  - Register: In `lib/game/index.js` (reference existing Keyboard, Gamepad, and Touch)
- Input/Command Mapping:
  - Input Mapping: `lib/engine/dispatch-input.js`
  - Command Mapping: `lib/engine/dispatch-command.js`
  - Adding Command Sets: `lib/game/actions/difficulty-actions.js`
- AI Configuration:
  - Difficulty Config: `lib/ai/core/ai-difficulty.js`
  - Decision Planning: `lib/ai/planner/self-play.js`

## Browser Compatibility

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" width="24"/>](#) Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" width="24"/>](#) Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" width="24"/>](#) Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" width="24"/>](#) Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" width="24"/>](#) Opera |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 128 – 131                                                                                                              | 130 – 132                                                                                                                       | 109 – 131                                                                                                                    | 17.5 – 18.1                                                                                                                  | 113 – 114                                                                                                                 |

**Note**: The project uses standard ES6+, Canvas, and Gamepad API. IE series browsers are not supported.

## Controls

tetris.js supports multiple control methods: keyboard, gamepad, and mobile touch with a GAME BOY style layout.

### Keyboard

- Enter: Start game
- ↑: Rotate piece
- ← / →: Move piece left/right
- ↓: Soft drop
- Space: Hard drop
- M: Toggle background music
- P: Pause/Resume
- R: Restart
- Q: Force quit
- B: Return to level selection from difficulty selection
- S: Toggle AI/Human control
- C: Hold piece

#### Level Selection

- 1–9: Select levels 1-9
- T: Select level 10

#### Difficulty Selection

- E: Easy (0 preset rows)
- N: Normal (3 preset rows)
- H: Hard (6 preset rows)
- X: Expert (9 preset rows)

### Gamepad

- START: Start game
- BACK:
  - Force quit during gameplay
  - Return to level selection from difficulty selection
- RB: Toggle AI/Human control
- RT: Hold piece
- Left Stick / D-Pad:
  - ↑: Rotate piece
  - ← / →: Move piece left/right
  - ↓: Soft drop
- X: Restart
- Y: Pause/Resume
- A: Toggle background music
- B: Hard drop

#### Level Selection

- D-Pad ↑: Increase level
- D-Pad ↓: Decrease level

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
- BACK: Return to level selection

## Game Rules

### Drop Speed

Piece drop intervals are calculated by the `getSpeed()` function. The game starts at level 1 (1000ms/cell), using the formula:

`step = ceil(1000 / floor(MAX_LEVEL × 0.6))`

Drop speed increases smoothly and linearly through the first 60% of the `MAX_LEVEL` (256) range. The remaining 40% of levels maintain the maximum speed of 100ms/cell, challenging players to focus on survival.

### Scoring

Final score = single clear base points × current level

| Lines Cleared | Base Points |
| :------------ | :---------- |
| 1 line        | 100         |
| 2 lines       | 300         |
| 3 lines       | 500         |
| 4 lines (Tetris) | 800      |
| 5 lines       | 1200        |

**Example**: Clearing 4 lines at level 1 scores 800 × 1 = 800 points; at level 50, 800 × 50 = 40,000 points.

### Level Up

The game uses `levelUpSteps` for dynamic leveling conditions. The first level up requires only 10 lines, after which each level requires 2 additional lines (10 → 12 → 14…), with a maximum of 60 lines per level.

The game features a total of 256 levels. After reaching the maximum, the level counter cycles back, paying homage to classic FC game design.

### Block Color Palettes

The game includes 8 distinct color palettes, automatically switching every 32 levels to maintain visual variety at higher levels.

| Level Range | Palette | Style |
| :---------- | :------ | :---- |
| 1-32        | Classic | Default vibrant colors |
| 33-64       | Warm    | Energetic warm tones |
| 65-96       | Cool    | Refreshing cool tones |
| 97-128      | Candy   | Sweet candy colors |
| 129-160     | Forest  | Natural forest tones |
| 161-192     | Sunset  | Warm sunset tones |
| 193-224     | Neon    | Bright neon colors |
| 225-256     | Jewel   | Brilliant jewel tones |

### Background Music

The game includes 16 background music tracks across different styles, automatically switching every 16 levels.

| Level Range | Track Name       | Style              |
| :---------- | :--------------- | :----------------- |
| 1-16        | TetrisTheme      | Classic main theme |
| 17-32       | SpringFestival   | Festive celebration |
| 33-48       | FirstDivision    | Classic folk style |
| 49-64       | GongXiFaCai      | Festive blessing   |
| 65-80       | Loginska         | Electronic groove  |
| 81-96       | BeyondTheWall    | Ethereal mystery   |
| 97-112      | Technotris       | Tech electronic    |
| 113-128     | GoldenSnakeDance | Eastern charm      |
| 129-144     | Korobeiniki      | Classic folk       |
| 145-160     | Ascension        | Ethereal ascent    |
| 161-176     | NeonNights       | Neon synthwave     |
| 177-192     | FrozenPeaks      | Crisp solitude     |
| 193-208     | CyberRush        | Cyber high-speed   |
| 209-224     | Starlight        | Starry dreamscape  |
| 225-240     | FinalPush        | Ultimate challenge |
| 241-256     | JourneyToWest    | Epic finale        |

**PS**: Have fun! Star support appreciated!

## License

- tetris.js project: Licensed under the [MIT License](http://opensource.org/licenses/mit-license.html)
- Press Start 2P font (Google Open Source Font): Licensed under the [OFL License](assets/font/OFL.txt)
