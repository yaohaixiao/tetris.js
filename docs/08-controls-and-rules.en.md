# Controls and Rules

English | [简体中文](./08-controls-and-rules.md)

> Have fun, and don't forget to STAR if you like it!

## Game Controls

tetris.js supports multiple control methods: keyboard, Gamepad, and touch controls with a simulated GAME BOY layout for mobile devices.

### Keyboard Controls

- Enter: Start game
- ↑: Rotate piece
- ← / →: Move piece left/right
- ↓: Speed up fall
- Space: Hard drop
- M: Toggle background music on/off
- P: Pause/resume game
- R: Restart game
- Q: Force end game
- B: Return to level selection from difficulty selection
- S: Switch AI / human control
- C: Hold piece

#### Level Selection

- 1–9: Select levels 1 to 9
- T: Select level 10

#### Difficulty Selection

- E: Easy (0 rows of garbage at start)
- N: Normal (3 rows of garbage at start)
- H: Hard (6 rows of garbage at start)
- X: Expert (9 rows of garbage at start)

### Gamepad Controls

- START: Start game
- BACK:
  - Force end game during gameplay
  - Return to level selection from difficulty selection
- RB: Switch AI / human control
- RT: Hold piece
- Left Stick / D-pad:
  - ↑: Rotate piece
  - ← / →: Move piece left/right
  - ↓: Speed up fall
- X: Restart game
- Y: Pause/resume game
- A: Toggle background music on/off
- B: Hard drop

#### Level Selection

- D-pad ↑: Increase level
- D-pad ↓: Decrease level

#### Difficulty Selection

- A: Easy
- B: Normal
- Y: Hard
- X: Expert

### Mobile Touch Controls (GameBoy Layout)

- ↑: Rotate piece
- ↓: Speed up fall
- ←: Move left
- →: Move right
- BACK: Force end game
- HOLD: Hold piece
- A: Toggle background music on/off
- B: Speed up fall
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

### Drop Speed

The drop interval of pieces is calculated by the `getSpeed()` function. The game starts from level 1 (1000ms/cell) using the formula:

`step = ceil(1000 / floor(MAX_LEVEL × 0.6))`

Within the first 60% of the maximum level `MAX_LEVEL` (256 levels), the drop speed increases smoothly and linearly until reaching the limit. The remaining 40% of levels maintain the limit speed of 100ms/cell, allowing players to focus on survival challenges.

### Scoring Rules

Final Score = Base Score for Single Clear × Current Level

| Lines Cleared        | Base Score |
| :------------------- | :--------- |
| 1 line               | 100        |
| 2 lines              | 300        |
| 3 lines              | 500        |
| 4 lines (Tetris)     | 800        |
| 5 lines              | 1200       |

**Example**: Clearing 4 lines at level 1 gives 800 × 1 = 800 points; clearing 4 lines at level 50 gives 800 × 50 = 40000 points.

### Leveling Rules

The game implements dynamic leveling conditions through `levelUpSteps`. The first level up requires only 10 lines cleared, then each subsequent level increases the required lines by 2 (10 → 12 → 14...), with a maximum of 60 lines required per level.

The game has a total of 256 levels. Upon reaching the maximum level, the level value resets, paying homage to classic FC game design.

### Piece Color Rules

The game includes 8 built-in color schemes, automatically switching every 32 levels to maintain visual variety during high-level gameplay.

| Level Range | Color Scheme | Style Description     |
| :---------- | :----------- | :-------------------- |
| 1-32        | Classic      | Default vibrant colors |
| 33-64       | Warm         | Energetic warm tones   |
| 65-96       | Cool         | Refreshing cool tones  |
| 97-128      | Candy        | Sweet candy colors    |
| 129-160     | Forest       | Natural forest tones  |
| 161-192     | Sunset       | Warm sunset tones     |
| 193-224     | Neon         | Bright neon colors    |
| 225-256     | Gem          | Brilliant gem tones   |

### Background Music Rules

The game includes 16 different background music tracks that automatically switch as levels increase, changing every 16 levels.

| Level Range | Track Name         | Style                 |
| :---------- | :----------------- | :-------------------- |
| 1-16        | TetrisTheme        | Classic main theme    |
| 17-32       | SpringFestival     | Festive celebration   |
| 33-48       | FirstDivision      | Classic folk style    |
| 49-64       | GongXiFaCai        | Festival blessing     |
| 65-80       | Loginska           | Electronic rhythm     |
| 81-96       | BeyondTheWall      | Mysterious and vast   |
| 97-112      | Technotris         | Tech electronic       |
| 113-128     | GoldenSnakeDance   | Eastern charm         |
| 129-144     | Korobeiniki        | Classic folk          |
| 145-160     | Ascension          | Ethereal ascension    |
| 161-176     | NeonNights         | Neon synthwave        |
| 177-192     | FrozenPeaks        | Cold and solitary     |
| 193-208     | CyberRush          | Cyber high-speed      |
| 209-224     | Starlight          | Starry dreamscape     |
| 225-240     | FinalPush          | Ultimate challenge    |
| 241-256     | JourneyToWest      | Epic finale           |

## Battle Mode

Battle mode supports **HUMAN VS AI** (Player vs AI) and **HUMAN VS HUMAN** (Two-player).

### Match Rules

- **Round**: A single game ends (when a player's board fills up), winner gets +1 point
- **Match**: The player who reaches the target score first (default 20 points, configurable in `Configuration.victoryScore`) wins
- After the match ends, the battle result overlay is displayed. Press Enter to restart

### Attack System

When players clear lines, they send **garbage lines** to their opponent. Garbage lines are pushed in from the bottom of the opponent's board, increasing their difficulty.

#### Attack Power Calculation

| Lines Cleared | Attack Power (Garbage Lines) | Description          |
| :------------ | :--------------------------- | :------------------- |
| 1 line        | 0                            | Single has no attack |
| 2 lines       | 1                            | Double               |
| 3 lines       | 2                            | Triple               |
| 4 lines       | 3                            | Tetris (max reward)  |
| 5+ lines      | 4                            | Super clear          |

#### Garbage Counter Mechanism

- Attack power generated by clearing lines **prioritizes canceling** the garbage lines the player is about to receive (defense)
- After cancellation, any remaining attack power is sent to the opponent (offense)
- Encourages players to actively clear lines when under attack to protect themselves

#### Garbage Holes

Garbage lines randomly generate holes (empty spaces). Higher difficulties have more holes:

| Difficulty | Holes Per Row | Description        |
| :--------- | :------------ | :----------------- |
| Easy       | 1             | Easy to fill       |
| Normal     | 2             | Requires planning  |
| Hard       | 3             | Difficult to handle |
| Expert     | 4             | Extremely hard     |

### Two-Player Input Device Allocation

In HUMAN VS HUMAN mode, input devices are dynamically allocated based on the number of connected controllers:

| Number of Controllers | P1 (index=0)              | P2 (index=1)                |
| :-------------------- | :------------------------ | :-------------------------- |
| 1 controller          | Keyboard                  | Controller-0 + Keyboard disabled |
| 2+ controllers        | Keyboard + Controller-0   | Controller-1 + Keyboard disabled |

- P1 is responsible for selecting level and difficulty in the menu
- P2's keyboard is automatically disabled during gameplay; only the controller works

### Battle Interface

- **Real-time scoreboard**: Both players' wins are displayed in real time
- **Battle result overlay**: After the match ends, the winner's name is displayed; press Enter for a rematch
