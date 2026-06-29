# Architecture

English | [简体中文](./02-architecture.md)

> Architecture is not designed, but evolved through the continuous process of solving problems.

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

![System Architecture Diagram](assets/img/architecture-poster.png)

Yet they fail to answer a more important question:

> **Why did it become this way?**

In fact, the vast majority of software architectures are not designed all at once. They gradually evolve through the continuous process of solving real problems. tetris.js is no exception.

## It All Started with a Simple Tetris Game

The initial version of the project had no Runtime, no Scheduler, no Replay, and no AI.

It was just an ordinary browser mini-game. The entire program probably consisted of just a few core parts:

![Tetris Code - v0.3.1](assets/img/code-v0.3.1.png)

Original code: [v0.3.1](https://www.npmjs.com/package/@yaohaixiao/tetris.js/v/0.3.1?activeTab=code)

The game loop was also very simple.

```js
/**
 * # Game Main Loop
 *
 * Controls core game logic: dropping, collision detection, locking pieces, clearing lines, spawning new pieces.
 * Interrupts execution when game is over or paused. Executes every frame to ensure smooth gameplay.
 *
 * @function loop
 * @returns {boolean} Returns whether to continue the main loop
 */
export function loop() {
  // During level-up animation: only update animation, no game logic
  if (gameState.levelUpEffect.show) {
    updateLevelUpEffect();
    drawBoard(gameState.board);
    drawCurr(gameState.curr, gameState.cx, gameState.cy);
    drawLevelUpEffect();
    return true;
  }

  // Game over / paused → stop main loop
  if (gameState.isGameOver || gameState.isPaused) {
    return false;
  }

  // Try to move down one cell; if unable, execute lock logic
  if (!move(0, 1)) {
    // Lock current piece to board
    lock();
    // Play landing sound effect
    sounds.fall();
    // Execute line clear logic (including 3-blink effect)
    clearLines();
    // Spawn new falling piece
    spawn();

    // Game over after spawning new piece → terminate loop
    if (gameState.isGameOver) {
      return false;
    }
  }

  // Draw game board + current falling piece
  drawBoard(gameState.board);
  drawCurr(gameState.curr, gameState.cx, gameState.cy);

  // Continue loop normally
  return true;
}

/**
 * # Game Main Loop with Speed Control
 *
 * Only executes drop logic when the specified time interval is reached.
 *
 * @function updateMainLoop
 * @param {number} timestamp - Timestamp value
 * @returns {void}
 */
export const updateMainLoop = (timestamp) => {
  // Get drop interval for current level (milliseconds)
  const dropInterval = getSpeed();

  // Drop only when time interval is reached
  if (
    !gameState.gameTimestamp ||
    timestamp - gameState.gameTimestamp > dropInterval
  ) {
    // Execute actual game logic (drop/collision/render)
    loop();
    gameState.gameTimestamp = timestamp;
  }

  // Continue to next frame
  gameState.gameRafId = requestAnimationFrame(updateMainLoop);
};
```

For the simplest Tetris game, this implementation is perfectly fine. It could even be said that this is the approach most tutorials adopt. The architecture at that time looked like this:

![Architecture v0.3.1](assets/img/architecture-v0.3.1.png)

However, as features continued to increase, new problems began to emerge.

## First Problem: Code Started to Become Increasingly Scattered

When keyboard control was added, the code needed to listen for: `keydown`. Adding new features required `keyup`. Adding touch control introduced many DOM button event bindings and handler functions.

Later, when Gamepad support was added, another new set of inputs appeared. Gradually, different input devices started directly modifying the game state.

### Move Piece

The general flow was as follows:

```
Keyboard
↓
move()
↓
Board
```

Implementation of the move() method:

```js
/**
 * # Move current piece
 *
 * Attempts to move the current piece by the specified offset (left/right/down).
 * Checks collision first, executes move and plays sound effect if no collision.
 *
 * @function move
 * @param {number} ox - X-axis offset (-1=left, 1=right, 0=no move)
 * @param {number} oy - Y-axis offset (1=down, 0=no move)
 * @returns {boolean} Returns true if move successful, false if collision prevents move
 */
export function move(ox, oy) {
  // No collision → can move
  if (!collision(ox, oy)) {
    gameState.cx += ox;
    gameState.cy += oy;
    // Play move sound effect
    sounds.move();
    return true;
  }

  // Collision occurred, cannot move
  return false;
}
```

### Rotate Piece

Flow:

```
Touch
↓
rotate()
↓
Board
```

Implementation of the rotate() method:

```js
/**
 * # Rotate current piece
 *
 * Performs clockwise rotation on the current piece (matrix transpose + reverse).
 * If collision occurs after rotation, automatically reverts to ensure proper gameplay.
 *
 * @function rotate
 * @returns {void}
 */
export const rotate = () => {
  // Save shape before rotation for collision recovery
  const prev = gameState.curr.shape;

  // Clockwise rotation: transpose + reverse rows
  gameState.curr.shape = prev[0].map((_, i) =>
    prev.map((r) => r[i]).toReversed(),
  );

  // If collision after rotation → restore original
  if (collision(0, 0)) {
    gameState.curr.shape = prev;
  } else {
    // Rotation successful → play sound effect
    sounds.rotate();
  }
};
```

### Hard Drop

Flow:

```
Gamepad
↓
drop()
↓
Board
```

Implementation of the drop() method:

```js
/**
 * # Hard Drop
 *
 * Piece instantly drops to the bottom, automatically locks, clears lines, and spawns new piece.
 * Compared to normal dropping, it directly reaches the bottom; a commonly used player operation.
 *
 * @function drop
 * @returns {void}
 */
export function drop() {
  // Loop downward movement until unable to move (bottom/collision)
  while (true) {
    if (!move(0, 1)) {
      break;
    }
  }

  // Lock piece to board
  lock();
  // Play landing sound effect
  sounds.fall();
  // Clear lines (including 3-blink effect)
  clearLines();
  // Spawn new piece
  spawn();
  // Play hard drop complete sound effect
  sounds.drop();
}
```

They could all directly modify the `gameState`. The code still worked, but severe coupling dependency issues had already begun to appear.

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

## First Architectural Evolution: Decoupling Input from Game Logic

As more input control logic was added, the project underwent its first major adjustment, introducing input mapping: `dispatchInput`.

![Tetris Code - v0.3.1](assets/img/code-v0.3.1.png)

### Previous Approach

In v0.3.1, all game state inputs were written directly in event handler functions, which is the most common approach:

```js
/**
 * # Main keyboard event handler (unified distribution of all key operations)
 *
 * Distributes to corresponding logic based on current game state: level selection, game over, global shortcuts, game controls.
 *
 * @function onControlButtonsPress
 * @param {KeyboardEvent} e - Keyboard event object
 * @returns {boolean} Whether to prevent subsequent operations
 */
const onControlButtonsPress = (e) => {
  // Get pressed key name and lowercase key name
  const { key } = e;
  const lowerKey = key.toLowerCase();

  // Countdown and level-up effect screens block operations
  if (gameState.countdown.show || gameState.levelUpEffect.show) {
    return false;
  }

  // 1. Level selection interface operations
  if (gameState.isSelectLevel) {
    executeLevelSelectionCommand(key, lowerKey);
    return false;
  }

  // 2. Game over state: Press Enter to return to main menu
  if (gameState.isGameOver) {
    if (key === 'Enter') {
      executeDrawLevelSelectCommand();
    }
    return false;
  }

  // 3. Global shortcuts (M/R/Q/P) are processed first
  if (executeShortcutsCommand(lowerKey)) {
    return false;
  }

  // 4. Paused state: do not respond to game operations
  if (gameState.isPaused) {
    return false;
  }

  // 5. Normal gameplay: handle direction keys/space controls
  executeDirectionControlCommand(key);

  // Redraw game interface
  drawBoard(gameState.board);
  drawCurr(gameState.curr, gameState.cx, gameState.cy);
};

/**
 * # Bind game global events
 *
 * Window resize, keyboard press, keyboard release events
 *
 * @function bindEvents
 * @returns {void}
 */
const bindEvents = () => {
  // Adapt canvas to window size changes
  globalThis.addEventListener('resize', onResize);

  // Listen for keyboard press events, handling all game operations
  document.addEventListener('keydown', onControlButtonsPress);

  // Listen for keyboard release events, used to cancel P key long-press timer
  document.addEventListener('keyup', onPauseStop);
};
```

As you can see, as game features grew more complex and game states increased, this event handler became bloated and difficult to test and maintain.

### Input Mapping (dispatchInput)

To solve the problems caused by increasing keys and states, **input mapping (dispatchInput)** was adopted. Let's see the changes brought by `dispatchInput`:

```js
import resolveInputAction from '@/lib/input/resolve-input-action.js';
import dispatchInput from '@/lib/input/dispatch-input.js';

/**
 * # Main keyboard event handler (unified distribution of all key operations)
 *
 * Distributes to corresponding logic based on current game state: level selection, game over, global shortcuts, game controls.
 *
 * @function onKeydown
 * @param {KeyboardEvent} e - Keyboard event object
 * @returns {void}
 */
const onKeydown = (e) => {
  const key = e.key.toLowerCase();
  const action = resolveInputAction(key);

  if (!action) {
    return;
  }

  dispatchInput({
    type: 'keydown',
    key,
    action,
  });
};

export default onKeydown;
```

First, `resolveInputAction` is used to resolve the key's action:

```js
const ACTION_MAP = {
  arrowleft: 'MOVE_LEFT',
  arrowright: 'MOVE_RIGHT',
  arrowdown: 'MOVE_DOWN',
  arrowup: 'ROTATE',
  ' ': 'DROP',

  m: 'TOGGLE_MUSIC',
  p: 'TOGGLE_PAUSE',
  r: 'RESTART',
  q: 'QUIT',

  1: 'LEVEL_ONE',
  2: 'LEVEL_TWO',
  3: 'LEVEL_THREE',
  4: 'LEVEL_FOUR',
  5: 'LEVEL_FIVE',
  6: 'LEVEL_SIX',
  7: 'LEVEL_SEVEN',
  8: 'LEVEL_EIGHT',
  9: 'LEVEL_NINE',
  t: 'LEVEL_TEN',

  enter: 'CONFIRM',
};

const resolveInputAction = (key) => {
  const action = ACTION_MAP[key];

  if (!action) {
    return null;
  }

  return action || null;
};

export default resolveInputAction;
```

Then comes the key part: using `dispatchInput` to map inputs and execute key operations:

```js
import InputRoutes from '@/lib/input/input-actions-map.js';
import { hasBlockingAnimation } from '@/lib/animations/system.js';
import consumeGlobalShortcut from '@/lib/input/actions/consume-global-shortcut.js';
import getGameStateMode from '@/lib/game/state/get-game-state-mode.js';

const dispatchInput = (event) => {
  const { action } = event;
  const mode = getGameStateMode();

  // Countdown, level-up, or no matching key action
  if (
    hasBlockingAnimation(['countdown', 'level-up']) ||
    !action ||
    consumeGlobalShortcut(action)
  ) {
    return;
  }

  const handler = InputRoutes[mode];

  handler?.(action);
};

export default dispatchInput;
```

The key here is using `InputRoutes` to execute state-specific actions based on game state `mode`:

```js
import mainMenuActions from '@/lib/input/actions/main-menu-actions.js';
import gamePlayingActions from '@/lib/input/actions/game-playing-actions.js';
import gameOverActions from '@/lib/input/actions/game-over-actions.js';

const InputActionsMap = {
  'main-menu': mainMenuActions,
  playing: gamePlayingActions,
  paused: () => {},
  'game-over': gameOverActions,
};

export default InputActionsMap;
```

This allows us to easily manage a series of actions for each game state:

![Tetris Code - v0.4.0 - actions](assets/img/code-v0.4.0-actions.png)

Let's look at the action set for the `main-menu` state: `mainMenuActions`

```js
import startGame from '@/lib/game/core/start-game.js';
import changeLevel from '@/lib/game/actions/change-level.js';

const ACTION_MAP = {
  LEVEL_ONE: () => {
    changeLevel(1);
  },
  LEVEL_TWO: () => {
    changeLevel(2);
  },
  LEVEL_THREE: () => {
    changeLevel(3);
  },
  LEVEL_FOUR: () => {
    changeLevel(4);
  },
  LEVEL_FIVE: () => {
    changeLevel(5);
  },
  LEVEL_SIX: () => {
    changeLevel(6);
  },
  LEVEL_SEVEN: () => {
    changeLevel(7);
  },
  LEVEL_EIGHT: () => {
    changeLevel(8);
  },
  LEVEL_NINE: () => {
    changeLevel(9);
  },
  LEVEL_TEN: () => {
    changeLevel(10);
  },
  CONFIRM: startGame,
};

const mainMenuActions = (action) => {
  const handler = ACTION_MAP[action];

  handler?.();
};

export default mainMenuActions;
```

From this point on, Replay, AI, Gamepad, and Touch all have completely consistent input execution flows. This was the most important step for the entire Runtime.

## Second Architectural Evolution: Command Runtime + Centralized State Management (Store)

As more modules continued to be added, new problems emerged. The Renderer needed to read state, AI needed to read state, Replay needed to read state, and animation also needed to read state.

```text
Keyboard ─────┐
Touch ────────┤
Gamepad ──────┤
Replay ───────┤
AI ───────────┤
Battle ───────┤
               ▼
        move()/rotate()/drop()
               ▼
            Game State
```

If all modules could modify data, then the state would inevitably become increasingly chaotic.

### Store (Centralized State Management)

So, game state began to be centrally managed. All state updates were unified through the Runtime. Other modules were only responsible for reading state or responding to state changes.

From this moment on, the game truly had a stable data flow.

![Tetris Code - v0.6.0](assets/img/code-v0.6.0.png)

Previously, we directly manipulated the finite state. Let's look at the previous `rotate` method:

```js
/**
 * # Rotate current piece
 *
 * Performs clockwise rotation on the current piece (matrix transpose + reverse).
 * If collision occurs after rotation, automatically reverts to ensure proper gameplay.
 *
 * @function rotate
 * @returns {void}
 */
export const rotate = () => {
  // Save shape before rotation for collision recovery
  const prev = gameState.curr.shape;

  // Clockwise rotation: transpose + reverse rows
  gameState.curr.shape = prev[0].map((_, i) =>
    prev.map((r) => r[i]).toReversed(),
  );

  // If collision after rotation → restore original
  if (collision(0, 0)) {
    gameState.curr.shape = prev;
  } else {
    // Rotation successful → play sound effect
    sounds.rotate();
  }
};
```

After restructuring, everything is handled through `GameStore`:

```js
import BOARD from '@/lib/services/ui/constants/board.js';
import GameState from '@/lib/game/state/game-state.js';
import isFunction from '@/lib/utils/is-function.js';

/**
 * # Create Game Store Factory
 *
 * A lightweight closure-based state manager for managing game runtime state.
 *
 * Features:
 *
 * - Uses closure to encapsulate state (avoiding global pollution)
 * - Provides basic get / set API
 * - Supports patch update mode
 * - Supports partial domain methods (board / hud / level, etc.)
 *
 * Design Positioning:
 *
 * - Not Redux / Not Zustand
 * - Lightweight game state container
 * - Designed specifically for Tetris Engine
 *
 * @param {object} [initialState=GameState] - Optional initial state (for reset or testing). Default is
 *   `GameState`
 * @returns {object} Store API
 */
const createGameStore = (initialState) => {
  /**
   * # Internal state object
   *
   * Uses structuredClone to ensure initial state isolation
   */
  let state = {
    ...structuredClone(initialState || GameState),
    nextSequence: [],
  };

  return {
    /**
     * ## Get full state
     *
     * @returns {object} Current game state
     */
    getState: () => state,

    /**
     * ## Update state (supports patch or function)
     *
     * Supports two modes:
     *
     * 1. Object patch
     * 2. Function (prevState) => patch
     *
     * @param {object | Function} patch - State update content or function
     */
    setState: (patch) => {
      state = {
        ...state,
        ...(isFunction(patch) ? patch(state) : patch),
      };
    },

    /**
     * ## Reset board
     *
     * Regenerates empty board based on BOARD constants
     */
    resetBoard: () => {
      const { COLS, ROWS } = BOARD;

      // Create ROWS x COLS 2D array (initial value 0, representing empty cells)
      state.board = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }).fill(0),
      );
    },

    /**
     * ## Get base lines cleared
     *
     * @returns {number} - Returns base lines count
     */
    getBaseLines: () => state.baseLines,

    /**
     * ## Set base lines
     *
     * @param {number} lines - Base lines count
     */
    setBaseLines: (lines) => {
      state.baseLines = lines;
    },

    /**
     * ## Get current cleared lines
     *
     * @returns {object[]} - Returns cleared lines data
     */
    getClearLines: () => state.clearLines,

    /**
     * ## Set current cleared lines
     *
     * @param {number[]} lines - Cleared lines array
     */
    setClearLines: (lines) => {
      state.clearLines = lines;
    },

    /**
     * ## Get HUD data
     *
     * Returns core data needed for UI rendering
     *
     * @returns {object} HUD data
     */
    getHub: () => {
      const { source, lines, level } = state;

      return {
        source,
        lines,
        level,
      };
    },

    /**
     * ## Set HUD data
     *
     * @param {object} hud - HUD data object
     */
    setHud: (hud) => {
      const { score, lines, level } = hud;

      state.score = score;
      state.lines = lines;
      state.level = level;
    },

    /**
     * ## Set high score
     *
     * @param {number} highScore - Historical high score
     */
    setHighScore: (highScore) => {
      state.highScore = highScore;
    },

    /**
     * ## Get high score
     *
     * @returns {number} - Returns high score
     */
    getHighScore: () => state.highScore,

    /**
     * ## Get current level
     *
     * @returns {number} - Returns current level
     */
    getLevel: () => state.level,

    /**
     * ## Set current level
     *
     * @param {number} level - Current level
     */
    setLevel: (level) => {
      state.level = level;
    },

    /**
     * ## Get game mode
     *
     * @returns {string} Current mode (main-menu / playing / paused / game-over)
     */
    getMode: () => state.mode,

    /**
     * ## Set game mode
     *
     * @param {string} mode - Game mode
     */
    setMode: (mode) => {
      state.mode = mode;
    },
  };
};

export default createGameStore;
```

At this point, we just need to create the `store` in the `Game` module:

```js
const Game = {
  // Game state
  store: createGameStore(),
  // omitted...
}
```

Then whenever game state information needs to be manipulated, it's all managed uniformly through the `store`. Here's the change to the `rotate` method:

```js
import Audio from '@/lib/services/audio';
import Game from '@/lib/game';
import collision from '@/lib/game/logic/collision.js';

/**
 * # Rotate current piece
 *
 * Performs clockwise rotation on the current piece (matrix transpose + reverse).
 * If collision occurs after rotation, automatically reverts to ensure proper gameplay.
 *
 * @function rotate
 * @returns {void}
 */
const rotate = () => {
  const { store } = Game;
  const state = store.getState();
  const { curr } = state;

  if (!curr) {
    return;
  }

  const currentShape = structuredClone(curr);
  // Save shape before rotation for collision recovery
  const prev = curr.shape;

  // Clockwise rotation: transpose + reverse rows
  currentShape.shape = prev[0].map((_, i) =>
    prev.map((r) => r[i]).toReversed(),
  );

  store.setState({
    curr: currentShape,
  });

  // If collision after rotation → restore original
  if (collision(0, 0)) {
    currentShape.shape = prev;
    store.setState({
      curr: currentShape,
    });
  } else {
    // Rotation successful → play sound effect
    Audio.Sounds.rotate();
  }
};

export default rotate;
```

### Command Runtime

Although `Store` unified game state management, there was still a major problem: all modules depended on game logic, and all modules needed to know when to play sound effects, when to update animations, and when to refresh the interface.

As features continued to increase, coupling between modules grew more severe and maintenance costs rose. To solve this problem, the project underwent another architectural upgrade. This time, instead of continuing to add new utility functions, the entire Runtime data flow was redesigned.

All inputs no longer directly called game logic. They were first converted into **Commands**. For example:

```text
MOVE_LEFT
MOVE_RIGHT
ROTATE
DROP
RESTART
QUIT
```

Subsequently, these Commands were not executed immediately but entered the **Command Queue** uniformly. The entire execution flow became:

```text
Keyboard
Touch
Gamepad
Replay
AI
Battle
        │
        ▼
 DispatchInput
        │
        ▼
     Command
        │
        ▼
  Command Queue
        │
        ▼
   Game Runtime
        │
        ▼
 Execute Command
```

From this moment on, no module directly modified the game. The only thing they could do was submit Commands. The only one that actually executed Commands was Runtime.

### Why Command?

The biggest purpose of Command is not wrapping `move()` into an object. What truly matters is: **completely separating "what the player wants to do" from "how the game executes it."**

For example, previously Keyboard would directly call:

```js
move(-1, 0);
```

Now Keyboard only needs to submit:

```text
MOVE_LEFT
```

Let's see the change:

```js
import Engine from '@/lib/engine';
import Command from '@/lib/core/command/command.js';
import CommandQueue from '@/lib/core/command/command-queue.js';
import Replay from '@/lib/runtime/replay-runtime.js';
import EventBus from '@/lib/core/event-bus';

/**
 * # Input Dispatcher
 *
 * Responsibilities:
 *
 * - Receive input action
 * - Convert to Command
 * - Enqueue for execution
 * - Record replay (if enabled)
 *
 * @function dispatchInput
 * @param {object} input - Input information
 * @param {string} input.action - Input action type
 * @returns {void}
 */
const dispatchInput = (input) => {
  const { action, payload } = input;

  /**
   * ======== Input Interception Layer ======== Block input during key animations:
   *
   * - Countdown
   * - Level-up
   */
  const hasBlocking = Engine.Animations.hasBlocking(['countdown', 'level-up']);

  if (hasBlocking || !action) {
    return;
  }

  /** ======== Command Building ======== */
  const cmd = new Command(action, payload);

  /** ======== Enqueue for Execution ======== */
  CommandQueue.enqueue(cmd);

  /**
   * ======== Replay Recording Layer ========
   *
   * This is a side-effect, but temporarily kept in dispatcher
   */
  if (Replay.recording) {
    EventBus.emit('replay:record', {
      // Subtract pause time to get pure "play duration" - Replay.totalPausedDuration
      ms: Engine.timestamp - Replay.startTime,
      cmd,
    });
  }
};

export default dispatchInput;
```

As for:

* Is movement allowed?
* Is it currently paused?
* Is it currently Game Over?
* Is there any animation blocking?
* Does sound effect need to be played?
* Does Replay need to be recorded?

These are all decided uniformly by Runtime. The input module has no idea how the game works internally.

### Why Command Queue?

Many people wonder when first encountering Commands: since we already have Commands, why do we need a Queue?

Why not just:

```js
command.execute();
```

The answer is: **all commands should be executed uniformly within the Game Loop**. For example, in this frame:

```text
Keyboard
    │
    ├── MOVE_LEFT
    ├── ROTATE
    └── DROP
```

If events are executed immediately upon occurrence, then:

* Keyboard
* Replay
* AI
* Gamepad
* Battle

Would all modify game state at different times. This is not only difficult to maintain but also cannot guarantee data consistency for each frame. After adding Command Queue, the entire flow becomes:

```text
DOM Event
        │
        ▼
 Command Queue
        │
        ▼
 Game Tick
        │
        ▼
 Execute Commands
```

All inputs wait for the next Tick, then execute sequentially in FIFO (first-in-first-out) order. Here's the Command Queue implementation:

```js
/**
 * # Command Queue
 *
 * Used to cache all Commands waiting to be executed, and execute them uniformly at the appropriate time (usually game tick / frame).
 *
 * Typical uses:
 *
 * - Input buffering
 * - Replay playback
 * - AI decision batching
 *
 * Design Features:
 *
 * - FIFO queue
 * - Flush() executes all commands at once
 */
const CommandQueue = {
  /**
   * ## Command Queue (FIFO)
   *
   * @type {object[]}
   */
  queue: [],

  /**
   * ## Enqueue a Command
   *
   * @param {object} command - Command to execute
   */
  enqueue(command) {
    this.queue.push(command);
  },

  /**
   * ## Execute and clear all Commands in the queue
   *
   * Current behavior:
   *
   * - Executes all commands at once
   * - No time-slicing control
   *
   * @param {object} context - Execution context
   */
  flush(context) {
    const { queue } = this;

    while (queue.length > 0) {
      const cmd = queue.shift();
      cmd.execute(context);
    }
  },

  /** ## Clear queue (discard all unexecuted commands) */
  clear() {
    this.queue.length = 0;
  },
};

export default CommandQueue;
```

Through `CommandQueue`'s `flush` method, commands are executed sequentially (FIFO). This brings three very important benefits:

* Ensures all inputs have consistent execution order;
* Ensures all state updates occur within the Game Loop;
* Ensures all input sources (Keyboard, Replay, AI, Gamepad) have completely consistent execution flows;

Also worth noting: `command.execute()`.

```js
import Engine from '@/lib/engine';

/**
 * # Generic Command wrapper class
 *
 * Used to represent an "executable game operation", for example:
 *
 * - MOVE
 * - ROTATE
 * - DROP
 * - START_GAME
 *
 * Design Philosophy:
 *
 * - Input → Command → Execute
 * - Supports Replay / AI / Macro
 *
 * Key Principle: Command itself contains no business logic, only describes "what happened"
 */
class Command {
  /**
   * ## Create a command instance
   *
   * @param {string} action - Command type (e.g., MOVE / ROTATE)
   * @param {object} [payload={}] - Command parameters (e.g., direction, level, etc.). Default is `{}`
   */
  constructor(action, payload = {}) {
    this.action = action;
    this.payload = payload;
  }

  /**
   * ## Execute command
   *
   * Hands the command to the unified dispatch system for processing,
   * rather than writing logic inside the Command itself.
   *
   * @param {object} context - Execution context
   */
  execute(context) {
    const { action, payload } = this;

    Engine.dispatchCommand(
      {
        action,
        payload,
      },
      context,
    );
  }
}

export default Command;
```

Here we have introduced `dispatchCommand`:

```js
import MAIN_MENU_ACTIONS from '@/lib/game/actions/main-menu-actions.js';
import GAME_PLAYING_ACTIONS from '@/lib/game/actions/game-playing-actions.js';
import PAUSED_ACTIONS from '@/lib/game/actions/paused-actions.js';
import GAME_OVER_ACTIONS from '@/lib/game/actions/game-over-actions.js';
import REPLAY_ACTIONS from '@/lib/game/actions/replay-actions.js';

/**
 * # State -> Action Mapping Table
 *
 * Selects different action handler sets based on engine's current mode.
 *
 * Design Patterns:
 *
 * - State Machine Router
 * - Command Dispatcher
 *
 * Core Responsibility:
 *
 * - Does not execute logic
 * - Only responsible for "routing + dispatching"
 */
const ACTIONS_MAP = {
  'main-menu': MAIN_MENU_ACTIONS,
  playing: GAME_PLAYING_ACTIONS,
  paused: PAUSED_ACTIONS,
  'game-over': GAME_OVER_ACTIONS,
  replay: REPLAY_ACTIONS,
};

/**
 * # Command Dispatcher
 *
 * Routes Commands to the corresponding action handler based on current game state (mode)
 *
 * @param {object} cmd - Command to execute
 * @param {object} context - Game engine instance
 */
const dispatchCommand = (cmd, context) => {
  const { action, payload } = cmd;
  const { Game, Audio } = context;

  // Current game state (FSM state)
  const mode = Game.store.getMode();

  // Get action set corresponding to current mode
  const actions = ACTIONS_MAP[mode];

  // If current state has no defined actions, ignore
  if (!actions) {
    return;
  }

  // Find corresponding handler based on command action
  const handler = actions[action];

  // Execute handler (if exists)
  handler?.(payload, { Game, Audio });
};

export default dispatchCommand;
```

The `actions` originally executed in `dispatchInput` are now transferred to `dispatchCommand` for execution. At this point, Runtime finally has a stable, predictable command execution flow.

![Tetris Data Flow - v0.6.0](assets/img/data-flow-v0.6.0.png)

## Third Architectural Evolution: Scheduler

Later, more and more asynchronous behaviors appeared. For example:

- Animation
- Line Clear Animation
- Audio Playback
- Countdown
- Delayed Tasks

If we continued to heavily use:

```
setTimeout()
setInterval()
```

Different systems would easily suffer from timing inconsistencies. So, the project added a Scheduler.

All things that required "waiting" were handed over to the Scheduler for unified scheduling. From then on, animation, audio, and Runtime began sharing the same timeline.

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

## Fifth Architectural Evolution: AI

AI was the most complex step in the entire project's evolution. If AI directly modified the real board, then:

- Replay would break;
- Battle would become complicated;
- Debugging would become increasingly difficult;

Therefore, AI was designed to only be responsible for thinking. The one that actually performed the operations was still the Runtime. After AI completed its search, it would still only submit: `Command`. AI and players truly shared a single set of game rules.

## Architecture Has Never Been the Ultimate Goal

To this day, Replay, Battle, AI, Gamepad, Scheduler, Renderer, Audio—all these modules are built on the same Runtime.

They are not independently developed features. They are capabilities that naturally evolved under a unified architecture. This is the design philosophy that tetris.js most wants to express.

> Good architecture is not about showcasing design skills. It is about allowing new capabilities to continuously grow as the project evolves, without having to start over from scratch again and again.

## Next Reading

This chapter introduced the entire project's architectural evolution process. The next chapter will truly dive into the Runtime. You will learn:

- How does the Runtime work?
- How does the Game Loop organize the entire system?
- How do Commands drive all modules?
- How does the Scheduler integrate into the entire runtime?

**Next Chapter: [03-runtime.en.md](./03-runtime.en.md)**
