# Replay

English | [简体中文](./05-replay.md)

> Replay is not a recording; it is just another way of input.

## Why Replay?

For tetris.js, implementing the Replay feature was a personal attempt, because the Tetris on the FC (Family Computer) supported replays. Developing tetris.js was also driven by the desire to implement as many of the FC Tetris features as possible using JavaScript.

## Replay is Not a Recording

<p align="center">
    <img src="assets/img/replay-record.png" alt="Replay Record">
</p>

To implement the Replay feature, I specifically searched GitHub to examine other Tetris projects' Replay implementations and also consulted AI (ChatGPT and DeepSeek). I discovered that implementing Replay does not require screen recording — it only needs to record user operations. For example:

```text
Move Left
Rotate
Soft Drop
Hard Drop
Hold
```

These operations all need to be converted into unified Commands, and during playback, the recorded operation commands are executed one by one. Since tetris.js has already implemented the Command Runtime architecture, it naturally supports Replay functionality.

### Recording User Actions in dispatchInput

In the Runtime documentation ([03-runtime.md](./03-runtime.md)), we introduced that tetris.js handles the mapping between user keys and commands through dispatchInput. Therefore, recording Replay data here is the best place:

```js
import Command from '@/lib/core/command/command.js';
import { CommandEvents, ReplayEvents } from '@/lib/events/event-catalog.js';

/**
 * # Input Dispatcher
 *
 * Converts raw input (keyboard, gamepad, AI) into Command and pushes it into the execution pipeline.
 * This is the entry point and core hub of the entire input system.
 *
 * ## Core Responsibilities
 *
 * 1. **Input Interception**: Blocks input during animation blocking (countdown, level-up, etc.)
 * 2. **Command Building**: Wraps raw input information into a standard Command object
 * 3. **Enqueue Execution**: Pushes Command into the command queue, waiting for later flush execution
 * 4. **Replay Recording**: If recording is enabled, writes Command and timestamp to replay data
 *
 * ## Data Flow
 *
 *     Keyboard/Gamepad/AI Input
 *       → Engine._subscribe → dispatch:input event
 *       → dispatchInput()
 *         → Interception check (animation blocking?)
 *         → new Command(action, payload)
 *         → command:queue:<id>:enqueue (enqueue execution)
 *         → replay:<id>:add:record (replay recording)
 *
 * ## Input Sources
 *
 * | device   | Description        |
 * | -------- | ------------------ |
 * | keyboard | Keyboard input     |
 * | gamepad  | Gamepad input      |
 * | ai       | AI auto-operation  |
 *
 * @example
 *   // Keyboard left arrow input
 *   dispatchInput(
 *     { device: 'keyboard', action: 'MOVE_LEFT', payload: { Game } },
 *     { isBlocked: false, ms: 1200 },
 *   );
 *
 *   // AI hard drop input
 *   dispatchInput(
 *     { device: 'ai', action: 'DROP', payload: { Game } },
 *     { isBlocked: false, ms: 3500 },
 *   );
 *
 * @function dispatchInput
 * @param {object} input - Input information
 * @param {object} context - Execution context object
 * @returns {void}
 */
const dispatchInput = (input, context) => {
  const { action, payload } = input;
  const { isBlocked, ms } = context;

  /**
   * ======== Input Interception Layer ========
   *
   * Blocks all inputs during the following key animations:
   *
   * - Countdown: Prevents player operations before countdown ends
   * - Level-up: Prevents misoperations during level-up effects
   *
   * Also filters out empty actions (unmapped keys, etc.)
   */
  if (isBlocked || !action) {
    return;
  }

  /** ======== Command Building ======== */
  const { Game } = payload;
  // Wraps raw input into a standard Command object
  const cmd = new Command(action, payload);
  const uuid = Game.id;
  const CE = CommandEvents(uuid);
  const RE = ReplayEvents(uuid);

  /** ======== Enqueue Execution ======== */
  // Pushes Command into the command queue, waiting for later flush execution
  Game.emit(CE.ENQUEUE, { cmd });

  /**
   * ======== Replay Recording Layer ========
   *
   * If replay recording is enabled, writes Command and timestamp to replay data.
   * ms is the pure play duration after subtracting pause time.
   *
   * Note: This is a side-effect, but temporarily kept in dispatcher,
   * may be extracted as a separate replay middleware in the future.
   */
  Game.emit(RE.ADD_RECORD, {
    ms,
    cmd,
  });
};

export default dispatchInput;
```

### Recording Game Loop-Driven Auto-Drop in Game.tick()

In addition to recording user key actions, the auto-drop behavior driven by the Game Loop must also be recorded:

```js
import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';
import { AudioEvents, GameEvents } from '@/lib/events/event-catalog.js';

/**
 * Lock delay (milliseconds): time during which the piece can continue sliding after touching the bottom.
 *
 * In high-speed phases (getSpeed ≤ 100ms), the delay provides players with an additional operation window.
 * The piece can still move or rotate after touching the bottom until the timer accumulates beyond this threshold.
 */
const LOCK_DELAY = 300;

/**
 * # Game Logic Tick
 *
 * The core logic executed in each logic frame of the game main loop:
 * auto drop, collision detection, piece locking, line clearing, spawning new piece.
 *
 * ## Execution Flow
 *
 * | Step | Condition                           | Operation                           |
 * | ---- | ----------------------------------- | ----------------------------------- |
 * | 1    | mode not playing/replay or blocked | Exit, don't drop                    |
 * | 2    | mode is playing                     | Send AUTO_TICK command (for replay recording) |
 * | 3    | Try to move down one cell           | Call `move(game, 0, 1)`             |
 * | 4    | Move successful                     | Reset lock delay, this tick ends    |
 * | 5    | Move failed (collision)             | Accumulate lock delay → lock on timeout |
 *
 * ## Lock Delay
 *
 * After touching the bottom, the piece does not lock immediately. Instead, the timer `curr._lockTimer` accumulates.
 * Each tick adds the current level's drop interval (`getSpeed()`).
 * When the accumulated time exceeds `LOCK_DELAY` (300ms), the piece actually locks.
 *
 * Successful movement (`move`) or rotation (`rotate`) resets the timer,
 * giving players more operation time. This is the key mechanism for maintaining operability in high-speed phases.
 *
 * ## Post-Lock Flow
 *
 * 1. `lock()` — Solidifies the piece onto the board
 * 2. `START_LANDING_FLASH` — Triggers landing highlight animation
 * 3. `FALL` sound effect — Plays landing sound effect
 * 4. `clearLines()` — Detects full lines and starts clear animation
 * 5. `spawn()` — Spawns the next active piece
 *
 * @function tick
 * @param {object} runtime - Game runtime object
 * @param {boolean} isBlocked - Whether blocked by animation
 * @returns {void}
 */
const tick = (runtime, isBlocked) => {
  const mode = runtime.Store.getMode();

  /**
   * ======== Step 1: Mode Check ========
   *
   * Don't execute drops in non-playing/replay modes, or during animation blocking.
   */
  if ((mode !== 'playing' && mode !== 'replay') || isBlocked) {
    return;
  }

  const AE = AudioEvents();
  const GE = GameEvents(runtime.id);

  /**
   * ======== Step 2: Replay Recording ========
   *
   * Records auto drops to the replay system in playing mode.
   */
  if (mode === 'playing') {
    runtime.emit(GE.DISPATCH_INPUT, {
      device: 'replay',
      action: 'AUTO_TICK',
      payload: { Game: runtime },
    });
  }
  const { curr, cx, cy } = runtime.Store.getState();

  /** ======== Step 3: Try to Move Down ======== */
  if (move(runtime, 0, 1)) {
    /**
     * Move successful: reset lock delay timer.
     *
     * Successfully moving down one cell means not in bottom-touch state, clear accumulated waiting time.
     */
    if (curr._lockTimer) {
      curr._lockTimer = 0;
    }
    return;
  }

  /**
   * ======== Step 4: Accumulate Lock Delay ========
   *
   * Cannot move down (bottom or collision): accumulate lock delay timer.
   * Each tick adds the current level's drop interval (getSpeed()),
   * simulating "the time the piece has been at the bottom."
   */
  if (!curr._lockTimer) {
    curr._lockTimer = 0;
  }
  curr._lockTimer += runtime.getSpeed();

  /**
   * ======== Step 5: Timeout Lock ========
   *
   * Accumulated time exceeds threshold (300ms), execute locking and subsequent flow.
   */
  if (curr._lockTimer >= LOCK_DELAY) {
    curr._lockTimer = 0;

    // 5a. Lock piece to board
    lock(runtime);

    // 5b. Landing highlight animation
    runtime.emit(GE.START_LANDING_FLASH, {
      piece: { shape: curr.shape, cx, cy },
    });

    // 5c. Play landing sound effect
    runtime.emit(AE.PLAY_SOUND, { sound: 'FALL' });

    // 5d. Detect full lines and start clear animation
    clearLines(runtime);

    // 5e. Spawn the next active piece
    spawn(runtime);
  }
};

export default tick;
```

## Why Only Save Commands?

Because Runtime ensures deterministic game execution. For Runtime, as long as: **initial state is the same**, **random sequence is the same**, and **Commands** are the same, the final game result will definitely be the same.

Therefore, Replay does not need to save: Board, Score, Animation, Canvas — these game state information. It only needs to record Command data, making the Replay data footprint extremely small. During Replay playback, it only needs to re-input the same Commands to Runtime. Runtime will automatically recalculate all game states during execution, ensuring the entire game can perfectly reproduce the previous operations.

## How Does Replay Work?

Normal gameplay:

```text
Player
↓
Command
↓
Runtime
↓
Game State
```

Replay:

```text
Replay Records
↓
Command
↓
Runtime
↓
Game State
```

The way Replay works is actually very simple. Compared to normal gameplay, the only thing that changes is the source of Commands.

<p align="center">
    <img src="assets/img/play-replay-records.png" alt="Play Replay Records">
</p>

Runtime has no idea whether the current Command comes from a player or from Replay. Therefore, Replay and normal gameplay have exactly the same execution flow.

## Replay Implementation

Now let's look at tetris.js's Replay implementation, which consists of two parts: ReplayController and ReplayRouter.

### Replay Controller

`Replay Controller` mainly manages the logical control of the Replay module:

```js
import Base from '@/lib/core';
import ReplayRouter from '@/lib/events/router/replay-router.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # ReplayController
 *
 * Replay / Recording Controller. Responsible for recording player operation commands and piece sequences,
 * and replaying the entire game process on a timeline after the game ends.
 *
 * ## Core Functions
 *
 * - **Recording**: Records Command and timestamp per frame, piece sequence
 * - **Playback**: Replays Commands according to the recorded timeline, driving the game reproduction
 * - **Fast-forward**: Limits jump cap when switching back from background tab to prevent frame burst
 * - **Piece Sequence**: Saves piece order during recording to ensure consistent pieces during playback
 *
 * ## Design Notes
 *
 * - **Event Routing Separation**: All event subscription/unsubscription is delegated to `ReplayRouter`,
 *   `ReplayController` only handles the core business logic of recording/playback
 * - **Multi-instance Support**: Designed as a Class, allowing multiple independent instances for AI battles,
 *   each maintaining its own recording/replay state and event bindings
 *
 * ## Core Fields
 *
 * | Field          | Type    | Description                   |
 * | ------------- | ------- | ----------------------------- |
 * | recording     | boolean | Whether currently recording  |
 * | playing       | boolean | Whether currently playing back |
 * | data          | Array   | Recorded data [{ ms, cmd }]   |
 * | cursor        | number  | Replay read position          |
 * | pieceSequence | Array   | Piece sequence                |
 * | pieceIndex    | number  | Piece sequence read position  |
 * | playElapsed   | number  | Replay logical time           |
 * | startTime     | number  | Recording/replay start timestamp |
 * | timestamp     | number  | Current frame timestamp       |
 *
 * @augments Base
 * @class ReplayController
 */
class ReplayController extends Base {
  /**
   * ## Whether there is recorded replay data.
   *
   * @returns {boolean} True if replay data exists, false otherwise
   */
  get hasData() {
    return this.data.length > 0;
  }

  /**
   * ## Constructor
   *
   * @param {object} options - Configuration (dependency execution context) object
   * @param {object} options.Game - Main game instance
   * @param {object} options.Store - Game state storage
   * @param {object} options.Scheduler - Task scheduler
   */
  constructor(options) {
    super(options);

    this.initialize();
  }

  /**
   * ## Initialize all internal states
   *
   * Resets all recording/replay related flags and data,
   * and creates a ReplayRouter instance to handle event routing.
   *
   * @returns {void}
   */
  initialize() {
    /**
     * ## Whether currently recording
     *
     * @default false
     * @type {boolean}
     */
    this.recording = false;

    /**
     * ## Whether currently playing back
     *
     * @default false
     * @type {boolean}
     */
    this.playing = false;

    /**
     * ## Recorded data
     *
     * Array structure: `[{ ms: number, cmd: Command }]`
     *
     * - `ms`: Time offset from recording start to this command (milliseconds)
     * - `cmd`: Command instance
     *
     * @type {{ ms: number; cmd: object }[]}
     */
    this.data = [];

    /**
     * ## Replay read position index
     *
     * @default 0
     * @type {number}
     */
    this.cursor = 0;

    /**
     * ## Recorded piece sequence
     *
     * Used to ensure piece order during replay is completely consistent with recording.
     *
     * @type {object[]}
     */
    this.pieceSequence = [];

    /**
     * ## Replay piece sequence read position index
     *
     * @default 0
     * @type {number}
     */
    this.pieceIndex = 0;

    /**
     * ## Replay logical time (milliseconds)
     *
     * Independent "replay clock" separate from wall-clock,
     * used to advance commands at the recorded rhythm.
     *
     * @default 0
     * @type {number}
     */
    this.playElapsed = 0;

    /**
     * ## Recording or replay start timestamp
     *
     * Records the timestamp of the first frame during recording,
     * records the start timestamp during playback.
     *
     * @default 0
     * @type {number}
     */
    this.startTime = 0;

    /**
     * ## Current frame timestamp
     *
     * Updated every frame by the `update()` method.
     *
     * @default 0
     * @type {number}
     */
    this.timestamp = 0;

    const { Game } = this;

    /**
     * ## Event Router
     *
     * Responsible for listening to all `replay:*` events and dispatching them to the corresponding methods.
     *
     * @type {ReplayRouter}
     */
    this.Router = new ReplayRouter({
      Replay: this,
      Game,
    });
  }

  /**
   * ## Get the next piece
   *
   * In playback mode, reads from the recorded piece sequence in order.
   * Ensures piece order during playback is completely consistent with recording.
   *
   * @returns {{ curr: object | null; next: object | null }} Current piece and next preview piece
   */
  getNextPiece() {
    // Don't read sequence in non-playback mode
    if (!this.playing) {
      return { curr: null, next: null };
    }

    // Take one piece in order
    const piece = this.pieceSequence[this.pieceIndex++];

    // Prevent index out of bounds
    if (!piece) {
      return { curr: null, next: null };
    }

    // Pre-read next piece (may be null)
    const next = this.pieceSequence[this.pieceIndex] || null;

    return { curr: piece, next };
  }

  /**
   * ## Synchronize replay logical clock
   *
   * Calculates the difference between current wall-clock time and startTime as replay progress.
   * If time jump is too large (tab switched to background), limits the single jump cap to 1 second,
   * preventing frame burst when switching back.
   *
   * @param {object} ctx - Execution context object
   * @param {number} ctx.timestamp - Current requestAnimationFrame timestamp
   * @param {boolean} ctx.isBlocked - Whether in paused/blocked state
   * @returns {void}
   */
  syncPlayElapsed({ timestamp, isBlocked }) {
    // Skip if not playing or blocked
    if (!this.playing || isBlocked) return;

    const prev = this.playElapsed;
    const now = timestamp - this.startTime;
    const delta = now - prev;

    // Time jump exceeds 1 second (tab switched to background), limit to max 1 second fast-forward
    if (delta > 1000) {
      this.startTime += delta - 1000;
      this.playElapsed = prev + 1000;
    } else {
      this.playElapsed = now;
    }
  }

  /**
   * ## Called every frame, drives replay logic
   *
   * Execution flow:
   *
   * 1. Update current timestamp
   * 2. Check if in replay state
   * 3. Check if replay is complete (all commands executed)
   * 4. If needed, fast-forward to skip long waits (after tab switch back)
   * 5. Inject all commands whose logical time has arrived into EventBus one by one
   *
   * @param {object} ctx - Execution context object
   * @param {number} ctx.speed - Current drop interval (milliseconds), used for fast-forward threshold calculation
   * @param {number} ctx.timestamp - Current requestAnimationFrame timestamp
   * @returns {void}
   */
  update({ speed, timestamp }) {
    const { Store, Game, data } = this;
    const mode = Store.getMode();

    // Update current frame timestamp
    this.timestamp = timestamp;

    // Not in replay state, exit directly
    if (!this.playing || mode !== 'replay') {
      return;
    }

    const events = GameEvents(Game.id);

    /**
     * ======== Replay Complete: All Commands Executed ========
     *
     * When cursor exceeds data array length, all recorded commands have been replayed.
     * Stop replay and switch to game-over mode.
     */
    if (data.length > 0 && this.cursor >= data.length) {
      this.stopPlay();
      this.emit(events.UPDATE_MODE, { mode: 'game-over' });
      return;
    }

    /**
     * ======== Fast-forward Logic ========
     *
     * If the next command needs to wait more than 2x drop interval,
     * there's a pause/gap in between (player paused or tab switched background).
     * Fast-forward to near that command to avoid long "waiting."
     */
    const next = data[this.cursor];

    if (next) {
      const interval = speed ?? 1000;
      const gap = next.ms - this.playElapsed;

      if (gap > interval * 2) {
        // Max fast-forward 1 second at a time to prevent frame burst
        const skip = Math.min(gap - interval, 1000);
        this.playElapsed += skip;
        this.startTime = timestamp - this.playElapsed;
      }
    }

    /**
     * ======== Core Replay Loop ========
     *
     * Injects all commands with logical time <= playElapsed into EventBus at once.
     * These commands are dispatched to corresponding action handlers through dispatchCommand.
     */
    while (
      this.playing &&
      this.cursor < data.length &&
      data[this.cursor].ms <= this.playElapsed
    ) {
      const { cmd } = data[this.cursor];

      if (cmd.action === 'HOLD_SYNC') {
        // Does not participate in game logic, only for debugging/rendering
        return;
      }

      this.emit(events.DISPATCH_COMMAND, cmd);
      this.cursor++;
    }
  }

  /**
   * ## Start recording
   *
   * Sets recording flag to true, clears old data and piece sequence,
   * sets startTime to current timestamp.
   *
   * @returns {void}
   */
  startRecord() {
    this.recording = true;
    this.data = [];
    this.pieceSequence = [];
    this.pieceIndex = 0;
    this.playElapsed = 0;
    this.startTime = this.timestamp;
  }

  /**
   * ## Stop recording
   *
   * @returns {void}
   */
  stopRecord() {
    this.recording = false;
  }

  /**
   * ## Start playback
   *
   * Sets playing flag to true, resets cursor and pieceIndex,
   * sets startTime to current timestamp.
   *
   * @returns {void}
   */
  startPlay() {
    this.playing = true;
    this.cursor = 0;
    this.pieceIndex = 0;
    this.startTime = this.timestamp;
  }

  /**
   * ## Stop playback
   *
   * @returns {void}
   */
  stopPlay() {
    this.playing = false;
  }

  /**
   * ## Add a recording record
   *
   * Only writes data in recording state.
   *
   * @param {object} record - Recording data `{ ms, cmd }`
   * @returns {void}
   */
  addRecord(record) {
    if (!this.recording) {
      return;
    }

    this.data.push(record);
  }

  /**
   * ## Add a piece to the sequence
   *
   * Only writes in recording state, uses deep copy to avoid reference pollution.
   *
   * @param {object} piece - Piece data
   * @returns {void}
   */
  addPiece(piece) {
    if (!this.recording) {
      return;
    }

    this.pieceSequence.push(structuredClone(piece));
  }

  /**
   * ## Clear all data, reset flags
   *
   * Note: Does not clear event bindings, only resets recording/replay related states.
   *
   * @returns {void}
   */
  clear() {
    this.recording = false;
    this.playing = false;
    this.cursor = 0;
    this.data = [];
    this.pieceSequence = [];
    this.pieceIndex = 0;
    this.startTime = 0;
  }

  /**
   * ## Stop recording/replay and clear all data
   *
   * Equivalent to `stopRecord()` + `stopPlay()` + `clear()`.
   * Triggered by the `replay:<id>:reset` event.
   *
   * @returns {void}
   */
  reset() {
    this.stopRecord();
    this.stopPlay();
    this.clear();
  }

  /**
   * ## Bind all event listeners
   *
   * Delegated to ReplayRouter.
   *
   * @returns {void}
   */
  subscribe() {
    this.Router.subscribe();
  }

  /**
   * ## Unbind all event listeners
   *
   * Delegated to ReplayRouter.
   *
   * @returns {void}
   */
  unsubscribe() {
    this.Router.unsubscribe();
  }

  /**
   * ## Destroy instance
   *
   * Stops all recording/replay, clears data, unbinds all events.
   * Primarily used for switching opponents in AI battles or completely unloading the replay module.
   *
   * @returns {void}
   */
  destroy() {
    // Stop and clear state first
    this.reset();

    // Unbind events one by one
    this.unsubscribe();
  }
}

export default ReplayController;
```

### ReplayRouter

`ReplayRouter` is mainly responsible for event subscription and publishing related to Replay:

```js
import Base from '@/lib/core';
import {
  AudioEvents,
  AIEvents,
  GameEvents,
  ReplayEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/**
 * # ReplayRouter
 *
 * Handles all event routing related to the replay system.
 * Serves as the bridge between ReplayController and the game event system,
 * converting external events into method calls on ReplayController.
 *
 * ## Core Responsibilities
 *
 * - **Event Listening**: Listens to all events in the `replay:*` namespace
 * - **Event Dispatching**: Calls ReplayController methods based on event type
 * - **Flow Coordination**: Coordinates replay system behavior at critical moments like game over and line clears
 *
 * ## Design Notes
 *
 * - **Separation of Concerns**: Separates event routing logic from ReplayController,
 *   keeping the controller focused on core business logic
 * - **Centralized Event Management**: All replay-related event handling logic is centralized in this class,
 *   making it easier to maintain and understand
 * - **State Awareness**: Intelligently decides whether to respond to certain events based on replay state and game state
 *
 * ## Event Types Handled
 *
 * | Event Category | Event Name         | Handler Method     | Description               |
 * | -------------- | ------------------ | ------------------ | ------------------------- |
 * | Recording      | START_RECORD       | _onStartRecord     | Start recording game process |
 * | Recording      | STOP_RECORD        | _onStopRecord      | Stop recording game process |
 * | Recording      | ADD_RECORD         | _onAddRecord       | Add an operation record    |
 * | Recording      | ADD_PIECE          | _onAddPiece        | Add a piece to sequence    |
 * | Playback       | START_PLAY         | _onStartPlay       | Start replaying game process |
 * | Playback       | RESET              | _onReset           | Reset replay system        |
 * | Flow Control   | GAME_OVER          | _onGameOver        | Game over handling         |
 * | Flow Control   | STOP_CLEAR_LINES   | _onStopClearLines  | Line clear completion handling |
 *
 * @augments Base
 * @class ReplayRouter
 */
class ReplayRouter extends Base {
  /**
   * ## Constructor
   *
   * Creates a ReplayRouter instance. Note: The constructor does not automatically subscribe to events;
   * `subscribe()` must be called manually.
   *
   * @param {object} options - Configuration (dependency execution context) object
   * @param {object} options.Game - Main game instance
   * @param {object} options.Replay - ReplayController instance
   */
  constructor(options) {
    super(options);
    // Event binding is handled externally, keeping initialization flexible
  }

  /**
   * ## Bind all event listeners
   *
   * Called once during game initialization.
   * Registers all game events that the replay system needs to listen to.
   *
   * ### Event Categories
   *
   * 1. **Recording operation events**: Start recording, stop recording, add record, add piece
   * 2. **Playback operation events**: Start playback, reset replay
   * 3. **Flow control events**: Game over, line clear complete
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    // Get replay system event names (with game ID namespace)
    const events = ReplayEvents(Game.id);

    /* ---------- Recording Operations ---------- */
    // Start recording game process
    this.on(events.START_RECORD, this._onStartRecord);
    // Stop recording game process
    this.on(events.STOP_RECORD, this._onStopRecord);
    // Add an operation command record
    this.on(events.ADD_RECORD, this._onAddRecord);
    // Add a piece to sequence
    this.on(events.ADD_PIECE, this._onAddPiece);

    /* ---------- Playback Operations ---------- */
    // Start replaying game process
    this.on(events.START_PLAY, this._onStartPlay);
    // Reset replay system (clear all data)
    this.on(events.RESET, this._onReset);

    /* ---------- Flow Control ---------- */
    // Game over handling (prepare replay or enter end screen)
    this.on(events.GAME_OVER, this._onGameOver);
    // Line clear completion handling (level-up sound and effects)
    this.on(events.STOP_CLEAR_LINES, this._onStopClearLines);
  }

  /**
   * ## Unbind all event listeners
   *
   * Removes all registered event listeners.
   * Called when the component is destroyed or when replay events no longer need to be responded to,
   * to avoid memory leaks.
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    // Get replay system event names (with game ID namespace)
    const events = ReplayEvents(Game.id);

    /* ---------- Recording Operations ---------- */
    this.off(events.START_RECORD, this._onStartRecord);
    this.off(events.STOP_RECORD, this._onStopRecord);
    this.off(events.ADD_RECORD, this._onAddRecord);
    this.off(events.ADD_PIECE, this._onAddPiece);

    /* ---------- Playback Operations ---------- */
    this.off(events.START_PLAY, this._onStartPlay);
    this.off(events.RESET, this._onReset);

    /* ---------- Flow Control ---------- */
    this.off(events.GAME_OVER, this._onGameOver);
    this.off(events.STOP_CLEAR_LINES, this._onStopClearLines);
  }

  /**
   * ## Start recording
   *
   * Triggered when `START_RECORD` event is received.
   * Calls ReplayController's `startRecord()` method to start recording the game process.
   *
   * @private
   * @returns {void}
   */
  _onStartRecord = () => {
    const { Replay } = this;
    Replay.startRecord();
  };

  /**
   * ## Stop recording
   *
   * Triggered when `STOP_RECORD` event is received.
   * Calls ReplayController's `stopRecord()` method to stop recording the game process.
   *
   * @private
   * @returns {void}
   */
  _onStopRecord = () => {
    const { Replay } = this;
    Replay.stopRecord();
  };

  /**
   * ## Record a command
   *
   * Triggered when `ADD_RECORD` event is received.
   * Only writes in recording state, automatically ignored in non-recording state.
   *
   * @private
   * @param {object} record - Recording data object
   * @param {number} record.ms - Time offset from recording start to this command (milliseconds)
   * @param {object} record.cmd - Command object
   * @returns {void}
   */
  _onAddRecord = (record) => {
    const { Replay } = this;
    Replay.addRecord(record);
  };

  /**
   * ## Record a piece
   *
   * Triggered when `ADD_PIECE` event is received.
   * Only writes in recording state, uses deep copy to avoid reference pollution.
   *
   * @private
   * @param {object} piece - Piece data object (contains shape, color, position, etc.)
   * @returns {void}
   */
  _onAddPiece = (piece) => {
    const { Replay } = this;
    Replay.addPiece(piece);
  };

  /**
   * ## Start playback
   *
   * Triggered when `START_PLAY` event is received.
   * Calls ReplayController's `startPlay()` method to start replaying the game process.
   *
   * @private
   * @returns {void}
   */
  _onStartPlay = () => {
    const { Replay } = this;
    Replay.startPlay();
  };

  /**
   * ## Reset replay system
   *
   * Triggered when `RESET` event is received.
   * Calls ReplayController's `reset()` method to stop recording/replay and clear all data.
   *
   * @private
   * @returns {void}
   */
  _onReset = () => {
    const { Replay } = this;
    Replay.reset();
  };

  /**
   * ## Game over handling
   *
   * Triggered when `GAME_OVER` event is received.
   *
   * ### Handling Logic
   *
   * - **Has replay data**: Prepare board for replay mode
   *
   *   - Stop AI control
   *   - Trigger `REPLAY_PREPARE` event, passing next piece information
   * - **No replay data**: Directly enter game-over state
   *
   *   - Trigger UI mode update event
   *   - Trigger game mode update event
   *
   * This design allows players to immediately replay the game just played after it ends.
   *
   * @private
   * @returns {void}
   */
  _onGameOver = () => {
    const { Replay, Game } = this;
    const uuid = Game.id;
    const AE = AIEvents(uuid);
    const GE = GameEvents(uuid);
    const UE = UIEvents(uuid);

    // Check if there is recorded replay data
    if (Replay.hasData) {
      // Has replay data: stop AI control
      this.emit(AE.STOP);
      // Prepare replay board, pass next piece information
      this.emit(GE.REPLAY_PREPARE, {
        nextPiece: Replay.getNextPiece(),
      });
    } else {
      // No replay data: directly enter game over interface
      this.emit(UE.UPDATE_MODE, { mode: 'game-over' });
      this.emit(GE.UPDATE_MODE, { mode: 'game-over' });
    }
  };

  /**
   * ## Line clear handling
   *
   * Triggered when `STOP_CLEAR_LINES` event is received.
   *
   * ### Handling Logic
   *
   * Does not trigger level-up sound/animation during replay; triggers when leveling up
   * during recording or normal gameplay. This design ensures:
   *
   * - Replay does not replay level-up effects (these effects were already played during recording)
   * - Normal gameplay and recording still have full audiovisual feedback
   *
   * ### Triggered Effects
   *
   * 1. Pause current background music (BGM)
   * 2. Play level-up sound effect
   * 3. Trigger level-up effect animation
   *
   * @private
   * @param {object} param - Parameter object
   * @param {boolean} param.isLevelUp - Whether leveling up (cleared lines reached level-up condition)
   * @param {number} param.level - Current level (new level after level-up)
   * @returns {void}
   */
  _onStopClearLines = ({ isLevelUp, level }) => {
    const { Game, Replay } = this;

    // Only trigger level-up effects on level-up and non-replay state, skip during replay to avoid duplicate effects
    if (!isLevelUp || Replay.playing) {
      return;
    }

    const AE = AudioEvents();
    const GE = GameEvents(Game.id);

    // Only play level-up sound in non-versus mode
    if (!Game.isVersus()) {
      // Pause current background music to make way for level-up sound
      this.emit(AE.STOP_BGM);
      // Play level-up sound effect
      this.emit(AE.PLAY_SOUND, { sound: 'LEVEL_UP' });
      // Trigger level-up effect animation
      this.emit(GE.START_LEVEL_UP, { level });
    }
  };
}

export default ReplayRouter;
```

## Why Can Replay Stay Synchronized?

The premise for Replay to work is not Commands themselves. What truly matters is: **Runtime determinism**.

If the same Command produces different results when executed today versus tomorrow, Replay would immediately break. Therefore, the entire project always follows one principle: **Same input, same output**.

The method specifically responsible for keeping Replay synchronized with the Game Loop main loop is: `update`.

### update

```js
class Replay extends Base {
  // 省略其他逻辑...
  /**
   * ## Called every frame, drives replay logic
   *
   * Execution flow:
   *
   * 1. Update current timestamp
   * 2. Check if in replay state
   * 3. Check if replay is complete (all commands executed)
   * 4. If needed, fast-forward to skip long waits (after tab switch back)
   * 5. Inject all commands whose logical time has arrived into EventBus one by one
   *
   * @param {object} ctx - Execution context object
   * @param {number} ctx.speed - Current drop interval (milliseconds), used for fast-forward threshold calculation
   * @param {number} ctx.timestamp - Current requestAnimationFrame timestamp
   * @returns {void}
   */
  update({ speed, timestamp }) {
    const { Store, Game, data } = this;
    const mode = Store.getMode();

    // Update current frame timestamp
    this.timestamp = timestamp;

    // Not in replay state, exit directly
    if (!this.playing || mode !== 'replay') {
      return;
    }

    const events = GameEvents(Game.id);

    /**
     * ======== Replay Complete: All Commands Executed ========
     *
     * When cursor exceeds data array length, all recorded commands have been replayed.
     * Stop replay and switch to game-over mode.
     */
    if (data.length > 0 && this.cursor >= data.length) {
      this.stopPlay();
      this.emit(events.UPDATE_MODE, { mode: 'game-over' });
      return;
    }

    /**
     * ======== Fast-forward Logic ========
     *
     * If the next command needs to wait more than 2x drop interval,
     * there's a pause/gap in between (player paused or tab switched background).
     * Fast-forward to near that command to avoid long "waiting."
     */
    const next = data[this.cursor];

    if (next) {
      const interval = speed ?? 1000;
      const gap = next.ms - this.playElapsed;

      if (gap > interval * 2) {
        // Max fast-forward 1 second at a time to prevent frame burst
        const skip = Math.min(gap - interval, 1000);
        this.playElapsed += skip;
        this.startTime = timestamp - this.playElapsed;
      }
    }

    /**
     * ======== Core Replay Loop ========
     *
     * Injects all commands with logical time <= playElapsed into EventBus at once.
     * These commands are dispatched to corresponding action handlers through dispatchCommand.
     */
    while (
      this.playing &&
      this.cursor < data.length &&
      data[this.cursor].ms <= this.playElapsed
    ) {
      const { cmd } = data[this.cursor];

      if (cmd.action === 'HOLD_SYNC') {
        // Does not participate in game logic, only for debugging/rendering
        return;
      }

      this.emit(events.DISPATCH_COMMAND, cmd);
      this.cursor++;
    }
  }
}
```

The update method accepts two parameters:

- speed: Current drop interval (milliseconds), used for fast-forward threshold calculation
- timestamp: Current requestAnimationFrame timestamp from the game main loop

`timestamp` is the Game Loop main loop timestamp. Replay synchronizes time with the main loop through this value during playback.

### requestAnimationFrame Issue When Tab Loses Focus

One important issue to note is that in current mainstream browsers, requestAnimationFrame behavior when a tab loses focus is: **the browser automatically pauses or significantly reduces the callback execution frequency**.

This is primarily for performance and power saving reasons. Specific behaviors are as follows:

#### **Complete Pause (most common)**

When users switch to another tab or minimize the browser window, most modern browsers completely pause rAF callback execution. Animations, game logic, and data updates based on rAF on the page all stop, as if the pause button was pressed.

This is exactly the premise for ensuring smooth JS animations — if the page is not visible, there's no need to waste resources rendering frames the user can't see.

#### **Throttled Execution (specific scenarios)**

In some scenarios, such as when the page is partially obscured by other windows but still partially visible, or when the browser's background tab throttling mechanism is active, rAF may not be completely paused but executed at a very low frequency (e.g., once per second). However, this behavior is not consistent and should not be relied upon.

For tetris.js's replay animation, which relies on time stepping (e.g., position accumulation), when the tab resumes, the animation may "jump frames." Because at the moment of resuming, the DOMHighResTimeStamp parameter of the callback function will have a huge delta.

### syncPlayElapsed Synchronizes Replay Logical Clock

To be more specific, when the player switches back to the game tab, a large number of commands may execute instantly, causing frame burst. To solve this problem, Replay provides the `syncPlayElapsed` method specifically to synchronize the replay logical clock:

```js
class Replay extends Base {
  // 省略其他逻辑...
  /**
   * ## Synchronize replay logical clock
   *
   * Calculates the difference between current wall-clock time and startTime as replay progress.
   * If time jump is too large (tab switched to background), limits the single jump cap to 1 second,
   * preventing frame burst when switching back.
   *
   * @param {object} ctx - Execution context object
   * @param {number} ctx.timestamp - Current requestAnimationFrame timestamp
   * @param {boolean} ctx.isBlocked - Whether in paused/blocked state
   * @returns {void}
   */
  syncPlayElapsed({
                    timestamp,
                    isBlocked
                  }) {
    // Skip if not playing or blocked
    if (!this.playing || isBlocked) return;

    const prev = this.playElapsed;
    const now = timestamp - this.startTime;
    const delta = now - prev;

    // Time jump exceeds 1 second (tab switched to background), limit to max 1 second fast-forward
    if (delta > 1000) {
      this.startTime += delta - 1000;
      this.playElapsed = prev + 1000;
    } else {
      this.playElapsed = now;
    }
  }
}
```

Calculates the difference between current wall-clock time and startTime as replay progress.

```js
/**
 * ======== Core Replay Loop ========
 *
 * Injects all commands with logical time <= playElapsed into EventBus at once.
 * These commands are dispatched to corresponding action handlers through dispatchCommand.
 */
while (
  this.playing &&
  this.cursor < data.length &&
  data[this.cursor].ms <= this.playElapsed
) {
  const { cmd } = data[this.cursor];

  if (cmd.action === 'HOLD_SYNC') {
    // Does not participate in game logic, only for debugging/rendering
    return;
  }

  this.emit(events.DISPATCH_COMMAND, cmd);
  this.cursor++;
}
```

If time jump is detected to be too large (tab switched to background), limits the single jump cap to 1 second, **preventing frame burst when switching back**.

## The Value Replay Brings

The significance of Replay goes far beyond just "replaying a game." Since Replay essentially saves `Commands`, it can also be used for:

- Bug reproduction
- AI debugging
- Performance testing
- Automated testing
- Data analysis

## Replay Architecture Diagram

We've discussed many implementation details of Replay. Let's take a comprehensive look at how it works through the Replay architecture diagram:

<p align="center">
    <img src="assets/img/replay-flow.png" alt="Replay Flow">
</p>

## Runtime is the Real Protagonist

Replay may look like an independent module, but in reality, it has almost no game logic of its own. What Replay does is very simple: read Commands, then submit them to Runtime one by one.

What truly drives the entire game forward is always Runtime. Replay is just another input source for Runtime. This design also allows Replay to share a completely consistent execution flow with:

- Players
- AI
- Battle

## Summary

Replay is not a recording, nor is it a board snapshot. Replay only saves the Commands generated during the game process.

What truly makes Replay work is not Replay itself, but Runtime determinism. Because the entire game always follows: **Same input, same output**.

Replay can therefore reproduce the entire game with an extremely small data footprint. This is also a natural result of the entire project's architectural design.

## Next Reading

Replay records how the game happened. The next chapter will introduce: **Battle**. Learn how multiplayer battles are built on the same Runtime without re-implementing another set of game logic.

**Next Chapter: [06-battle.en.md](./06-battle.en.md)**
