# Architecture

简体中文 | [English](./02-architecture.en.md)

> 架构不是设计出来的，而是在不断解决问题的过程中演进出来的。

## 为什么要写这一章？

很多项目介绍架构时，都会直接给出一张模块图。例如：

```
Engine
│
├── Renderer
├── Audio
├── AI
├── Replay
└── ...
```

这样的架构图当然没有问题。但它只能告诉我们：

> **现在是什么样。**

![System Architecture Diagram](assets/img/architecture-poster.png)

却无法回答一个更重要的问题：

> **为什么会变成这样？**

事实上，绝大多数软件架构都不是一次设计完成的。它们是在不断解决真实问题的过程中，逐渐演进出来的。tetris.js 也是如此。

## 一切，都从一个简单的俄罗斯方块开始。

项目最初的版本并没有 Runtime、没有 Scheduler、没有 Replay，也没有 AI。

它只是一个最普通的浏览器小游戏。整个程序可能只有几个核心部分：

![Tetris Code - v0.3.1](assets/img/code-v0.3.1.png)

原始代码：[v0.3.1](https://www.npmjs.com/package/@yaohaixiao/tetris.js/v/0.3.1?activeTab=code)

游戏循环也非常简单。

```js
/**
 * # 游戏主循环
 *
 * 控制游戏核心逻辑：下落、碰撞检测、锁定方块、消行、生成新方块 游戏结束或暂停时直接中断执行 每帧执行一次，保证游戏流畅运行
 *
 * @function loop
 * @returns {boolean} 返回是否继续执行主循环
 */
export function loop() {
  // 升级动画期间：只更新动画、不进行游戏逻辑
  if (gameState.levelUpEffect.show) {
    updateLevelUpEffect();
    drawBoard(gameState.board);
    drawCurr(gameState.curr, gameState.cx, gameState.cy);
    drawLevelUpEffect();
    return true;
  }

  // 游戏结束 / 暂停 → 停止主循环
  if (gameState.isGameOver || gameState.isPaused) {
    return false;
  }

  // 尝试向下移动一格，无法移动时执行锁定逻辑
  if (!move(0, 1)) {
    // 锁定当前方块到棋盘
    lock();
    // 播放落地音效
    sounds.fall();
    // 执行消行逻辑（包含闪烁3次特效）
    clearLines();
    // 生成新下落方块
    spawn();

    // 生成新方块后游戏结束 → 终止循环
    if (gameState.isGameOver) {
      return false;
    }
  }

  // 绘制游戏棋盘 + 当前下落方块
  drawBoard(gameState.board);
  drawCurr(gameState.curr, gameState.cx, gameState.cy);

  // 正常继续循环
  return true;
}

/**
 * # 带速度控制的游戏主循环
 *
 * 只有达到指定时间间隔才执行下落逻辑
 *
 * @function updateMainLoop
 * @param {number} timestamp - 时间戳数值
 * @returns {void}
 */
export const updateMainLoop = (timestamp) => {
  // 获取当前等级的下落间隔（毫秒）
  const dropInterval = getSpeed();

  // 达到时间间隔才下落
  if (
    !gameState.gameTimestamp ||
    timestamp - gameState.gameTimestamp > dropInterval
  ) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    loop();
    gameState.gameTimestamp = timestamp;
  }

  // 继续下一帧
  gameState.gameRafId = requestAnimationFrame(updateMainLoop);
};
```

对于一个最简单的俄罗斯方块来说。这样的实现完全没有问题。甚至可以说，这是大多数教程都会采用的方式。当时的架构是这样的：

![Architecture v0.3.1](assets/img/architecture-v0.3.1.png)

但是，随着功能不断增加，新的问题开始出现。

## 第一个问题：代码开始变得越来越分散

当增加键盘控制时。代码需要监听：`keydown`，增加新功能又需要：`keyup`。增加触摸控制，又会出现很多 DOM 按键的事件绑定和处理函数。

后来加入 Gamepad 游戏手柄支持，又增加了一套新的输入。 渐渐地，不同输入设备开始直接修改游戏状态。

### 移动方块


大致的流程如下：


```
Keyboard
↓
move()
↓
Board
```

移动方法 move() 的实现：

```js
/**
 * # 移动当前方块
 *
 * 尝试将当前方块按照指定的偏移量移动（左右/下） 先检测碰撞，无碰撞则执行移动并播放音效
 *
 * @function move
 * @param {number} ox - X 轴偏移量（-1=左, 1=右, 0=不移动）
 * @param {number} oy - Y 轴偏移量（1=下落, 0=不移动）
 * @returns {boolean} 移动成功返回 true，碰撞无法移动返回 false
 */
export function move(ox, oy) {
  // 无碰撞 → 可以移动
  if (!collision(ox, oy)) {
    gameState.cx += ox;
    gameState.cy += oy;
    // 播放移动音效
    sounds.move();
    return true;
  }

  // 发生碰撞，无法移动
  return false;
}
```

### 旋转方块

流程如下：

```
Touch
↓
rotate()
↓
Board
```

旋转方法 rotate() 的实现：

```js
/**
 * # 旋转当前方块
 *
 * 对当前方块进行顺时针旋转（矩阵转置 + 反转） 旋转后若发生碰撞，则自动撤销旋转，保证游戏正常运行
 *
 * @function rotate
 * @returns {void}
 */
export const rotate = () => {
  // 保存旋转前的形状，用于碰撞后恢复
  const prev = gameState.curr.shape;

  // 顺时针旋转矩阵：转置 + 反转行
  gameState.curr.shape = prev[0].map((_, i) =>
    prev.map((r) => r[i]).toReversed(),
  );

  // 旋转后发生碰撞 → 恢复原状
  if (collision(0, 0)) {
    gameState.curr.shape = prev;
  } else {
    // 旋转成功 → 播放音效
    sounds.rotate();
  }
};
```

### 强制降落

流程如下：

```
Gamepad
↓
drop()
↓
Board
```

强制降落方法 drop() 的实现：

```js
/**
 * # 快速下落（硬降）
 *
 * 方块瞬间直接落到底部，自动锁定、消行、生成新方块 相比普通下落，直接触达最底部，是玩家常用操作
 *
 * @function drop
 * @returns {void}
 */
export function drop() {
  // 循环向下移动，直到无法移动（触底/碰撞）
  while (true) {
    if (!move(0, 1)) {
      break;
    }
  }

  // 锁定方块到棋盘
  lock();
  // 播放落地音效
  sounds.fall();
  // 消行处理（含闪烁3次特效）
  clearLines();
  // 生成新方块
  spawn();
  // 播放快速下落完成音效
  sounds.drop();
}
```


它们都能够直接修改游戏状态 `gameState`。代码虽然还能工作，但已经开始出严重的耦合依赖问题。

## 第二个问题：越来越多的系统开始依赖游戏逻辑

后来，动画加入了、 音效加入了、Replay 加入了、AI 加入了、 Battle 加入了。如果每一个模块都直接修改游戏状态。那么整个项目最终会变成：

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

每一个模块都知道如何操作游戏，每一个模块也都依赖游戏实现，新增一个功能就意味着需要修改多个地方，这也是很多小游戏最终越来越难维护的原因。


## 第一次架构演进：输入与游戏解耦

随着增加更多输入控制逻辑，项目开始进行第一次比较大的调整，启用输入映射：`dispatchInput`。

![Tetris Code - v0.3.1](assets/img/code-v0.3.1.png)

### 以前的处理方式

v0.3.1 中所有游戏状态中的输入都是写在事件处理函数里面，这也是最常见的处理方式：

```js
/**
 * # 游戏主键盘事件处理器（统一分发所有按键操作）
 *
 * 根据当前游戏状态，分发到对应逻辑：等级选择、游戏结束、全局快捷键、游戏操控
 *
 * @function onControlButtonsPress
 * @param {KeyboardEvent} e - 键盘事件对象
 * @returns {boolean} 是否阻止后续操作
 */
const onControlButtonsPress = (e) => {
  // 获取按下的键名与小写键名
  const { key } = e;
  const lowerKey = key.toLowerCase();

  // 倒计时界面和升级特效界面禁止操作
  if (gameState.countdown.show || gameState.levelUpEffect.show) {
    return false;
  }

  // 1. 等级选择界面操作
  if (gameState.isSelectLevel) {
    executeLevelSelectionCommand(key, lowerKey);
    return false;
  }

  // 2. 游戏结束状态：按 Enter 返回主菜单
  if (gameState.isGameOver) {
    if (key === 'Enter') {
      executeDrawLevelSelectCommand();
    }
    return false;
  }

  // 3. 全局快捷键（M/R/Q/P）优先处理
  if (executeShortcutsCommand(lowerKey)) {
    return false;
  }

  // 4. 暂停状态：不响应游戏操作
  if (gameState.isPaused) {
    return false;
  }

  // 5. 正常游戏：处理方向键/空格操控
  executeDirectionControlCommand(key);

  // 重新绘制游戏界面
  drawBoard(gameState.board);
  drawCurr(gameState.curr, gameState.cx, gameState.cy);
};

/**
 * # 绑定游戏全局事件
 *
 * 窗口大小自适应、键盘按下、键盘松开事件
 *
 * @function bindEvents
 * @returns {void}
 */
const bindEvents = () => {
  // 窗口大小变化时自适应画布
  globalThis.addEventListener('resize', onResize);

  // 监听键盘按下事件，处理所有游戏操作
  document.addEventListener('keydown', onControlButtonsPress);

  // 监听键盘松开事件，用于取消 P 键长按计时
  document.addEventListener('keyup', onPauseStop);
};
```

可以看到，随着游戏功能越来越负责，游戏状态越来越多，这个事件处理函数将臃肿不堪，且很难测试和维护。

### 映射输入（dispatchInput）

为解决按键和不通过状态不断增加带来的问题，于是采用了**映射输入（dispatchInput）**来解决问题。看看 `dispatchInput` 带来的改变吧：

```js
import resolveInputAction from '@/lib/input/resolve-input-action.js';
import dispatchInput from '@/lib/input/dispatch-input.js';

/**
 * # 游戏主键盘事件处理器（统一分发所有按键操作）
 *
 * 根据当前游戏状态，分发到对应逻辑：等级选择、游戏结束、全局快捷键、游戏操控
 *
 * @function onKeydown
 * @param {KeyboardEvent} e - 键盘事件对象
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

首先使用了 `resolveInputAction` 方法解析按键的行为：

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

然后就是关键，使用 `dispatchInput` 映射输入，执行按键的操作：

```js
import InputRoutes from '@/lib/input/input-actions-map.js';
import { hasBlockingAnimation } from '@/lib/animations/system.js';
import consumeGlobalShortcut from '@/lib/input/actions/consume-global-shortcut.js';
import getGameStateMode from '@/lib/game/state/get-game-state-mode.js';

const dispatchInput = (event) => {
  const { action } = event;
  const mode = getGameStateMode();

  // 倒计时、升级，或者匹配不到按键行为
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

这里的关键使用 `InputRoutes` 根据游戏状态 `mode`，执行各个状态特有的动作：

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

这样我们就可以轻松的管理各个游戏状态的一系列动作：

![Tetris Code - v0.4.0 - actions](assets/img/code-v0.4.0-actions.png)

让我们看看 `main-menu` 状态的动作集：`mainMenuActions`

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

这样以后的 Replay、AI、Gamepad、Touch 都拥有了完全一致的输入执行流程，这也是整个 Runtime 最重要的一步。

## 第二次架构演进：Command Runtime（命令驱动运行时）+ Store（状态集中管理）

随着模块继续增加，新的问题又出现了。Renderer 需要读取状态、AI 需要读取状态、Replay 需要读取状态、动画也需要读取状态。

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

如果所有模块都能够修改数据，那么最终状态一定会越来越混乱。

### Store（状态集中管理）

于是，游戏状态开始集中管理。所有状态更新，统一经过 Runtime。其它模块只负责读取状态，或者响应状态变化。

从这一刻开始，游戏真正拥有了一套稳定的数据流。

![Tetris Code - v0.6.0](assets/img/code-v0.6.0.png)

以前都是直接操作有限状态的，还是拿之前的 `rotate` 方法：

```js
/**
 * # 旋转当前方块
 *
 * 对当前方块进行顺时针旋转（矩阵转置 + 反转） 旋转后若发生碰撞，则自动撤销旋转，保证游戏正常运行
 *
 * @function rotate
 * @returns {void}
 */
export const rotate = () => {
  // 保存旋转前的形状，用于碰撞后恢复
  const prev = gameState.curr.shape;

  // 顺时针旋转矩阵：转置 + 反转行
  gameState.curr.shape = prev[0].map((_, i) =>
    prev.map((r) => r[i]).toReversed(),
  );

  // 旋转后发生碰撞 → 恢复原状
  if (collision(0, 0)) {
    gameState.curr.shape = prev;
  } else {
    // 旋转成功 → 播放音效
    sounds.rotate();
  }
};
```

而调整架构后，都是用过 `GameStore` 处理：

```js
import BOARD from '@/lib/services/ui/constants/board.js';
import GameState from '@/lib/game/state/game-state.js';
import isFunction from '@/lib/utils/is-function.js';

/**
 * # 创建游戏状态存储（Game Store Factory）
 *
 * 一个基于闭包的轻量状态管理器，用于管理游戏运行时状态。
 *
 * 特点：
 *
 * - 使用闭包封装 state（避免全局污染）
 * - 提供基础 get / set API
 * - 支持 patch 更新模式
 * - 支持部分领域方法（board / hud / level 等）
 *
 * 设计定位：
 *
 * - 非 Redux / 非 Zustand
 * - 轻量 game state container
 * - 专为 Tetris Engine 设计
 *
 * @param {object} [initialState=GameState] - 可选初始状态（用于重置或测试）. Default is
 *   `GameState`
 * @returns {object} Store API
 */
const createGameStore = (initialState) => {
  /**
   * # 内部状态对象
   *
   * 使用 structuredClone 保证初始状态隔离
   */
  let state = {
    ...structuredClone(initialState || GameState),
    nextSequence: [],
  };

  return {
    /**
     * ## 获取完整 state
     *
     * @returns {object} 当前游戏状态
     */
    getState: () => state,

    /**
     * ## 更新 state（支持 patch 或函数）
     *
     * 支持两种模式：
     *
     * 1. Object patch
     * 2. Function (prevState) => patch
     *
     * @param {object | Function} patch - 状态更新内容或函数
     */
    setState: (patch) => {
      state = {
        ...state,
        ...(isFunction(patch) ? patch(state) : patch),
      };
    },

    /**
     * ## 重置棋盘
     *
     * 根据 BOARD 常量重新生成空棋盘
     */
    resetBoard: () => {
      const { COLS, ROWS } = BOARD;

      // 创建 ROWS x COLS 的二维数组（初始值为 0，表示空格）
      state.board = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }).fill(0),
      );
    },

    /**
     * ## 获取已消除行数（baseLines）
     *
     * @returns {number} - 返回基础行数
     */
    getBaseLines: () => state.baseLines,

    /**
     * ## 设置基础行数
     *
     * @param {number} lines - 基础行数
     */
    setBaseLines: (lines) => {
      state.baseLines = lines;
    },

    /**
     * ## 获取当前已消除行（findFullLines）
     *
     * @returns {object[]} - 返回清理的行数数据
     */
    getClearLines: () => state.clearLines,

    /**
     * ## 设置当前消除行
     *
     * @param {number[]} lines - 消除行数组
     */
    setClearLines: (lines) => {
      state.clearLines = lines;
    },

    /**
     * ## 获取 HUD 数据
     *
     * 返回 UI 渲染所需的核心数据
     *
     * @returns {object} HUD 数据
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
     * ## 设置 HUD 数据
     *
     * @param {object} hud - HUD 数据对象
     */
    setHud: (hud) => {
      const { score, lines, level } = hud;

      state.score = score;
      state.lines = lines;
      state.level = level;
    },

    /**
     * ## 设置最高分
     *
     * @param {number} highScore - 历史最高分
     */
    setHighScore: (highScore) => {
      state.highScore = highScore;
    },

    /**
     * ## 获取最高分
     *
     * @returns {number} - 返回最高分数
     */
    getHighScore: () => state.highScore,

    /**
     * ## 获取当前等级
     *
     * @returns {number} - 放回当前等级
     */
    getLevel: () => state.level,

    /**
     * ## 设置当前等级
     *
     * @param {number} level - 当前等级
     */
    setLevel: (level) => {
      state.level = level;
    },

    /**
     * ## 获取游戏模式
     *
     * @returns {string} 当前模式（main-menu / playing / paused / game-over）
     */
    getMode: () => state.mode,

    /**
     * ## 设置游戏模式
     *
     * @param {string} mode - 游戏模式
     */
    setMode: (mode) => {
      state.mode = mode;
    },
  };
};

export default createGameStore;
```

此时只需要在 `Game` 模块中创建 `store`：

```js
const Game = {
  // 游戏状态
  store: createGameStore(),
  // 省略...
}
```

然后再需要操作有戏状态信息的时候，就都通过 `store` 统一管理了。还是以 `rotate` 方法的改变：

```js
import Audio from '@/lib/services/audio';
import Game from '@/lib/game';
import collision from '@/lib/game/logic/collision.js';

/**
 * # 旋转当前方块
 *
 * 对当前方块进行顺时针旋转（矩阵转置 + 反转） 旋转后若发生碰撞，则自动撤销旋转，保证游戏正常运行
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
  // 保存旋转前的形状，用于碰撞后恢复
  const prev = curr.shape;

  // 顺时针旋转矩阵：转置 + 反转行
  currentShape.shape = prev[0].map((_, i) =>
    prev.map((r) => r[i]).toReversed(),
  );

  store.setState({
    curr: currentShape,
  });

  // 旋转后发生碰撞 → 恢复原状
  if (collision(0, 0)) {
    currentShape.shape = prev;
    store.setState({
      curr: currentShape,
    });
  } else {
    // 旋转成功 → 播放音效
    Audio.Sounds.rotate();
  }
};

export default rotate;
```

### Command Runtime（命令驱动运行时）

虽然 `Store` 统一的游戏状态的关联，但这是还有一个大问题所有模块都依赖游戏逻辑，所有模块也都需要知道什么时候播放音效、什么时候更新动画、什么时候刷新界面。

随着功能不断增加，模块之间的耦合越来越严重，维护成本也越来越高。为了解决这个问题，项目进行了另外一个架构升级。 这一次并不是继续增加新的工具函数，而是重新设计了整个 Runtime 的数据流。

所有输入不再直接调用游戏逻辑，它们首先会被转换成 **Command（命令）**。例如：

```text
MOVE_LEFT
MOVE_RIGHT
ROTATE
DROP
RESTART
QUIT
```

随后，这些 Command 不会立即执行，而是统一进入 **Command Queue（命令队列）**。整个执行流程变成：

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

从这一刻开始，所有模块都不再直接修改游戏。它们唯一能够做的事情，就是提交 Command。真正执行 Command 的，只剩下 Runtime。

### 为什么需要 Command？

Command 最大的作用，并不是把 `move()` 包装成一个对象。真正重要的是：**把"玩家想做什么"和"游戏如何执行"彻底分离**。

例如以前 Keyboard 会直接调用：

```js
move(-1, 0);
```

现在 Keyboard 只需要提交：

```text
MOVE_LEFT
```

来看看改变：

```js
import Engine from '@/lib/engine';
import Command from '@/lib/core/command/command.js';
import CommandQueue from '@/lib/core/command/command-queue.js';
import Replay from '@/lib/runtime/replay-runtime.js';
import EventBus from '@/lib/core/event-bus';

/**
 * # 输入分发器（Input Dispatcher）
 *
 * 职责：
 *
 * - 接收输入 action
 * - 转换为 Command
 * - 入队执行
 * - 记录 replay（如开启）
 *
 * @function dispatchInput
 * @param {object} input - 输入信息
 * @param {string} input.action - 输入动作类型
 * @returns {void}
 */
const dispatchInput = (input) => {
  const { action, payload } = input;

  /**
   * ======== 输入拦截层 ======== 在关键动画期间禁止输入：
   *
   * - Countdown（倒计时）
   * - Level-up（升级动画）
   */
  const hasBlocking = Engine.Animations.hasBlocking(['countdown', 'level-up']);

  if (hasBlocking || !action) {
    return;
  }

  /** ======== Command 构建 ======== */
  const cmd = new Command(action, payload);

  /** ======== 入队执行 ======== */
  CommandQueue.enqueue(cmd);

  /**
   * ======== Replay 记录层 ========
   *
   * 这里属于 side-effect，但暂时保留在 dispatcher
   */
  if (Replay.recording) {
    EventBus.emit('replay:record', {
      // 扣除暂停时间，得到纯净的“游玩时长”  - Replay.totalPausedDuration
      ms: Engine.timestamp - Replay.startTime,
      cmd,
    });
  }
};

export default dispatchInput;
```

至于：

* 是否允许移动？
* 当前是不是暂停？
* 当前是不是 Game Over？
* 当前有没有动画阻塞？
* 是否需要播放音效？
* 是否需要记录 Replay？

这些都交给 Runtime 统一决定，输入模块完全不知道游戏内部是如何工作的。

### 为什么还需要 Command Queue？

很多人第一次接触 Command 时都会产生一个疑问：既然已经有 Command，为什么还需要 Queue？

为什么不直接：

```js
command.execute();
```

答案是：**所有命令，都应该在 Game Loop 中统一执行**。例如这一帧：

```text
Keyboard
    │
    ├── MOVE_LEFT
    ├── ROTATE
    └── DROP
```

如果事件发生时立即执行，那么：

* Keyboard
* Replay
* AI
* Gamepad
* Battle

都会在不同时间修改游戏状态，这样不仅难以维护，也无法保证每一帧的数据一致性。加入 Command Queue 后，整个流程变成：

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

所有输入都会等待下一次 Tick，然后按照进入队列的顺序（FIFO）依次执行。看看 Command Queue 的实现：

```js
/**
 * # 命令队列（Command Queue）
 *
 * 用于缓存所有待执行的 Command， 并在合适的时机（通常是 game tick / frame）统一执行。
 *
 * 典型用途：
 *
 * - Input buffering（输入缓存）
 * - Replay playback（回放）
 * - AI decision batching（AI 批处理）
 *
 * 设计特点：
 *
 * - FIFO 队列（先进先出）
 * - Flush() 会一次性执行所有命令
 */
const CommandQueue = {
  /**
   * ## 命令队列（FIFO）
   *
   * @type {object[]}
   */
  queue: [],

  /**
   * ## 入队一个 Command
   *
   * @param {object} command - 要执行的命令
   */
  enqueue(command) {
    this.queue.push(command);
  },

  /**
   * ## 执行并清空队列中的所有 Command
   *
   * 当前行为：
   *
   * - 一次性执行全部 command
   * - 不做时间分帧控制
   *
   * @param {object} context - 执行上下文
   */
  flush(context) {
    const { queue } = this;

    while (queue.length > 0) {
      const cmd = queue.shift();
      cmd.execute(context);
    }
  },

  /** ## 清空队列（丢弃所有未执行命令） */
  clear() {
    this.queue.length = 0;
  },
};

export default CommandQueue;
```

通过 `CommandQueue` 的 `flush` 方法实现顺序（FIFO）依次执行。这样带来了三个非常重要的好处：

* 保证所有输入拥有一致的执行顺序；
* 保证所有状态更新发生在 Game Loop 内部；
* 保证所有输入来源（Keyboard、Replay、AI、Gamepad）拥有完全一致的执行流程；

另外需要注意：`command.execute()`。

```js
import Engine from '@/lib/engine';

/**
 * # 通用命令（Command）封装类
 *
 * 用于表示一个“可执行的游戏操作”，例如：
 *
 * - MOVE
 * - ROTATE
 * - DROP
 * - START_GAME
 *
 * 设计理念：
 *
 * - Input → Command → Index 执行
 * - 支持 Replay / AI / Macro
 *
 * 关键原则： Command 本身不包含业务逻辑，只描述“发生了什么”
 */
class Command {
  /**
   * ## 创建一个命令实例
   *
   * @param {string} action - 命令类型（如 MOVE / ROTATE）
   * @param {object} [payload={}] - 命令参数（如方向、等级等）. Default is `{}`
   */
  constructor(action, payload = {}) {
    this.action = action;
    this.payload = payload;
  }

  /**
   * ## 执行命令
   *
   * 将命令交给统一的 dispatch 系统处理， 而不是在 Command 内部写逻辑。
   *
   * @param {object} context - 执行上下文
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

这里我们有引入了 `dispatchCommand`：

```js
import MAIN_MENU_ACTIONS from '@/lib/game/actions/main-menu-actions.js';
import GAME_PLAYING_ACTIONS from '@/lib/game/actions/game-playing-actions.js';
import PAUSED_ACTIONS from '@/lib/game/actions/paused-actions.js';
import GAME_OVER_ACTIONS from '@/lib/game/actions/game-over-actions.js';
import REPLAY_ACTIONS from '@/lib/game/actions/replay-actions.js';

/**
 * # 状态 -> Action 映射表
 *
 * 根据 engine 当前 mode，选择不同的 action handler 集合
 *
 * 设计模式：
 *
 * - State Machine Router
 * - Command Dispatcher
 *
 * 核心职责：
 *
 * - 不执行逻辑
 * - 只负责“路由 + 分发”
 */
const ACTIONS_MAP = {
  'main-menu': MAIN_MENU_ACTIONS,
  playing: GAME_PLAYING_ACTIONS,
  paused: PAUSED_ACTIONS,
  'game-over': GAME_OVER_ACTIONS,
  replay: REPLAY_ACTIONS,
};

/**
 * # Command 分发器
 *
 * 将 Command 根据当前游戏状态（mode） 路由到对应 action handler 执行
 *
 * @param {object} cmd - 要执行的命令
 * @param {object} context - 游戏引擎实例
 */
const dispatchCommand = (cmd, context) => {
  const { action, payload } = cmd;
  const { Game, Audio } = context;

  // 当前游戏状态（FSM state）
  const mode = Game.store.getMode();

  // 获取当前 mode 对应的 action 集合
  const actions = ACTIONS_MAP[mode];

  // 如果当前状态没有定义 actions，直接忽略
  if (!actions) {
    return;
  }

  // 根据 command action 找到对应 handler
  const handler = actions[action];

  // 执行 handler（如果存在）
  handler?.(payload, { Game, Audio });
};

export default dispatchCommand;
```

将原本在 `dispatchInupt` 中执行的 `actions`，转移到 `dispatchCommand` 这里在执行。此时 Runtime 终于拥有了一条稳定、可预测的命令执行流。

## 第三次架构演进：Scheduler

后来，越来越多异步行为出现。例如：

- 动画
- 消行动画
- 音效播放
- 倒计时
- 延迟任务

如果继续大量使用：

```
setTimeout()

setInterval()
```

不同系统之间就很容易出现节奏不一致的问题。于是，项目增加了 Scheduler。

所有需要"等待"的事情，都交给 Scheduler 统一调度。从此，动画、音效、Runtime 开始共享同一套时间轴。

## 第四次架构演进：Replay

当 Runtime 保证了状态更新的确定性之后。Replay 也变得简单起来。Replay 不再保存棋盘。也不录制视频。

它只保存：

```
Command
```

因为，Runtime 保证：

```
相同输入
↓
相同状态变化
↓
相同结果
```

Replay 因此拥有极小的数据量。同时能够完整重现整局游戏。

## 第五次架构演进：AI

AI 是整个项目演进过程中最复杂的一步。如果 AI 直接修改真实棋盘。 那么：

- Replay 将失效；
- Battle 会变得复杂；
- 调试也会越来越困难；

因此，AI 被设计成只负责思考。真正执行操作的，依然是 Runtime。AI 完成搜索以后。最终仍然只提交：`Command`。AI 与玩家，真正共享了一套游戏规则。

## 架构从来不是最终目标

直到今天，Replay、Battle、AI、Gamepad、Scheduler、Renderer、Audio、这些模块都建立在同一套 Runtime 之上。

它们并不是独立开发出来的功能。而是在统一架构下自然演进出来的能力。这也是 tetris.js 最希望表达的设计思想。

> 好的架构，并不是为了展示设计技巧。而是能够在项目不断成长的过程中，让新的能力持续生长，而不用一次又一次推倒重来。

## 下一步阅读

这一章介绍了整个项目的架构演进过程。下一章将真正进入 Runtime。了解：

- Runtime 如何工作？
- Game Loop 如何组织整个系统？
- Command 如何驱动所有模块？
- Scheduler 又是如何融入整个运行时？

**下一章：[03-runtime.md](./03-runtime.md)**
