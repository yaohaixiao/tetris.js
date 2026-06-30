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


## 架构演进：dispatchInput（映射输入）

随着增加更多（按键）输入控制逻辑，项目开始进行第一次比较大的调整，启用输入映射：**`dispatchInput`，解耦按键与游戏控制逻辑**。

![Tetris Code - v0.3.1](assets/img/code-v0.3.1.png)

### 以前的方式

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

可以看到，随着游戏功能越来越负责，游戏状态越来越多，游戏逻辑也越来越多，这个事件处理函数将臃肿不堪，且很难测试和维护。

### dispatchInput（映射输入）

为解决按键和不通过状态不断增加带来的问题，于是采用了**映射输入（dispatchInput）**来解决问题。

看看 `dispatchInput` 带来的改变吧：

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

这里的关键是使用 `InputRoutes` 根据游戏状态 `mode`，执行各个状态特有的动作：

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

这样就可以轻松的管理各个游戏状态的一系列动作，并且按错键对应不上当前游戏状态也无任何副作用：

![Tetris Code - v0.4.0 - actions](assets/img/code-v0.4.0-actions.png)

再看看 `main-menu` 状态的动作集：`mainMenuActions`

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

## 架构演进：Store（状态集中管理）

随着模块继续增加，新的问题又出现了。Renderer 需要读取状态、AI 需要读取状态、Replay 需要读取状态、动画也需要读取状态。

### 以前的方式

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

## 架构演进：Command Runtime（命令驱动运行时）

虽然 `Store` 统一的游戏状态的关联，但这是还有一个大问题所有模块都依赖游戏逻辑，所有模块也都需要知道什么时候播放音效、什么时候更新动画、什么时候刷新界面。

### 以前的方式

还是以升级前的 `dispatchInput` 来说：

```js
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
```

匹配处理函数后，就直接执行了，没有顺序控制，也不知道有序如何执行。

### 为什么需要 Command？

Command 最大的作用，并不是把 `move()` 包装成一个对象。真正重要的是：**把"玩家想做什么"和"游戏如何执行"彻底分离**。

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

从这一刻开始，所有模块都不再直接修改游戏。例如以前 Keyboard 会直接调用：`move(-1, 0);`。调整后 Keyboard 唯一能够做的事情，就是提交 Command。真正执行 Command 的，只剩下 Runtime。

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

很多人第一次接触 Command 时都会产生一个疑问：既然已经有 Command，为什么还需要 Queue？为什么不直接：`command.execute();`？

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

### 当前的架构

看看使用 Store + Command Runtime 架构升级后的架构图（Data Flow）：

![Tetris Data Flow - v0.6.0](assets/img/data-flow-v0.6.0.png)

## 架构演进：Scheduler

随着项目不断扩展，越来越多的功能开始依赖"时间"。例如：

- 动画播放
- 消行动画
- 音效播放
- 倒计时
- 延迟任务
- AI 思考延迟
- Battle 垃圾行延迟

项目初期，这些需求都可以直接通过浏览器提供的：

```js
setTimeout();
setInterval();
```

### 以前的实现

来看看架构演进前的典型案例 Audio 模块的实现：

```js
import GameState from '@/lib/game/state/game-state.js';
import playTone from '@/lib/audio/play-tone.js';

/**
 * # 背景音乐 BGM 自动循环播放
 *
 * 递归遍历音符数组，循环播放背景音乐旋律
 *
 * @function loopPlayBGM
 * @param {number} i - 当前播放的音符索引
 * @param {number[]} m - 音符频率数组
 * @returns {void}
 */
const loopPlayBGM = (i, m) => {
  // 如果索引超出音符长度，重置为 0，实现循环播放
  if (i >= m.length) {
    i = 0;
  }

  // 播放当前音符（低音量，BGM 背景音）
  playTone(m[i], 110, 0.05);

  // 延迟后播放下一个音符，形成连续 BGM 旋律
  GameState.bgmTimer = setTimeout(() => {
    loopPlayBGM(i + 1, m);
  }, 130);
};

export default loopPlayBGM;

```

```js
const audioCtx = new AudioContext();

/**
 * # 音频振荡器波形类型（等同于原生 OscillatorType）
 *
 * @typedef {'sine' | 'square' | 'triangle' | 'sawtooth'} OscillatorType
 */

/**
 * # 播放电子音调（用于游戏音效）
 *
 * 创建振荡器生成指定频率、时长、音量和波形的音频
 *
 * @function playTone
 * @param {number} freq - 音调频率（赫兹 Hz）
 * @param {number} dur - 持续时间（毫秒 ms）
 * @param {number} [vol=0.1] - 音量大小，默认 0.1. Default is `0.1`
 * @param {OscillatorType} [wave='square'] - 波形类型，默认 square（方波，适合复古游戏）. Default
 *   is `'square'`
 * @returns {void}
 */
const playTone = (freq, dur, vol = 0.1, wave = 'square') => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = wave;
  osc.frequency.value = freq;
  gain.gain.value = vol;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  // 到达指定时长后停止发声
  setTimeout(() => {
    osc.stop();
  }, dur);
};

export default playTone;
```

对于一个简单的游戏来说，这样完全没有问题。但随着功能越来越多一个新的问题开始出现：**时间开始变得不一致**。

### 时间开始变得不一致

每个模块都维护着自己的 Timer。例如之前的 Audio 模块就是使用的 `setTimeout()`，来看看当时游戏的主循环 **Game Loop**：

```js
import EngineState from '@/lib/engine/state/engine-state.js';
import { updateAnimations, renderAnimations } from '@/lib/animations/system.js';
import getSpeed from '@/lib/game/logic/get-speed.js';
import stepGame from '@/lib/game/core/step-game.js';
import renderScene from '@/lib/ui/render-scene.js';

/**
 * # 带速度控制的游戏主循环
 *
 * 只有达到指定时间间隔才执行下落逻辑
 *
 * @function startGameLoop
 * @param {number} timestamp - 时间戳数值
 * @returns {void}
 */
const startGameLoop = (timestamp) => {
  if (!EngineState.timestamp) {
    EngineState.timestamp = timestamp;
  }

  const delta = (timestamp - EngineState.timestamp) / 1000;
  EngineState.timestamp = timestamp;

  // 1. 更新动画（每帧）
  updateAnimations(delta);

  // 获取当前等级的下落间隔（毫秒）
  const dropInterval = getSpeed();

  if (
    !EngineState.accumulator ||
    timestamp - EngineState.accumulator > dropInterval
  ) {
    // 执行真正的游戏逻辑（下落/碰撞/渲染）
    stepGame();
    EngineState.accumulator = timestamp;
  }

  // 3. 渲染
  renderScene();
  // 叠加动画
  renderAnimations();

  // 继续下一帧
  EngineState.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
```

Game Loop 采用是（标准的）requestAnimationFrame，游戏的动画特效和方块绘制都是靠 Game Loop 驱动的。但实际上之前的动画也是 `setTimeout()` 驱动的，就是开始的 Countdown 动画（当然这也是纯实现功能的处理办法）。

虽然统一了游戏动画和游戏界面的绘制通过 Game Loop 统一了，但 Audio 和 Game Loop 还是相互独立的。而即便是 Audio 模块内部，采用 `setTimeout()` 也不好保证音频的播放效果，特别是 Audio 的 Sounds 音效子模块：

```js
import playTone from '@/lib/audio/play-tone.js';

/**
 * # 游戏音效集合
 *
 * 统一管理所有 Tetris 游戏音效，基于 Web Audio 播放
 *
 * @typedef {object} GameSounds
 * @property {Function} levelSelect - 等级选择音效
 * @property {Function} levelStart - 等级开始音效
 * @property {Function} countdown - 开始倒计时音效
 * @property {Function} move - 方块移动音效
 * @property {Function} rotate - 方块旋转音效
 * @property {Function} drop - 方块快速下落音效
 * @property {Function} fall - 方块落地音效
 * @property {Function} clear - 方块消除音效
 * @property {Function} levelUp - 升级庆祝音效
 * @property {Function} pause - 暂停游戏音效
 * @property {Function} secondTick - 秒针走动音效
 * @property {Function} resume - 恢复游戏音效
 * @property {Function} gameOver - 游戏结束音效（降调）
 * @property {Function} bgmToggle - 背景音乐开关音效
 */

/**
 * # 全局游戏音效对象
 *
 * @type {GameSounds}
 */
const Sounds = {
  // 等级选择音效（正弦波柔和音效）
  levelSelect: () => playTone(523, 80, 0.1, 'sine'),
  // 等级开始音效
  levelStart: () => playTone(1319, 160, 0.22, 'sine'),
  // 开始倒计时音效
  countdown: () => playTone(784, 180, 0.3, 'sine'),
  // 方块移动音效
  move: () => playTone(330, 60),
  // 方块旋转音效
  rotate: () => playTone(440, 60),
  // 方块快速下落音效
  drop: () => playTone(220, 100),
  // 方块落地音效
  fall: () => playTone(180, 200),
  // 方块消除音效（三连音旋律）
  clear: () => {
    playTone(587, 220, 0.35, 'square');
    setTimeout(() => playTone(698, 260, 0.32, 'square'), 160);
    setTimeout(() => playTone(880, 300, 0.3, 'square'), 320);
    setTimeout(() => playTone(1174, 380, 0.25, 'square'), 480);
  },
  // 升级庆祝音效
  levelUp: () => {
    playTone(523, 220);
    setTimeout(() => playTone(587, 220), 260);
    setTimeout(() => playTone(659, 240), 520);
    setTimeout(() => playTone(784, 260), 780);
    setTimeout(() => playTone(880, 280), 1060);
    setTimeout(() => playTone(1047, 320), 1360);
    setTimeout(() => playTone(1175, 360), 1700);
    setTimeout(() => playTone(1319, 480), 2080);
  },
  // 暂停游戏音效
  pause: () => playTone(300, 150),
  // 秒针走动音效
  secondTick: () => playTone(880, 50, 0.085, 'sine'),
  // 恢复游戏音效
  resume: () => playTone(400, 150),
  // 游戏结束音效（悲伤旋律）
  gameOver: () => {
    playTone(330, 200);
    setTimeout(() => playTone(294, 300), 210);
    setTimeout(() => playTone(262, 500), 520);
  },
  // 背景音乐开关音效
  bgmToggle: () => playTone(440, 100),
};

export default Sounds;
```

特别是例如 `levelUp` 之类的多音频的音效，它们并不知道彼此什么时候开始，也不知道游戏当前是否已经暂停，更无法保证与 Runtime 保持一致。问题并不在于 `setTimeout()` 本身，而在于整个项目已经不存在统一的时间管理。

### 为什么需要 Scheduler？

项目真正需要的，并不是更多的 Timer，而是一套统一任务管理时间的机制。因此引入了 Scheduler，Scheduler 不关心具体执行什么任务。它只负责：

- 什么时候执行；
- 是否需要延迟；
- 是否可以取消；
- 是否应该暂停；
- 是否跟随 Runtime 一起继续运行。

所有需要"等待"的行为，都统一交由 Scheduler 调度。

### Scheduler 带来的变化

引入 Scheduler 后，整个项目开始共享同一套时间轴。无论是动画、音效、还是后来实现的 Replay、AI、或者 Battle。都不再直接管理自己的 Timer 或者 requestAnimationFrame，而是通过 Scheduler 完成统一调度。

#### Scheduler 改造后的模块

先来看看 Audio 的 `loopPlayBGM` 改变：

```js
import playTone from '@/lib/services/audio/play-tone.js';

/**
 * ## 调度器每次向前看的提前量（秒）
 *
 * 调度器会提前将未来这段时间内的所有音符排入 Web Audio 时间线， 利用 AudioContext 的高精度时钟保证节奏稳定，
 * 同时用较短的提前量降低延迟感。
 *
 * @constant {number}
 */
const SCHEDULE_AHEAD_TIME = 0.12;

/**
 * ## 调度器检查间隔（毫秒）
 *
 * Scheduler.interval 的复发间隔。值越小调度越密集、越跟手， 但 CPU 唤醒也更频繁。25ms 是在精度与开销之间的常用折中。
 *
 * @constant {number}
 */
const LOOKAHEAD = 25;

/**
 * # 循环播放背景音乐（BGM）
 *
 * 基于 **预调度 + Scheduler.interval 轮询** 的方式， 按旋律数组顺序持续播放音符，形成可无限循环的背景音乐。
 *
 * ## 工作原理
 *
 * 1. 维护一个虚拟指针 `currentNoteIndex` 指向当前音符， 以及一个"下一个音符应开始的时间" `nextNoteTime`（基于
 *    `AudioContext.currentTime`）。
 * 2. `scheduler()` 会检查 `nextNoteTime` 是否已经落入 `currentTime + SCHEDULE_AHEAD_TIME`
 *    的窗口内。
 * 3. 若已落入，则调用 `playTone()` 将该音符精确排入 Web Audio 时间线， 同时将 `nextNoteTime` 向后推进该音符的时长。
 * 4. 通过 `Scheduler.interval` 定期（每 `LOOKAHEAD` ms）触发 `scheduler()`， 持续滚动向前，直至被外部通过
 *    `stopBGM()` 清除。
 *
 * ## 设计特点
 *
 * - **时间精度**：音符起点由 `AudioContext` 时钟控制，不受 interval 抖动影响
 * - **简洁性**：无需 Web Worker，单线程即可运作
 * - **易停易启**：通过 `audio.bgmSchedulerId` 存放 interval ID，外部可直接取消
 * - **无缝循环**：旋律末尾自动回绕至开头（`% melody.length`）
 *
 * @example
 *   // 播放一首简单的旋律，循环
 *   loopPlayBGM(
 *     audio,
 *     [
 *       { freq: 440, dur: 1.0 },
 *       { freq: 880, dur: 2.0 },
 *       { freq: 0, dur: 0.5 }, // 休止符
 *     ],
 *     {
 *       duration: 200,
 *       volume: 0.08,
 *       wave: 'square',
 *       gate: 0.6,
 *     },
 *   );
 *
 * @function loopPlayBGM
 * @param {object} audio - Audio 对象实例（含 Scheduler 和 Context）
 * @param {{ freq: number; dur: number }[]} melody - 音符数组
 * @param {number} melody[].freq - 频率（Hz），`0` 表示休止符
 * @param {number} melody[].dur - 时长系数，实际时长 = dur × duration（毫秒）
 * @param {object} [options] - 播放选项
 * @param {number} [options.duration=110] - 基准时长（ms），一个 dur 单位对应的毫秒数. Default is
 *   `110`
 * @param {number} [options.volume=0.05] - 音量（0-1）. Default is `0.05`
 * @param {string} [options.wave='square'] - 波形类型（'sine' | 'square' | 'triangle'
 *   | 'sawtooth'）. Default is `'square'`
 * @param {number} [options.gate=1] - 发音占比（0-1），1 为连奏，小于 1 产生断奏间隙. Default is
 *   `1`
 * @param {object} [options.articulation={}] - 运音包络参数. Default is `{}`
 * @param {number} [options.articulation.attackTime=0.003] - 起音时间（秒）. Default is
 *   `0.003`
 * @param {number} [options.articulation.releaseTime=0.02] - 释音时间（秒）. Default is
 *   `0.02`
 * @param {number} [options.articulation.sustainRatio=0.9] - 延音比（0-1）. Default
 *   is `0.9`
 * @returns {void}
 */
const loopPlayBGM = (audio, melody, options = {}) => {
  // 解构播放选项
  const {
    duration = 110,
    volume = 0.05,
    wave = 'square',
    gate = 1,
    articulation = {},
  } = options;

  // 无效参数保护
  if (duration <= 0 || !melody?.length) {
    return;
  }

  const { Scheduler, Context } = audio;

  // 确保 AudioContext 处于运行状态
  if (Context.state === 'suspended') {
    Context.resume();
  }

  /** ## 当前播放到的音符索引 */
  let currentNoteIndex = 0;

  /** ## 下一个音符应开始的时间（基于 AudioContext 时钟） */
  let nextNoteTime = Context.currentTime;

  /**
   * ## 调度单个音符
   *
   * 将指定音符排入 Web Audio 时间线在精确时刻播放。
   *
   * @param {object} note - 音符对象
   * @param {number} note.freq - 频率（Hz）
   * @param {number} note.dur - 时长系数
   * @param {number} time - 开始播放的时间（基于 AudioContext.currentTime）
   */
  const scheduleNote = (note, time) => {
    // 计算实际时长（毫秒）
    const stepDur = note.dur * duration;

    // 频率大于 0 才播放（0 为休止符）
    if (note.freq > 0) {
      playTone(audio, note.freq, stepDur, {
        volume,
        wave,
        gate,
        articulation,
        startTime: time,
      });
    }
  };

  /**
   * ## 调度器
   *
   * 定期被 Scheduler.interval 调用，持续将未来的音符排入时间线。 这是 BGM 循环播放的核心驱动逻辑。
   */
  const scheduler = () => {
    const audioNow = Context.currentTime;

    // 调度窗口上限：当前时间 + 提前量
    const limit = audioNow + SCHEDULE_AHEAD_TIME;

    // 将所有落入窗口内的音符排入时间线
    while (nextNoteTime < limit) {
      const note = melody[currentNoteIndex];

      // 调度当前音符
      scheduleNote(note, nextNoteTime);

      // 计算该音符的实际时长（秒）
      const stepDur = note.dur * duration;

      // 推进下一个音符的播放时间
      nextNoteTime += stepDur / 1000;

      // 推进索引，到达末尾时回绕至开头（循环播放）
      currentNoteIndex = (currentNoteIndex + 1) % melody.length;
    }
  };

  // 使用 Scheduler.interval 启动调度器，每 LOOKAHEAD ms 检查一次
  audio.bgmSchedulerId = Scheduler.interval(scheduler, LOOKAHEAD);
};

export default loopPlayBGM;
```

`Sounds` 模块也变样了，这里只截取 `CLEAR` 和 `LEVEL_UP`：

```js
  CLEAR = (lines = 1, level = 1, isPerfectClear = false) => {
    // 根据等级选择方案（每 16 关一套）
    const setIndex = Math.min(Math.floor((level - 1) / 16), 15);
    const frequencies = CHORD_SETS[setIndex];
    const params = PARAM_SETS[setIndex];

    // 每个音轨的基础播放参数
    const speeds = [260, 300, 380];
    const volumes = [0.32, 0.3, 0.25];
    const timeouts = [160, 320, 480];

    // 获取当前音乐动机
    const motif = getMotif(lines, isPerfectClear);
    const cfg = MOTIFS[motif];

    // 安全索引（防止越界）
    const index = Math.min(lines, frequencies.length - 1);
    const baseChord = frequencies[index].filter((f) => f > 0);

    // 生成最终和弦：shift 控制整体音高偏移（半音单位 ×12）
    const chord = baseChord.map((freq) => freq + cfg.shift * 12);
    const queue = [];
    const { Context, Scheduler } = this;

    // 逐音轨构建播放序列
    for (const [i, freq] of chord.entries()) {
      queue.push({
        fn: () => {
          const now = Context.currentTime;
          playTone(this, freq, speeds[i] * cfg.speed * params.spdMul, {
            volume: volumes[i] * cfg.volume * params.volMul,
            wave: params.wave,
            startTime: now + timeouts[i] / 1000,
          });
        },
      });
    }

    // 按时间偏移顺序播放和弦
    Scheduler.sequence(queue);
  };

  /**
   * ## 升级庆祝音效
   *
   * 演奏上行音阶（C5 → E6），营造升级的成就感和喜悦情绪。 通过 Scheduler.sequence 按精确时间偏移依次触发。
   *
   * @returns {void}
   */
  LEVEL_UP = () => {
    const { Context, Scheduler } = this;
    const now = Context.currentTime;

    Scheduler.sequence([
      { fn: () => playTone(this, 523, 220) },
      { fn: () => playTone(this, 587, 220, { startTime: now + 0.26 }) },
      { fn: () => playTone(this, 659, 240, { startTime: now + 0.52 }) },
      {
        delay: 260,
        fn: () => playTone(this, 784, 260, { startTime: now + 0.78 }),
      },
      { fn: () => playTone(this, 880, 280, { startTime: now + 1.06 }) },
      { fn: () => playTone(this, 1047, 320, { startTime: now + 1.36 }) },
      { fn: () => playTone(this, 1175, 360, { startTime: now + 1.7 }) },
      { fn: () => playTone(this, 1319, 480, { startTime: now + 2.08 }) },
    ]);
  };
```

更关键的是 `playTone` 更是使用了精准的时间控制：

```js
import isNumber from '@/lib/utils/types/is-number.js';

/**
 * # 播放一个指定频率的音调（Tone）
 *
 * 基于 Web Audio API 创建一个 Oscillator（振荡器）来生成声音， 并通过 GainNode 控制音量，播放一段固定时长的音频。
 *
 * ## 包络设计
 *
 * 采用 Attack-Decay（AD）包络模拟运音效果：
 *
 * - **Attack 阶段**：音量从接近 0（MIN_GAIN）线性冲到 volume 峰值
 * - **Hold 阶段**：保持在 volume × sustainRatio 处，撑住音符主体
 * - **Decay 阶段**：以指数曲线衰减到接近 0（MIN_GAIN）
 * - **Release 缓冲**：osc.stop() 延迟 50ms 执行，确保波形在绝对静音后才被切断
 *
 * ## 音符时长控制
 *
 * 实际发声时长 = (dur / 1000) × gate 秒。 gate < 1 时人为制造音尾静音间隙，产生断奏（staccato）效果。
 *
 * ## 常用场景
 *
 * - 游戏音效（落块、消行、旋转）
 * - UI feedback（点击提示音）
 * - 背景音乐单音符渲染（配合调度器使用）
 *
 * ## 注意事项
 *
 * - AudioCtx 必须是已初始化的 AudioContext
 * - 在部分浏览器中需要用户交互后才能启动 audioCtx
 * - 函数结束后振荡器和增益节点会通过 'ended' 事件自动释放
 *
 * @example
 *   // 播放一个 440Hz、持续 200ms 的短音，使用正弦波、连奏
 *   playTone(440, 200, {
 *     volume: 0.1,
 *     wave: 'sine',
 *     gate: 1,
 *   });
 *
 * @example
 *   // 播放短促方波音效（断奏）
 *   playTone(880, 50, {
 *     volume: 0.12,
 *     wave: 'square',
 *     gate: 0.4,
 *     articulation: {
 *       attackTime: 0.001,
 *       releaseTime: 0.01,
 *       sustainRatio: 0.3,
 *     },
 *   });
 *
 * @function playTone
 * @param {object} audio - Audio 对象实例，需包含 Context 属性（AudioContext 实例）
 * @param {number} freq - 音频频率（Hz），例如 440 = A4 标准音，游戏常用范围 100~2000
 * @param {number} dur - 播放时长（毫秒），例如 100 = 0.1 秒
 * @param {object} [options] - 播放参数配置对象
 * @param {number} [options.volume=0.15] - 音量峰值（0~1），建议 0.1~0.3 避免爆音. Default is
 *   `0.15`
 * @param {string} [options.wave='square'] - 波形类型：'sine' | 'square' | 'sawtooth'
 *   | 'triangle' | 'custom'. Default is `'square'`
 * @param {number} [options.gate=1] - 音符时值占比（0~1），< 1 产生断奏效果. Default is `1`
 * @param {object} [options.articulation] - 运音包络参数
 * @param {number} [options.articulation.attackTime=0.003] - 起音时间（秒），3ms 快速起音.
 *   Default is `0.003`
 * @param {number} [options.articulation.releaseTime=0.02] - 释音时间（秒），20ms 平滑收尾.
 *   Default is `0.02`
 * @param {number} [options.articulation.sustainRatio=0.9] - 延音比，保持 90%
 *   峰值音量进入衰减段. Default is `0.9`
 * @param {number} [options.startTime] - 开始时间（秒），默认为 Context.currentTime
 * @returns {void}
 */
const playTone = (audio, freq, dur, options = {}) => {
  /* ========== 第一步：基础参数校验 ========== */

  /** 频率必须存在且为正数，时长必须大于 0 如果参数无效则静默退出，避免创建无效的音频节点 */
  if (!freq || dur <= 0) {
    return;
  }

  // 从 audio 对象中解构出 AudioContext 实例
  const { Context } = audio;

  /* ========== 第二步：解构播放参数并设置默认值 ========== */

  const {
    volume = 0.15, // 音量峰值，默认 15%
    wave = 'square', // 波形类型，默认方波（音色较硬，适合游戏音效）
    gate = 1, // 时值占比，1 = 连奏（音符唱满）
    articulation = {}, // 运音包络参数，详见下方解构
    startTime = Context.currentTime, // 开始时间，默认立即播放
  } = options;

  /* ========== 第三步：创建音频节点 ========== */

  /** OscillatorNode（振荡器节点） 负责生成原始波形信号，是声音的"音源" */
  const osc = Context.createOscillator();

  /** GainNode（增益节点） 控制音量大小，相当于"音量旋钮" */
  const gain = Context.createGain();

  /* ========== 第四步：配置振荡器参数 ========== */

  // 设置波形类型（决定音色）
  osc.type = wave;

  /** 在指定时间点设置频率值 setValueAtTime 是精确时间调度方法，确保频率在正确的时间点生效 */
  osc.frequency.setValueAtTime(freq, startTime);

  /* ========== 第五步：计算音符的实际发声时长 ========== */

  /**
   * Step: 将毫秒转换为秒 noteLen: 实际发声时长 = 标称时长 × 门限比例
   *
   * 例如：dur=200ms, gate=0.5 → 实际发声 100ms，后 100ms 为静音间隙 这种断奏效果在快节奏音乐中能增加清晰度
   */
  const step = dur / 1000; // 标称时长（秒）
  const noteLen = step * gate; // 实际发声时长（秒）

  /* ========== 第六步：解构运音包络参数 ========== */

  const {
    attackTime = 0.003, // 起音时间：从触发到达到峰值的时间（秒）
    releaseTime = 0.02, // 释音时间：从开始衰减到归零的时间（秒）
    sustainRatio = 0.9, // 延音比：峰值音量在 hold 阶段的保持比例
  } = articulation;

  /* ========== 第七步：计算包络的关键时间节点 ========== */

  /**
   * 包络时间轴：
   *
   * T0 t1 t2 t3 |─────────|───────────────|───────────────| Start Attack 结束
   * Hold 结束 音符结束 (0) (峰值) (延音) (归零)
   *
   * T0 → t1: Attack 阶段（线性上升） t1 → t2: Hold 阶段（保持延音） t2 → t3: Decay 阶段（指数衰减）
   */

  const t0 = startTime; // 音符起始时间
  const t1 = t0 + attackTime; // Attack 结束时间
  const t2 = t0 + Math.max(noteLen - releaseTime, attackTime); // 开始衰减时间
  const t3 = t0 + noteLen; // 音符结束时间（归零）

  /* ========== 第八步：定义增益常量并校验参数 ========== */

  /**
   * MIN_GAIN: 最小增益值（接近 0 但不为 0）
   *
   * 为什么不直接用 0？
   *
   * 1. ExponentialRampToValueAtTime 要求目标值 > 0
   * 2. 从 0 开始指数衰减会导致 NaN（数学上 log(0) 无定义）
   * 3. 人耳几乎听不到 -80dB 以下的声音（MIN_GAIN ≈ -100dB）
   *
   * 使用数字分隔符（_）提高可读性：一眼看出是 5 个零加 1
   */
  const MIN_GAIN = 0.0001;

  /** 安全音量值：确保 volume 是有效的正数 使用 isNumber 工具函数 + Number.isFinite 双重校验 */
  const safeVolume = isNumber(volume) && volume > 0 ? volume : 0.15;

  /**
   * 安全延音比：确保 sustainRatio 是有效的正数 注意：这里误用了 isNumber(volume)，应该是
   * isNumber(sustainRatio)
   */
  const safeSustainRatio =
    isNumber(sustainRatio) && sustainRatio > 0 ? sustainRatio : 0.9;

  /** 再次验证频率是否有效（虽然开头已经校验过，但二次确认更安全） 防止传入 Infinity 或 NaN 导致 Web Audio API 报错 */
  if (!Number.isFinite(freq) || freq <= 0) {
    return;
  }

  /* ========== 第九步：设置增益包络（音量自动化） ========== */

  /** 在起始时间点将增益设置为 MIN_GAIN 这个值足够小，人耳听不到，但避免了从 0 开始的数学问题 */
  gain.gain.setValueAtTime(MIN_GAIN, t0);

  /**
   * Attack 阶段：从 MIN_GAIN 线性上升到峰值音量 linearRampToValueAtTime 会在指定时间内平滑过渡到目标值
   * 线性插值适合 Attack 阶段，能产生自然的音头冲击感
   */
  gain.gain.linearRampToValueAtTime(safeVolume, t1);

  /**
   * 计算延音电平值 例如：volume=0.15, sustainRatio=0.9 → sustainLevel=0.135 意味着在 Hold
   * 阶段音量略微降低，模拟真实乐器的自然衰减
   */
  const sustainLevel = safeVolume * safeSustainRatio;

  /** 在 t2 时刻到达延音电平 检查 sustainLevel 是否有效，无效则回退到 MIN_GAIN */
  if (!Number.isFinite(sustainLevel) || sustainLevel <= 0) {
    gain.gain.linearRampToValueAtTime(MIN_GAIN, t2);
  } else {
    gain.gain.linearRampToValueAtTime(sustainLevel, t2);
  }

  /* ========== 第十步：执行指数衰减（Decay 阶段） ========== */

  /**
   * 为什么用指数衰减？ 真实乐器的自然衰减呈指数曲线，比线性衰减更自然
   *
   * 为什么可能失败？
   *
   * 1. 起始值或目标值为 0 或负数
   * 2. 起始值和目标值符号不同
   * 3. 时间参数无效（如 t3 <= t2）
   *
   * 解决方案：
   *
   * 1. CancelScheduledValues 清除之前的调度，避免冲突
   * 2. 显式 setValueAtTime 确保起始值正确
   * 3. Try-catch 捕获异常，降级为线性衰减
   */
  try {
    /** 取消 t2 时间点之后的所有已调度事件 防止之前的 ramp 事件干扰新的指数衰减 */
    gain.gain.cancelScheduledValues(t2);

    /** 在 t2 时间点显式设置增益值 确保指数衰减的起始值是明确的 */
    const startGain = sustainLevel > 0 ? sustainLevel : MIN_GAIN;
    gain.gain.setValueAtTime(startGain, t2);

    /** 执行指数衰减到 MIN_GAIN 这是最自然的音量衰减方式 */
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, t3);
  } catch {
    /**
     * 降级方案：如果指数衰减失败，使用线性衰减 线性衰减虽然不那么自然，但能保证不报错
     *
     * 可能失败的情况：
     *
     * - 浏览器不支持（极罕见）
     * - 起始值/目标值不合规（虽然我们已经做了校验）
     */
    gain.gain.linearRampToValueAtTime(MIN_GAIN, t3);
  }

  /* ========== 第十一步：连接音频节点链路 ========== */

  /**
   * 音频信号流： Oscillator (音源) → Gain (音量控制) → Destination (扬声器)
   *
   * 必须按这个顺序连接，否则听不到声音
   */
  osc.connect(gain);
  gain.connect(Context.destination);

  /* ========== 第十二步：启动和停止振荡器 ========== */

  /** 在 t0 时刻开始发声 start() 可以精确调度，不传参则立即开始 */
  osc.start(t0);

  /**
   * 在包络完全归零后延迟 50ms 停止振荡器
   *
   * 为什么要延迟？
   *
   * 1. 避免波形在非零位置被截断，产生"噗噗"的爆破音
   * 2. 给指数衰减足够的时间到达 MIN_GAIN
   * 3. 50ms 的缓冲足以让增益值低到人耳听不见
   *
   * 此时振荡器虽然还在运行，但增益已接近 0，所以听不到声音
   */
  osc.stop(t3 + 0.05);

  /* ========== 第十三步：自动清理资源（防止内存泄漏） ========== */

  /**
   * 当振荡器停止后，触发 'ended' 事件 在此事件中断开所有音频节点的连接，释放资源
   *
   * 如果不做清理，随着播放次数增加，会积累大量无用节点 导致内存泄漏和性能下降
   */
  osc.addEventListener('ended', () => {
    /** Disconnect() 将节点从音频链路中移除 移除后节点不再处理音频信号，可以被垃圾回收 */
    osc.disconnect();
    gain.disconnect();
  });
};

export default playTone;
```

同样动画模块也使用了 Scheduler 接管，以 ClearLinesAnimation 动画的实现为例：

```js
class ClearLinesAnimation {
  /**
   * ## 初始化动画
   *
   * 设置动画属性，为每行创建独立的透明度状态， 调用 `applyClearLines` 获取本次消除得分供分数动画使用，
   * 启动闪烁序列、分数动画和结束定时器，播放消行音效。
   *
   * @param {object} options - 配置对象
   * @param {number[]} options.lines - 待消除的行号数组
   * @returns {void}
   */
  initialize(options) {
    const { lines } = options;

    /**
     * ## 渲染层级
     *
     * 设为 200（UI 层），确保闪烁效果显示在游戏界面上方。
     *
     * @type {number}
     */
    this.layer = 200;

    /**
     * ## 是否阻塞用户输入
     *
     * 消行动画期间禁止玩家操作。
     *
     * @type {boolean}
     */
    this.blocking = true;

    /**
     * ## 动画名称标识
     *
     * 用于 `hasBlocking()` 精确匹配。
     *
     * @type {string}
     */
    this.name = 'clear-lines';

    /**
     * ## 是否已结束
     *
     * 设为 `true` 后，AnimationSystem 会在 `flush()` 时自动移除。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * ## Scheduler 任务 ID 列表
     *
     * 记录所有注册的 Scheduler 任务，用于 `dispose()` 时批量取消。
     *
     * @type {number[]}
     */
    this._schedulerIds = [];

    const {
      Scheduler,
      Game,
      Store
    } = this;
    const GE = GameEvents(Game.id);
    const AE = AudioEvents();

    /**
     * ## 动画行数据
     *
     * 每项包含行索引和当前透明度。
     *
     * | 属性  | 类型   | 说明                         |
     * | ----- | ------ | ---------------------------- |
     * | y     | number | 行索引                       |
     * | alpha | number | 当前透明度（1=显示, 0=隐藏） |
     *
     * @type {{ y: number; alpha: number }[]}
     */
    this.lines = lines.map((y) => ({
      y,
      alpha: 1,
      color: Store.getState().next?.color || COLORS.WHITE,
    }));

    /**
     * ## 提前计算消除得分
     *
     * `applyClearLines` 是纯函数，此处调用仅用于获取 `clearScore`， 供分数动画在闪烁开始时立即显示。不会产生副作用。
     *
     * @type {number}
     */
    const {
      clearScore,
      combo,
      comboScore
    } = applyClearLines(Game);

    /**
     * ## 闪烁切换函数
     *
     * 将所有行的透明度在 1 和 0 之间切换。
     */
    const toggle = () => {
      for (const line of this.lines) {
        line.alpha = line.alpha === 1 ? 0 : 1;
      }
    };

    /**
     * ## 闪烁序列（含分数动画触发）
     *
     * 6 个任务：
     *
     * - 第 1 个（delay 50ms）：触发消除得分动画
     * - 第 2-6 个（各 delay 120ms）：切换透明度，共 5 次 toggle
     */
    const ids = Scheduler.sequence([
      {
        fn: () => {
          this.emit(GE.START_CLEAR_SCORE, {
            score: clearScore,
            lines: this.lines.map((l) => l.y),
            combo,
            comboScore,
          });
        },
        delay: 50,
      },
      {
        fn: toggle,
        delay: 120
      },
      {
        fn: toggle,
        delay: 120
      },
      {
        fn: toggle,
        delay: 120
      },
      {
        fn: toggle,
        delay: 120
      },
      {
        fn: toggle,
        delay: 120
      },
    ]);

    this._schedulerIds.push(...ids);

    /**
     * ## 动画结束定时器
     *
     * 720ms 后标记动画完成，AnimationSystem 将调用 dispose()。
     */
    const endId = Scheduler.delay(() => {
      this._finished = true;
    }, 720);

    this._schedulerIds.push(endId);

    /**
     * ## 播放消行音效
     *
     * 传入消除行数 - 1 用于音符选择和和弦变奏。
     */
    this.emit(AE.PLAY_SOUND, {
      sound: 'CLEAR',
      lines: lines.length - 1,
      level: Store.getLevel(),
    });
  }
}
```

这样不仅降低了模块之间的耦合，也保证了所有异步行为都能够与 Runtime 保持一致。

### 为什么这是一次架构演进？

Scheduler 并不是为了替代 `setTimeout()`。它真正解决的问题，是让"时间"成为 Runtime 可以统一管理的资源。

```js
const startGameLoop = (timestamp) => {
  // 首次运行时初始化时间基准
  if (!Engine.lastTickTime) {
    Engine.lastTickTime = timestamp;
    Engine.fixedAccumulator = timestamp;
  }

  const { Game, Scheduler } = Engine;
  const { UI, Replay, Gamepad, Animations, CommandQueue } = Game;

  // 检查是否有阻塞动画（如消行动画、倒计时、升级特效）
  const isBlocked = Animations.hasBlocking();

  // 计算距离上次逻辑更新的时间差
  const stepDelta = timestamp - Engine.fixedAccumulator;

  // 计算帧间隔时间（秒）
  const prev = Engine.lastTickTime ?? timestamp;
  let delta = (timestamp - prev) / 1000;

  /**
   * ======== 步骤 1：防止“死亡螺旋” ========
   *
   * 当用户切换标签页再切回来时，requestAnimationFrame 会暂停， 导致 delta 累积到一个极大的值。限制 delta 上限为
   * 1000ms， 避免游戏在切回时瞬间执行大量逻辑导致卡死。
   */
  if (delta > 1000) {
    delta = 1000;
  }

  // 更新上一帧时间戳
  Engine.lastTickTime = timestamp;

  /**
   * ======== 步骤 2：驱动调度器 ========
   *
   * 执行所有到期的定时任务（delay、interval）。 这包括 AI 的决策循环、音效序列等。
   */
  Scheduler.tick(timestamp);

  /**
   * ======== 步骤 3：同步回放逻辑时钟 ========
   *
   * 给 playElapsed 加上 delta 上限， 保证切换标签页后回放能平滑加速追赶，不会瞬间跳过太多帧。
   */
  Replay.syncPlayElapsed({
    timestamp: Engine.lastTickTime,
    isBlocked,
  });

  /**
   * ======== 步骤 4：回放更新 ========
   *
   * 如果正在回放，Replay.update() 会根据回放时钟将到期的命令 注入到命令队列中。这是回放的核心驱动逻辑。
   */
  Replay.update({
    speed: Game.getSpeed(),
    timestamp: Engine.lastTickTime,
  });

  /**
   * ======== 步骤 5：手柄状态更新 ========
   *
   * 每帧读取手柄输入状态，将新的输入转换为 command 入队。
   */
  Gamepad.update(timestamp);

  /**
   * ======== 步骤 6：执行命令队列 ========
   *
   * 将本帧累积的所有 command（来自键盘、手柄、AI、回放） 一次性执行，确保所有输入在同一帧内生效。
   */
  CommandQueue.flush();

  /**
   * ======== 步骤 7：游戏逻辑更新 ========
   *
   * 仅当以下条件全部满足时才执行：
   *
   * - 不在回放中（回放由 Replay.update 驱动）
   * - 距离上次逻辑更新的时间 >= 当前等级的下落间隔
   *
   * 这实现了基于等级的下落速度控制。
   */
  if (
    (!Engine.fixedAccumulator || stepDelta > Game.getSpeed()) &&
    !Replay.playing
  ) {
    // 执行游戏逻辑：方块自动下落、碰撞检测、消行等
    Game.tick(isBlocked);

    // 更新逻辑时间基准
    Engine.fixedAccumulator = timestamp;
  }

  /**
   * ======== 步骤 8：更新动画状态 ========
   *
   * 更新所有注册的动画（消行特效、升级特效等）的状态。
   */
  Animations.update(delta);

  /**
   * ======== 步骤 9：更新 HUD 动画 ========
   *
   * 更新分数、等级等 HUD 显示的数字动画。
   */
  UI.tickHud(delta);

  /**
   * ======== 步骤 10：渲染游戏界面 ========
   *
   * 绘制棋盘、当前方块、预览方块等核心游戏画面。
   */
  UI.render();

  /**
   * ======== 步骤 11：叠加渲染动画特效 ========
   *
   * 在游戏界面上叠加渲染消行闪光、升级特效等动画层。
   */
  Animations.render();

  /**
   * ======== 步骤 12：请求下一帧 ========
   *
   * 递归调用自身，形成持续的帧循环。
   */
  Engine.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
```

从这一刻开始，动画、音效、AI、Battle 等模块，不再依赖各自独立的 Timer，而是共享同一套运行节奏。这不仅让整个系统更加容易维护，也为 Replay、暂停恢复以及未来更多高级能力提供了统一的基础。

### Scheduler 实现

到这里，也应该解开 Scheduler 的真面目了：

```js
/**
 * # Scheduler（任务调度器）
 *
 * 游戏核心的任务调度引擎，替代 `setTimeout`/`setInterval`， 由外部 Game Loop 每帧通过 `tick()` 驱动。
 *
 * ## 核心特性
 *
 * - **绝对时间模型（Absolute Time）**：任务绑定绝对时间戳，不依赖 `tick` 初始化
 * - **有序任务队列（Sorted Queue）**：按 `time + order` 排序，保证执行顺序稳定
 * - **时间漂移修复（Interval Drift Fix）**：Interval 从 `nextTime` 精确计算，避免累积误差
 * - **补帧保护（Catch-up Protection）**：限制单次 `tick` 最大补帧数，防止切后台后卡死
 *
 * ## 任务类型
 *
 * | 类型     | 方法         | 说明                   |
 * | -------- | ------------ | ---------------------- |
 * | delay    | `delay()`    | 一次性延迟任务         |
 * | interval | `interval()` | 周期性重复任务         |
 * | sequence | `sequence()` | 按时间偏移的顺序任务链 |
 *
 * ## 设计理念
 *
 * - **不依赖 RAF**：由外部 `startGameLoop` 驱动，与渲染循环解耦
 * - **稳定排序**：同一时间任务按 `order` 执行，保证音效序列等场景的时序一致
 * - **Lazy Cleanup**：取消任务仅标记 `cancelled`，在 `tick` 末尾统一清理
 *
 * @class Scheduler
 */
class Scheduler {
  /**
   * ## 构造函数
   *
   * 初始化空任务队列、ID 计数器和顺序计数器。
   */
  constructor() {
    /**
     * ## 任务队列
     *
     * 按 `time + order` 升序排列的有序数组。 替代 Map 实现，避免全遍历，保证时间顺序和执行稳定性。
     *
     * @type {object[]}
     */
    this.tasks = [];

    /**
     * ## 下一个任务 ID
     *
     * 自增计数器，每个任务分配唯一 ID。
     *
     * @type {number}
     */
    this.nextId = 1;

    /**
     * ## 顺序计数器
     *
     * 同一时间点的任务按 `order` 升序执行，保证稳定排序。
     *
     * @type {number}
     */
    this.order = 0;

    /**
     * ## 当前逻辑时间
     *
     * 由 `tick(gameTime)` 每帧更新。
     *
     * @type {number}
     */
    this.now = performance.now();

    /**
     * ## 延迟清理标记
     *
     * 有任务被取消时设为 `true`，在下次 `tick` 末尾统一清理。
     *
     * @type {boolean}
     */
    this.dirty = false;

    /**
     * ## 最大补帧数
     *
     * 单次 `tick` 中 Interval 任务的最大补执行次数，防止长时间暂停后瞬间爆帧。
     *
     * @type {number}
     */
    this.maxCatchUp = 5;
  }

  /* ================== 公共 API ================== */

  /**
   * ## 创建延迟任务
   *
   * 替代 `setTimeout`，在当前逻辑时间 + 指定延迟后执行一次回调。
   *
   * @example
   *   const id = scheduler.delay(() => console.log('done'), 100);
   *
   * @param {Function} fn - 回调函数
   * @param {number} [delay=0] - 延迟时间（毫秒）。默认值为 `0`. Default is `0`
   * @returns {number} 任务 ID，可用于 `cancel()`
   */
  delay(fn, delay = 0) {
    const id = this.nextId++;

    this._insertTask({
      id,
      type: 'delay',
      fn,
      time: this.now + delay,
      cancelled: false,
      order: this.order++,
    });

    return id;
  }

  /**
   * ## 创建周期任务
   *
   * 替代 `setInterval`，按指定间隔周期性执行回调。
   *
   * @example
   *   const id = scheduler.interval(() => console.log('tick'), 200);
   *
   * @param {Function} fn - 回调函数
   * @param {number} [interval=1000] - 执行间隔（毫秒）。默认值为 `1000`. Default is `1000`
   * @returns {number} 任务 ID，可用于 `cancel()`
   */
  interval(fn, interval = 1000) {
    const id = this.nextId++;

    this._insertTask({
      id,
      type: 'interval',
      fn,
      interval,
      time: this.now + interval,
      nextTime: this.now + interval,
      cancelled: false,
      order: this.order++,
    });

    return id;
  }

  /**
   * ## 创建任务序列
   *
   * 按时间偏移顺序执行多个任务。每个任务可指定相对于序列起始时间的延迟。 内部使用 `delay()` 实现，直接绑定绝对时间，不依赖 `tick`
   * 初始化。
   *
   * @example
   *   scheduler.sequence([
   *     { fn: () => playNote('C4') },
   *     { fn: () => playNote('E4'), delay: 260 },
   *     { fn: () => playNote('G4'), delay: 260 },
   *   ]);
   *
   * @param {{ fn: Function; delay?: number }[]} list - 任务列表
   * @param {Function} list[].fn - 回调函数
   * @param {number} [list[].delay=0] - 该任务相对于上一个任务的延迟（毫秒）。默认值为 `0`. Default is
   *   `0`
   * @returns {number[]} 所有任务的 ID 数组
   */
  sequence(list) {
    const ids = [];
    let t = 0;

    for (const item of list) {
      const { fn, delay = 0 } = item;
      t += delay;
      ids.push(this.delay(fn, t));
    }

    return ids;
  }

  /**
   * ## 取消任务
   *
   * 通过任务 ID 标记任务为取消状态。 取消的任务不会立即删除，而是在下一次 `tick()` 时批量清理。
   *
   * @param {number} id - 要取消的任务 ID
   * @returns {void}
   */
  cancel(id) {
    const task = this.tasks.find((t) => t.id === id);

    if (!task) {
      return;
    }

    task.cancelled = true;
    this.dirty = true;
  }

  /**
   * ## 清空所有任务
   *
   * 立即删除所有任务并清除脏标记。 通常在游戏重启或模式切换时调用。
   *
   * @returns {void}
   */
  clear() {
    this.tasks.length = 0;
    this.dirty = false;
  }

  /**
   * ## 驱动调度器
   *
   * 由外部 Game Loop 每帧调用，传入当前游戏时间。 遍历到期任务并执行，最后清理已取消的任务。
   *
   * @param {number} [gameTime=performance.now()] - 当前游戏时间戳（毫秒）。默认值为
   *   `performance.now()`. Default is `performance.now()`
   * @returns {void}
   */
  tick(gameTime = performance.now()) {
    this.now = gameTime;

    if (this.tasks.length === 0) return;

    this._executeDueTasks(gameTime);
    this._cleanup();
  }

  /**
   * ## 获取任务数量
   *
   * Debug 辅助方法，用于测试和调试。
   *
   * @returns {number} 当前任务队列中的任务数量
   */
  size() {
    return this.tasks.length;
  }

  /* ================== 核心引擎（私有） ================== */

  /**
   * ## 插入任务并保持队列有序
   *
   * 使用插入排序将任务按 `time + order` 升序排列。 同一时间点的任务按 `order` 保证执行顺序稳定。
   *
   * @private
   * @param {object} task - 任务对象
   * @returns {void}
   */
  _insertTask(task) {
    const { tasks } = this;
    let i = tasks.length;

    /**
     * 插入排序：从队尾向前找到正确位置
     *
     * 排序规则：
     *
     * 1. `time` 小的在前
     * 2. `time` 相同时 `order` 小的在前
     */
    while (i > 0) {
      const prev = tasks[i - 1];

      if (
        prev.time < task.time ||
        (prev.time === task.time && prev.order <= task.order)
      ) {
        break;
      }

      tasks[i] = tasks[i - 1];
      i--;
    }

    tasks[i] = task;
  }

  /**
   * ## 执行所有到期任务
   *
   * 从队头依次取出 `time <= gameTime` 的任务，按类型分发处理。
   *
   * @private
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _executeDueTasks(gameTime) {
    while (this.tasks.length > 0 && this.tasks[0].time <= gameTime) {
      const task = this.tasks.shift();

      if (task.cancelled) continue;

      if (task.type === 'delay') {
        this._runDelayTask(task);
      } else if (task.type === 'interval') {
        this._runIntervalTask(task, gameTime);
      }
    }
  }

  /**
   * ## 执行 Delay 任务
   *
   * 一次性任务，执行后即结束。
   *
   * @private
   * @param {object} task - 延迟任务对象
   * @returns {void}
   */
  _runDelayTask(task) {
    task.fn(task);
  }

  /**
   * ## 执行 Interval 任务
   *
   * 周期任务，执行后更新 `nextTime` 并重新插入队列。 包含补帧保护：长时间暂停后最多补 `maxCatchUp` 次， 超过后重置
   * `nextTime` 为当前时间，防止瞬间爆帧。
   *
   * @private
   * @param {object} task - 周期任务对象
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _runIntervalTask(task, gameTime) {
    let catchUp = 0;

    /** 补帧循环： 如果 `nextTime` 落后于当前时间，连续补执行， 最多 `maxCatchUp` 次，防止长时间暂停后爆炸。 */
    while (
      task.nextTime <= gameTime &&
      !task.cancelled &&
      catchUp < this.maxCatchUp
    ) {
      catchUp++;
      task.fn(task);
      task.nextTime += task.interval;
    }

    /** 达到补帧上限：重置 nextTime 为当前时间， 放弃追赶，避免瞬间执行大量回调。 */
    if (catchUp >= this.maxCatchUp) {
      task.nextTime = gameTime + task.interval;
    }

    // 未取消则重新插入队列等待下次触发
    if (!task.cancelled) {
      // 同步 time
      task.time = task.nextTime;
      this._insertTask(task);
    }
  }

  /**
   * ## 批量清理已取消的任务
   *
   * 延迟清理机制：有脏标记时才执行清理。 过滤掉所有 `cancelled === true` 的任务。
   *
   * @private
   * @returns {void}
   */
  _cleanup() {
    if (!this.dirty) return;

    this.tasks = this.tasks.filter((t) => !t.cancelled);
    this.dirty = false;
  }
}

export default Scheduler;
```

最后看看 Scheduler 是如何衔接 Audio、Animations System、Animation 和 Game Loop 的：

![Scheduler Diagram](assets/img/scheduler-diagram.png)

## 架构演进：Replay

当 Runtime 保证了状态更新的确定性，Scheduler 共享同一套运行节奏之后，Replay 也变得简单起来。Replay 不用保存棋盘，也不录制视频它只保存：`**Command**`

```js
import EventBus from '@/lib/core/event-bus';
import Command from '@/lib/core/command/command.js';

/**
 * # 输入分发器（Input Dispatcher）
 *
 * 将原始输入（键盘、手柄、AI）统一转换为 Command 并推入执行管线， 是整个输入系统的入口和核心枢纽。
 *
 * ## 核心职责
 *
 * 1. **输入拦截**：在动画阻塞期间（倒计时、升级动画等）禁止输入
 * 2. **Command 构建**：将原始输入信息包装为标准 Command 对象
 * 3. **入队执行**：将 Command 推入命令队列，等待后续 flush 执行
 * 4. **Replay 录制**：如果录制开启，将 Command 和时间戳写入回放数据
 *
 * ## 数据流向
 *
 *     键盘/手柄/AI 输入
 *       → Engine._subscribe → dispatch:input 事件
 *       → dispatchInput()
 *         → 拦截检查（动画阻塞？）
 *         → new Command(action, payload)
 *         → command:queue:<id>:enqueue（入队执行）
 *         → replay:<id>:add:record（回放录制）
 *
 * ## 输入来源
 *
 * | device   | 说明        |
 * | -------- | ----------- |
 * | keyboard | 键盘输入    |
 * | gamepad  | 手柄输入    |
 * | ai       | AI 自动操作 |
 *
 * @example
 *   // 键盘左箭头输入
 *   dispatchInput(
 *     { device: 'keyboard', action: 'MOVE_LEFT', payload: { Game } },
 *     { isBlocked: false, ms: 1200 },
 *   );
 *
 *   // AI 硬降输入
 *   dispatchInput(
 *     { device: 'ai', action: 'DROP', payload: { Game } },
 *     { isBlocked: false, ms: 3500 },
 *   );
 *
 * @function dispatchInput
 * @param {object} input - 输入信息
 * @param {string} input.device - 输入设备类型（keyboard / gamepad / ai）
 * @param {string} input.action - 输入动作类型（MOVE_LEFT、ROTATE、DROP 等）
 * @param {object} input.payload - 输入携带的额外参数（通常包含 Game 实例引用）
 * @param {object} context - 执行上下文对象
 * @param {boolean} context.isBlocked - 是否处于动画阻塞状态
 * @param {number} context.ms - 当前回放时间戳（用于录制）
 * @returns {void}
 */
const dispatchInput = (input, context) => {
  const { action, payload } = input;
  const { isBlocked, ms } = context;

  /**
   * ======== 输入拦截层 ========
   *
   * 在以下关键动画期间禁止所有输入：
   *
   * - Countdown（倒计时动画）：防止玩家在倒计时结束前操作
   * - Level-up（升级动画）：防止升级特效期间误操作
   *
   * 同时过滤掉空的 action（未映射的按键等）
   */
  if (isBlocked || !action) {
    return;
  }

  /** ======== Command 构建 ======== */
  // 将原始输入包装为标准 Command 对象
  const cmd = new Command(action, payload);
  const { Game } = payload;
  const { id } = Game;

  /** ======== 入队执行 ======== */
  // 将 Command 推入命令队列，等待后续的 flush 执行
  EventBus.emit(`command:queue:${id}:enqueue`, { cmd });

  /**
   * ======== Replay 记录层 ========
   *
   * 如果回放录制已开启，将 Command 和时间戳写入回放数据。 ms 为扣除暂停时间后的纯游玩时长。
   *
   * 注意：这里属于 side-effect，但暂时保留在 dispatcher 中， 未来可考虑抽取为独立的 replay middleware。
   */
  EventBus.emit(`replay:${id}:add:record`, {
    ms,
    cmd,
  });
};

export default dispatchInput;
```

因为 Runtime 保证：

```
相同输入
↓
相同状态变化
↓
相同结果
```

Replay 因此拥有极小的数据量，同时能够完整重现整局游戏。需要注意的是 Replay 不仅仅记录用户的输入指令，也记录 Game Loop 中 Game.tick() 的数据：

```js
import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';

/**
 * # 游戏逻辑帧（Tick）
 *
 * 游戏主循环中每一逻辑帧执行的核心逻辑： 自动下落、碰撞检测、锁定方块、消行、生成新方块。
 *
 * ## 执行流程
 *
 * | 步骤 | 条件                                | 操作                                |
 * | ---- | ----------------------------------- | ----------------------------------- |
 * | 1    | mode 不是 playing/replay 或动画阻塞 | 退出，不执行下落                    |
 * | 2    | mode 是 playing                     | 发送 AUTO_TICK 命令（用于回放录制） |
 * | 3    | 尝试下移一格                        | 调用 `move(game, 0, 1)`             |
 * | 4    | 下移成功                            | 本次 tick 结束，等待下次调用        |
 * | 5    | 下移失败（碰撞）                    | 锁定 → 消行 → 生成新方块            |
 *
 * ## 为什么 playing 模式要发送 AUTO_TICK？
 *
 * 在 playing 模式下，通过 `dispatch:input` 发送 `AUTO_TICK` 命令， 目的是让自动下落也被回放系统录制。
 * 这样回放时不需要实时计算下落，只需重放录制的命令即可还原游戏过程。
 *
 * ## 调用时机
 *
 * 由 `startGameLoop` 中的固定时间步长逻辑调用：
 *
 *     if (stepDelta > Game.getSpeed() && !Replay.playing) {
 *       Game.tick(isBlocked);
 *     }
 *
 * ## 与其他下落方式的区别
 *
 * | 方法               | 行为                         | 触发方式           |
 * | ------------------ | ---------------------------- | ------------------ |
 * | `tick()`           | 每次下落一格，碰底则锁定     | 自动（定时器驱动） |
 * | `move(game, 0, 1)` | 每次下落一格，碰底返回 false | 手动按 ↓ 键        |
 * | `drop()`           | 直接落到底部                 | 手动按空格键       |
 *
 * @function tick
 * @param {object} game - 游戏执行上下文
 * @param {boolean} isBlocked - 是否被动画阻塞（消行特效、倒计时等期间为 true）
 * @returns {void}
 */
const tick = (game, isBlocked) => {
  const mode = game.Store.getMode();

  // 游戏不在进行中或回放中，或者动画阻塞 → 不执行下落
  if ((mode !== 'playing' && mode !== 'replay') || isBlocked) {
    return;
  }

  // playing 模式下发送 AUTO_TICK 命令，用于回放录制
  if (mode === 'playing') {
    game.emit('dispatch:input', {
      device: 'replay',
      action: 'AUTO_TICK',
      payload: {
        Game: game,
      },
    });
  }

  // 尝试向下移动一格
  if (!move(game, 0, 1)) {
    // 无法下移（触底或碰撞）→ 锁定方块
    lock(game);

    // 播放方块落地音效
    game.emit('audio:resume:sound', { sound: 'FALL' });

    // 检测并消除满行（带动画特效）
    clearLines(game);

    // 生成下一个活动方块
    spawn(game);
  }
};

export default tick;
```
回放的时候除了用户的按键行为，也需要记录方块的自动下落的行为。

### Replay 的实现

Replay 模块的实现其实并不复杂：

```js
import Base from '@/lib/core';

/**
 * # ReplayController
 *
 * 回放 / 录制控制器。
 *
 * 支持：
 *
 * - 录制玩家操作（command）
 * - 回放录制的操作
 * - 快进追赶（标签页切换后防止爆帧）
 * - 方块序列的录制与回放
 *
 * 设计为 Class，未来 AI 对战可创建多个独立实例， 每个实例维护自己的录制/回放状态与事件绑定。
 *
 * ## 核心字段
 *
 * | 字段          | 类型    | 说明                   |
 * | ------------- | ------- | ---------------------- |
 * | recording     | boolean | 是否正在录制           |
 * | playing       | boolean | 是否正在回放           |
 * | data          | Array   | 录制数据 [{ ms, cmd }] |
 * | cursor        | number  | 回放读取位置           |
 * | pieceSequence | Array   | 方块序列               |
 * | pieceIndex    | number  | 方块序列读取位置       |
 * | playElapsed   | number  | 回放逻辑时间           |
 * | startTime     | number  | 录制/回放起始时间戳    |
 * | timestamp     | number  | 当前帧时间戳           |
 */
class ReplayController extends Base {
  /**
   * ## 是否有录制的回放数据。
   *
   * @returns {boolean} - 有回放数据，返回 true，否则返回 false
   */
  get hasData() {
    return this.data.length > 0;
  }

  /**
   * ## 构造函数
   *
   * @class
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    super(options);

    /** ## 是否正在录制 */
    this.recording = false;

    /** ## 是否正在回放 */
    this.playing = false;

    /**
     * ## 录制数据
     *
     * 结构 [{ ms: number, cmd: Command }]
     */
    this.data = [];

    /** ## 回放时当前读取到的 data 索引 */
    this.cursor = 0;

    /**
     * ## 录制的方块序列
     *
     * 用于保证回放时方块顺序一致
     */
    this.pieceSequence = [];

    /** ## 回放时当前读取到的方块序列索引 */
    this.pieceIndex = 0;

    /**
     * ## 回放逻辑时间（ms）
     *
     * 独立于 wall-clock 的"回放钟"，用于按录制时的节奏推进 command。
     */
    this.playElapsed = 0;

    /** ## 录制或回放的起始时间戳 */
    this.startTime = 0;

    /**
     * ## 当前帧时间戳
     *
     * 由 update() 每帧更新
     */
    this.timestamp = 0;
  }

  getNextPiece() {
    if (!this.playing) {
      return { curr: null, next: null };
    }

    const piece = this.pieceSequence[this.pieceIndex++];

    // 防止 Replay.pieceIndex++ 越界
    if (!piece) {
      return { curr: null, next: null };
    }

    const next = this.pieceSequence[this.pieceIndex] || null;

    return { curr: piece, next };
  }

  /**
   * ## 同步回放逻辑时钟。
   *
   * 计算当前 wall-clock 时间与 startTime 的差值作为回放进度。 如果检测到时间跳跃过大（标签页切后台），限制单次跳跃上限。
   *
   * @param {object} ctx - 执行上下文对象
   * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
   * @param {boolean} ctx.isBlocked - 是否处于暂停/阻塞状态
   */
  syncPlayElapsed({ timestamp, isBlocked }) {
    // 非播放状态或阻塞中跳过
    if (!this.playing || isBlocked) return;

    const prev = this.playElapsed;
    const now = timestamp - this.startTime;
    const delta = now - prev;

    // 时间跳跃超过 1 秒（标签页切后台），限制为最多快进 1 秒
    if (delta > 1000) {
      this.startTime += delta - 1000;
      this.playElapsed = prev + 1000;
    } else {
      this.playElapsed = now;
    }
  }

  /**
   * ## 每帧调用，驱动回放逻辑
   *
   * 执行流程：
   *
   * 1. 更新当前 timestamp
   * 2. 检查回放是否结束
   * 3. 如有需要，快进跳过长时间等待（标签页切回后）
   * 4. 将所有逻辑时间已到的 command 逐条注入 EventBus
   *
   * @param {object} ctx - 执行上下文对象
   * @param {Function} ctx.speed - 获取当前下落间隔（ms），用于快进阈值计算
   * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
   */
  update({ speed, timestamp }) {
    const mode = this.Store.getMode();

    this.timestamp = timestamp;

    // 非回放状态，直接退出
    if (!this.playing || mode !== 'replay') {
      return;
    }

    const { data } = this;

    // 回放完毕：所有 command 都已执行
    if (data.length > 0 && this.cursor >= data.length) {
      this.stopPlay();
      return;
    }

    /*
     * ---- 快进逻辑 ----
     * 如果下一个 command 需要等超过 2 倍下落间隔，说明中间有暂停/空白
     * 直接快进到该 command 附近，避免标签页切回后长时间"卡等"
     */
    const next = data[this.cursor];

    if (next) {
      const interval = speed ?? 1000;
      const gap = next.ms - this.playElapsed;

      if (gap > interval * 2) {
        // 单次最多快进 1 秒，防止瞬间爆帧
        const skip = Math.min(gap - interval, 1000);
        this.playElapsed += skip;
        this.startTime = timestamp - this.playElapsed;
      }
    }

    /* ---- 核心回放循环 ---- */
    // 将所有逻辑时间 <= playElapsed 的 command 一次性注入
    while (
      this.playing &&
      this.cursor < data.length &&
      data[this.cursor].ms <= this.playElapsed
    ) {
      const { cmd } = data[this.cursor];
      this.emit(`dispatch:command`, cmd);
      this.cursor++;
    }
  }

  /**
   * ## 开始录制
   *
   * 行为：
   *
   * - 开启 recording 标志
   * - 清空旧数据和方块序列
   * - 将 startTime 设置为当前 timestamp
   */
  startRecord() {
    this.recording = true;
    this.data = [];
    this.pieceSequence = [];
    this.pieceIndex = 0;
    this.playElapsed = 0;
    this.startTime = this.timestamp;
  }

  /** ## 停止录制 */
  stopRecord() {
    this.recording = false;
  }

  /**
   * ## 开始回放
   *
   * 行为：
   *
   * - 开启 playing 标志
   * - 重置 cursor 和 pieceIndex
   * - 将 startTime 设置为当前 timestamp
   */
  startPlay() {
    this.playing = true;
    this.cursor = 0;
    this.pieceIndex = 0;
    this.startTime = this.timestamp;
  }

  /** ## 停止回放 */
  stopPlay() {
    this.playing = false;
    this.emit(`game:${this.Game.id}:update:mode`, { mode: 'game-over' });
  }

  /**
   * ## 清除所有数据，重置标志位。
   *
   * 注意：不清除事件绑定，仅重置录制/回放相关状态。
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
   * ## 停止录制/回放并清除所有数据。
   *
   * 等同于 stopRecord() + stopPlay() + clear()。
   */
  reset() {
    this.stopRecord();
    this.stopPlay();
    this.clear();
  }

  /**
   * ## 绑定所有事件监听
   *
   * 在游戏初始化时调用一次。
   */
  subscribe() {
    const uuid = this.Game.id;

    this.on(`replay:${uuid}:start:record`, this._onStartRecord);
    this.on(`replay:${uuid}:stop:record`, this._onStopRecord);
    this.on(`replay:${uuid}:add:record`, this._onAddRecord);
    this.on(`replay:${uuid}:add:piece`, this._onAddPiece);
    this.on(`replay:${uuid}:start:play`, this._onStartPlay);
    this.on(`replay:${uuid}:reset`, this._onReset);
    this.on(`replay:${uuid}:game:over`, this._onGameOver);
    this.on(`replay:${uuid}:stop:clear:lines`, this._onClearLines);
  }

  unsubscribe() {
    const uuid = this.Game.id;

    this.off(`replay:${uuid}:start:record`, this._onStartRecord);
    this.off(`replay:${uuid}:stop:record`, this._onStopRecord);
    this.off(`replay:${uuid}:add:record`, this._onAddRecord);
    this.off(`replay:${uuid}:add:piece`, this._onAddPiece);
    this.off(`replay:${uuid}:start:play`, this._onStartPlay);
    this.off(`replay:${uuid}:reset`, this._onReset);
    this.off(`replay:${uuid}:game:over`, this._onGameOver);
    this.off(`replay:${uuid}:stop:clear:lines`, this._onClearLines);
  }

  /**
   * ## 销毁实例
   *
   * 停止所有录制/回放、清除数据、解绑所有事件。 主要用于 AI 对战切换对手或完全卸载 replay 模块。
   */
  destroy() {
    // 先停止和清空状态
    this.reset();

    // 逐个解绑事件
    this.unsubscribe();
  }

  /** @private */
  _onStartRecord = () => {
    this.startRecord();
  };

  /** @private */
  _onStopRecord = () => {
    this.stopRecord();
  };

  /**
   * ## 录制一条 command
   *
   * 只在 recording 状态下写入。
   *
   * @private
   * @param {object} record - { ms, cmd }
   */
  _onAddRecord = (record) => {
    if (!this.recording) {
      return;
    }
    this.data.push(record);
  };

  /**
   * ## 录制一个方块。
   *
   * 只在 recording 状态下写入，使用深拷贝避免引用污染。
   *
   * @private
   * @param {object} piece - 方块数据
   */
  _onAddPiece = (piece) => {
    if (!this.recording) {
      return;
    }
    this.pieceSequence.push(structuredClone(piece));
  };

  /** @private */
  _onStartPlay = () => {
    this.startPlay();
  };

  /** @private */
  _onReset = () => {
    this.reset();
  };

  /**
   * ## 游戏结束时的处理。
   *
   * - 有回放数据：准备棋盘进入回放
   * - 无回放数据：直接进入 game-over 状态
   *
   * @private
   */
  _onGameOver = () => {
    const { Game } = this;
    const uuid = Game.id;

    if (this.hasData) {
      this.emit(`ai:${uuid}:stop`);
      this.emit(`game:${uuid}:replay:prepare:board`, {
        nextPiece: this.getNextPiece(),
      });
    } else {
      this.emit(`ui:${uuid}:update:mode`, { mode: 'game-over' });
      this.emit(`game:${uuid}:update:mode`, { mode: 'game-over' });
    }
  };

  /**
   * ## 消行时的处理
   *
   * 回放中不触发升级提示音/动画；录制或正常游戏中升级时触发。
   *
   * @private
   * @param {object} param - 参数对象
   * @param {boolean} param.isLevelUp - 是否升级
   * @param {number} param.level - 当前等级
   */
  _onClearLines = ({ isLevelUp, level }) => {
    if (!isLevelUp || this.playing) {
      return;
    }

    // 暂停当前 BGM
    this.emit('audio:stop:bgm');
    // 播放升级音效
    this.emit('audio:resume:sound', { sound: 'LEVEL_UP' });
    // 触发升级特效
    this.emit(`game:${this.Game.id}:start:level:up`, { level });
  };
}

/**
 * 单例导出，兼容现有代码。
 *
 * 后续 AI 对战时可直接 `new ReplayController()` 创建独立实例。
 */
export default ReplayController;
```

关键的逻辑是 `syncPlayElapsed` 和 `update`。

### syncPlayElapsed

`syncPlayElapsed` 主要是处理用户暂停了游戏或者切换到其他标签页时，游戏停止的状态再 Replay 回放时如何处理时间跳跃过大时，保证回放的连续性。

```js
/**
   * ## 同步回放逻辑时钟。
   *
   * 计算当前 wall-clock 时间与 startTime 的差值作为回放进度。 如果检测到时间跳跃过大（标签页切后台），限制单次跳跃上限。
   *
   * @param {object} ctx - 执行上下文对象
   * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
   * @param {boolean} ctx.isBlocked - 是否处于暂停/阻塞状态
   */
  syncPlayElapsed({ timestamp, isBlocked }) {
    // 非播放状态或阻塞中跳过
    if (!this.playing || isBlocked) return;

    const prev = this.playElapsed;
    const now = timestamp - this.startTime;
    const delta = now - prev;

    // 时间跳跃超过 1 秒（标签页切后台），限制为最多快进 1 秒
    if (delta > 1000) {
      this.startTime += delta - 1000;
      this.playElapsed = prev + 1000;
    } else {
      this.playElapsed = now;
    }
  }
```

### update

`update` 则是同步 Game Loop 的时间轴执行记录的 Command，也就是执行 `this.emit(`dispatch:command`, cmd);`，发送消息执行 `dispatchCommand` 方法执行实际的操作。

```js
  /**
   * ## 每帧调用，驱动回放逻辑
   *
   * 执行流程：
   *
   * 1. 更新当前 timestamp
   * 2. 检查回放是否结束
   * 3. 如有需要，快进跳过长时间等待（标签页切回后）
   * 4. 将所有逻辑时间已到的 command 逐条注入 EventBus
   *
   * @param {object} ctx - 执行上下文对象
   * @param {Function} ctx.speed - 获取当前下落间隔（ms），用于快进阈值计算
   * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
   */
  update({ speed, timestamp }) {
    const mode = this.Store.getMode();

    this.timestamp = timestamp;

    // 非回放状态，直接退出
    if (!this.playing || mode !== 'replay') {
      return;
    }

    const { data } = this;

    // 回放完毕：所有 command 都已执行
    if (data.length > 0 && this.cursor >= data.length) {
      this.stopPlay();
      return;
    }

    /*
     * ---- 快进逻辑 ----
     * 如果下一个 command 需要等超过 2 倍下落间隔，说明中间有暂停/空白
     * 直接快进到该 command 附近，避免标签页切回后长时间"卡等"
     */
    const next = data[this.cursor];

    if (next) {
      const interval = speed ?? 1000;
      const gap = next.ms - this.playElapsed;

      if (gap > interval * 2) {
        // 单次最多快进 1 秒，防止瞬间爆帧
        const skip = Math.min(gap - interval, 1000);
        this.playElapsed += skip;
        this.startTime = timestamp - this.playElapsed;
      }
    }

    /* ---- 核心回放循环 ---- */
    // 将所有逻辑时间 <= playElapsed 的 command 一次性注入
    while (
      this.playing &&
      this.cursor < data.length &&
      data[this.cursor].ms <= this.playElapsed
    ) {
      const { cmd } = data[this.cursor];
      this.emit(`dispatch:command`, cmd);
      this.cursor++;
    }
  }
```

### Replay 架构图

最后看看融合 Replay 后的架构是什么样的：

![Replay Diagram](assets/img/replay-diagram.png)

## 架构演进：EventBus

细心的朋友应该发现了在 Replay 模块的 `update` 方法中使用了 `**this.emit(`dispatch:command`, cmd);**`，它就是：**EventBus**。

### 为什么引入 EventBus

随着项目不断扩展，模块越来越多，模块之间开始出现越来越多的交互，模块间相互调用，形成了强耦合。

而 **EventBus（事件总线）** 它提供了一套多模块间发布-订阅（Publish-Subscribe）的消息通信机制，让各个模块之间能够解耦通信。

#### 以前的实现

以 tetris.js 游戏中消除行后更新分数、播放消除动画、播放消除音效，最后更新分数的实现为例：

```js
import BOARD from '@/lib/ui/constants/board.js';
import Game from '@/lib/game';
import startClearLines from '@/lib/controllers/clear-lines-controller.js';

/**
 * # 消除满行核心逻辑
 *
 * 1. 检测所有满行
 * 2. 添加闪烁特效（不立即删行）
 * 3. 播放消行音效
 * 4. 更新分数与等级
 * 5. 等待 drawClearFlash 完成闪烁后再真正删行
 *
 * @function clearLines
 * @returns {boolean} - 执行成功，返回 true，否则返回 false
 */
const clearLines = () => {
  const { store } = Game;
  const state = store.getState();
  const { ROWS } = BOARD;

  // 记录消除行数
  let clear = 0;
  // 存储需要闪烁消除的行号
  const linesToClear = [];

  // 从底部向上遍历所有行，检测满行
  for (let y = ROWS - 1; y >= 0; y--) {
    // 优化判断：单元格有值（非空/非0）即为有方块
    const isLineFull = state.board[y].every((cell) => !!cell);

    // 如果是满行，加入待消除队列
    if (isLineFull) {
      linesToClear.push(y);
      clear++;
    }
  }

  // 如果没有满行，直接更新界面并退出
  if (clear === 0) {
    return false;
  }

  store.setClearLines(linesToClear);

  // 等待闪烁 3 次动画完成 → 再删行
  startClearLines(linesToClear);

  return true;
};

export default clearLines;
```

有消除行了，要开始播放动画了，就直接调用了（当时）Controllers 模块的 `startClearLines` 方法触发动画：`ClearLinesAnimation`。

接着我们看看 `ClearLinesAnimation` 的逻辑又是如何的：

```js
import Engine from '@/lib/engine';
import BOARD from '@/lib/ui/constants/board.js';
import GAME from '@/lib/game/constants/game.js';
import Sounds from '@/lib/audio/sounds.js';
import renderClear from '@/lib/ui/board/render-clear.js';
import renderHud from '@/lib/ui/hud/render-hud.js';
import startLevelUp from '@/lib/controllers/level-up-controller.js';

/**
 * # ClearLinesAnimation
 *
 * 表示“消除行”的动画实例。
 *
 * 职责包括：
 *
 * - 控制消除行的闪烁动画（基于时间切换透明度）
 * - 在动画完成后执行真实的游戏状态更新（删除行、加分、升级等）
 * - 在渲染阶段绘制当前动画效果
 *
 * ## 生命周期
 *
 * 1. 创建实例（constructor）
 * 2. 每帧调用 update(delta)
 * 3. 若 update 返回 false，则动画结束并从系统移除
 * 4. 在结束时执行 stop() 完成状态收敛
 *
 * ## 动画表现
 *
 * - 每行独立维护 timer
 * - 每 0.12 秒切换一次 alpha（闪烁效果）
 * - 总持续时间为 0.72 秒
 *
 * ## 依赖
 *
 * - Engine.Game.store：用于读取与更新游戏状态
 * - Sounds：播放消除音效
 * - RenderClear：渲染闪烁效果
 * - RenderHud：刷新 HUD
 * - StartLevelUp：触发升级流程
 */
class ClearLinesAnimation {
  /**
   * ## 渲染层级（UI 层，显示在最前面）
   *
   * @type {number}
   */
  layer = 200;

  /**
   * ## 是否阻塞用户输入
   *
   * @type {boolean}
   */
  blocking = true;

  /**
   * ## 动画名称标识
   *
   * @type {string}
   */
  name = 'clear-lines';

  /**
   * ## 构造函数
   *
   * @param {number[]} lines - 需要执行消除动画的行索引数组（从 0 开始）
   */
  constructor(lines) {
    /**
     * 动画行数据
     *
     * 每一项包含：
     *
     * - Y: 行索引
     * - Alpha: 当前透明度（用于闪烁）
     * - Timer: 当前动画时间（秒）
     *
     * @type {{ y: number; alpha: number; timer: number }[]}
     */
    this.lines = lines.map((y) => ({
      y,
      alpha: 1,
      timer: 0,
    }));

    // 播放对应数量的消除音效（1行/2行/3行/4行）
    Sounds.clear(lines.length - 1);
  }

  /**
   * ## 更新动画状态
   *
   * 每帧调用，用于：
   *
   * - 推进每一行的动画时间
   * - 根据 timer 计算当前闪烁状态（alpha）
   * - 判断动画是否结束
   *
   * @param {number} delta - 距离上一帧的时间差（单位：秒）
   * @returns {boolean} - 是否继续存活（true = 继续，false = 结束）
   */
  update(delta) {
    // 标记是否所有行都已完成动画
    let done = true;

    // 遍历每一行动画数据
    for (const line of this.lines) {
      /**
       * 当前阶段（phase）
       *
       * 每 0.12 秒为一个阶段： phase = 0,1,2,3...
       */
      const phase = Math.floor(line.timer / 0.12);

      /**
       * 控制闪烁：
       *
       * - 偶数阶段：显示（alpha = 1）
       * - 奇数阶段：隐藏（alpha = 0）
       */
      line.alpha = phase % 2 === 0 ? 1 : 0;

      // 累加时间
      line.timer += delta;

      /**
       * 判断是否仍在动画期间
       *
       * 总时长为 0.72 秒（6 个 phase）
       */
      if (line.timer < 0.72) {
        done = false;
      }
    }

    // 所有行动画完成
    if (done) {
      // 执行动画结束后的逻辑
      this.stop();

      // 返回 false → 动画系统移除此实例
      return false;
    }

    return true;
  }

  /**
   * ## 动画结束后的收尾逻辑
   *
   * 包含：
   *
   * 1. 实际删除已满的行
   * 2. 更新分数与消除行数
   * 3. 判断并处理升级
   * 4. 更新 HUD
   */
  stop() {
    const { CLEAR_LINE_SCORES, MAX_LEVEL } = GAME;
    const { ROWS, COLS } = BOARD;

    const { store } = Engine.Game;
    const state = store.getState();

    const lines = state.clearLines || [];
    const cleared = lines.length;

    /**
     * 1. 真实消行逻辑（直接操作 board 结构）
     *
     * 这里属于“结构型数据修改”，暂时不纳入 setState
     */
    const board = structuredClone(state.board);

    for (let y = ROWS - 1; y >= 0; y--) {
      const isFullLine = board[y].every(Boolean);

      if (isFullLine) {
        board.splice(y, 1);
        board.unshift(Array.from({ length: COLS }).fill(0));
        y++;
      }
    }

    // 2. 状态收敛
    const nextLines = state.lines + cleared;
    const totalLines = state.baseLines + nextLines;
    const newLevel = Math.floor(totalLines / 10) + 1;

    // 触发升级逻辑
    if (newLevel > state.level) {
      startLevelUp(newLevel);
    }

    store.setState((prev) => ({
      ...prev,
      clearLines: [],
      lines: nextLines,
      score: prev.score + CLEAR_LINE_SCORES[cleared] * prev.level,
      level: Math.min(Math.max(prev.level, newLevel), MAX_LEVEL),
      board,
    }));

    // 3. HUD 更新
    renderHud(store.getState());
  }

  /**
   * ## 渲染动画
   *
   * 在渲染阶段调用：
   *
   * - 根据当前 lines 数据（含 alpha）绘制闪烁效果
   *
   * 不修改 state，仅负责视觉表现
   */
  render() {
    renderClear({ lines: this.lines });
  }
}

export default ClearLinesAnimation;
```

看代码可以清晰的知道程序的调用逻辑：

1. `Sounds.clear(lines.length - 1)`；直接调用 Audio 模块内的 `Sounds.clear` 方法播放消除音效;
2. `renderClear()`；直接调用 UI 模块的绘制消除行的方法；
3. `update()`：通过 Game Loop 的 requestAnimationFrame 逐帧更新动画；
4. `stop()`：动画结束，又直接通过 Game.store 更新游戏状态属性；
5. `renderHud(store.getState())`；最后又直接通过 UI 的 `renderHud` 方法更新动画；

这种方式虽然简单，但随着功能越来越多，问题也逐渐暴露出来：

- Game 需要依赖越来越多的模块；
- 模块之间形成大量双向引用；
- 一个模块修改，往往需要同步调整多个地方；
- 新增功能时，需要不断修改已有代码；
- 模块越来越难以独立测试。

随着 Runtime 不断演进，Game 已经不应该知道：

- UI 如何更新；
- Audio 如何播放；
- Animation 如何执行；
- Replay 如何处理；
- AI 如何响应。

它真正关心的只有一件事情：**某件事情发生了**。于是，项目引入了 EventBus。模块之间不再直接调用，而是通过事件进行通信。

### EventBus 解耦后的实现

还是以 clearLines 为例，看看 EventBus 解耦后的实现是怎么样的：

```js
import Game from '@/lib/game';
import findFullLines from '@/lib/game/utils/find-full-lines.js';
import EventBus from '@/lib/core/event-bus/index.js';

/**
 * # 执行消行逻辑（包含闪烁3次特效）
 *
 * 在面板中收集被方块填满的行，然后执行消除动画
 *
 * @function clearLines
 * @returns {void}
 */
const clearLines = () => {
  // 获取填满的行
  const linesToClear = findFullLines();

  if (linesToClear.length === 0) {
    return;
  }

  Game.store.setClearLines(linesToClear);
  // 等待闪烁 3 次动画完成 → 再删行
  EventBus.emit('effects:start:clear:lines', { linesToClear });
};

export default clearLines;
```

这个时候的实现 Game 也不直接调用 Controllers 模块的 `startClearLines` 方法 仅发布了一个消息：`effects:start:clear:lines`。这时候 Game 模块 clearLines 不在与 Controllers 强耦合了。

接着看调整后的 ClearLinesAnimation 采用 EventBus 是如何处理的：

```js
import EventBus from '@/lib/core/event-bus';
import applyClearLines from '@/lib/game/utils/apply-clear-lines.js';

/**
 * # ClearLinesAnimation
 *
 * 表示“消除行”的动画实例。
 *
 * 职责包括：
 *
 * - 控制消除行的闪烁动画（基于时间切换透明度）
 * - 在动画完成后执行真实的游戏状态更新（删除行、加分、升级等）
 * - 在渲染阶段绘制当前动画效果
 *
 * ## 生命周期
 *
 * 1. 创建实例（constructor）
 * 2. 每帧调用 update(delta)
 * 3. 若 update 返回 false，则动画结束并从系统移除
 * 4. 在结束时执行 stop() 完成状态收敛
 *
 * ## 动画表现
 *
 * - 每行独立维护 timer
 * - 每 0.12 秒切换一次 alpha（闪烁效果）
 * - 总持续时间为 0.72 秒
 *
 * ## 依赖
 *
 * - Engine.Game.store：用于读取与更新游戏状态
 * - Sounds：播放消除音效
 * - RenderClear：渲染闪烁效果
 * - RenderHud：刷新 HUD
 * - StartLevelUp：触发升级流程
 */
class ClearLinesAnimation {
  /**
   * ## 渲染层级（UI 层，显示在最前面）
   *
   * @type {number}
   */
  layer = 200;

  /**
   * ## 是否阻塞用户输入
   *
   * @type {boolean}
   */
  blocking = true;

  /**
   * ## 动画名称标识
   *
   * @type {string}
   */
  name = 'clear-lines';

  /**
   * ## 构造函数
   *
   * @param {number[]} lines - 需要执行消除动画的行索引数组（从 0 开始）
   */
  constructor(lines) {
    /**
     * 动画行数据
     *
     * 每一项包含：
     *
     * - Y: 行索引
     * - Alpha: 当前透明度（用于闪烁）
     * - Timer: 当前动画时间（秒）
     *
     * @type {{ y: number; alpha: number; timer: number }[]}
     */
    this.lines = lines.map((y) => ({
      y,
      alpha: 1,
      timer: 0,
    }));

    // 播放对应数量的消除音效（1行/2行/3行/4行）
    EventBus.emit('audio:sounds:clear', { lines: lines.length - 1 });
  }

  /**
   * ## 更新动画状态
   *
   * 每帧调用，用于：
   *
   * - 推进每一行的动画时间
   * - 根据 timer 计算当前闪烁状态（alpha）
   * - 判断动画是否结束
   *
   * @param {number} delta - 距离上一帧的时间差（单位：秒）
   * @returns {boolean} - 是否继续存活（true = 继续，false = 结束）
   */
  update(delta) {
    // 标记是否所有行都已完成动画
    let done = true;

    // 遍历每一行动画数据
    for (const line of this.lines) {
      /**
       * 当前阶段（phase）
       *
       * 每 0.12 秒为一个阶段： phase = 0,1,2,3...
       */
      const phase = Math.floor(line.timer / 0.12);

      /**
       * 控制闪烁：
       *
       * - 偶数阶段：显示（alpha = 1）
       * - 奇数阶段：隐藏（alpha = 0）
       */
      line.alpha = phase % 2 === 0 ? 1 : 0;

      // 累加时间
      line.timer += delta;

      /**
       * 判断是否仍在动画期间
       *
       * 总时长为 0.72 秒（6 个 phase）
       */
      if (line.timer < 0.72) {
        done = false;
      }
    }

    // 所有行动画完成
    if (done) {
      // 执行动画结束后的逻辑
      this.stop();

      // 返回 false → 动画系统移除此实例
      return false;
    }

    return true;
  }

  /**
   * ## 动画结束后的收尾逻辑
   *
   * 包含：
   *
   * 1. 实际删除已满的行
   * 2. 更新分数与消除行数
   * 3. 判断并处理升级
   * 4. 更新 HUD
   */
  stop() {
    const result = applyClearLines();
    const { level, levelUp } = result;
    const isLevelUp = levelUp;

    // 1. 触发升级逻辑，回放时不触发
    EventBus.emit('replay:stop:clear:lines', { isLevelUp, level });

    // 2. 更新游戏状态信息
    EventBus.emit('game:update:state', { stateHandler: result.stateHandler });

    // 3. HUD 更新
    EventBus.emit('game:save:high:score');
    EventBus.emit('game:update:hud');
  }

  /**
   * ## 渲染动画
   *
   * 在渲染阶段调用：
   *
   * - 根据当前 lines 数据（含 alpha）绘制闪烁效果
   *
   * 不修改 state，仅负责视觉表现
   */
  render() {
    const { lines } = this;

    EventBus.emit('ui:render:clear', { state: { lines } });
  }
}

export default ClearLinesAnimation;

```

### EventBus 带来的提升

可以看到这一版之前的一系列操作：播放消除音效、渲染消除动画、更新 Game 模块的 state 游戏状态、更新分数都是通过发送消息实现。的真正处理事件的是各个独立模块，它们内部监听相关的消息，然后做出相应的处理：

```text
game:clear-lines
        │
   EventBus.emit()
        ├────────▶ Animation
                     │
                  EventBus.emit()
                     │
                     ├────────▶ Audio
                     │
                     ├────────▶ Game
                     │
                     ├────────▶ UI
```

Game 不需要知道谁会响应这个事件，并且看最新的实现，还加入了消除行升级动画。这种发布/订阅模式，使整个 Runtime 从"函数调用"演变为"事件驱动"，模块之间彻底解耦。

EventBus 带来了几个明显优势：

- **降低模块耦合**：模块之间不再互相依赖。
- **职责更加清晰**：事件只描述"发生了什么"，而不是"应该怎么做"。
- **易于扩展**：新增模块只需要监听事件，无需修改已有逻辑。
- **统一生命周期**：所有模块拥有统一的 subscribe / unsubscribe 生命周期。
- **支持多实例**：Battle 模式下，每个 Game 实例拥有独立的事件空间，互不影响。

整个项目中，大部绝大多数分系统都建立在 EventBus 之上，例如：

- UI
- Audio
- Animation
- Replay
- AI
- Battle

它们之间彼此不知道对方的存在，只通过事件进行通信。因此，在整个 Runtime 中 Command 用于传递输入（Input），EventBus 用于传递事件（Event），Scheduler 用于调度时间（Time）。三者共同构成了 Runtime 的基础设施（Infrastructure），让所有业务模块都建立在统一的运行机制之上。


## 架构演进：AI

随着项目不断演进，项目的架构已经足够支撑实现 AI 的一切条件了，很自然的 tetris.js 实现了 AI。不过 AI 用的是最直接的方法，是让 AI 直接修改棋盘状态：

```javascript
board.moveLeft();
board.rotate();
board.drop();
```

这种方式虽然简单，但会带来很多问题：

- AI 与玩家拥有两套不同的操作逻辑；
- Replay 无法复用玩家输入；
- 调试时很难定位 AI 与游戏逻辑之间的问题；
- 后续增加新的输入方式（手柄、网络对战等）需要重复实现；

也就是说，**AI 直接操作棋盘，会让整个系统越来越耦合**。因此，项目重新设计了 AI 的职责，AI 不再负责"操作游戏"，而只负责"思考下一步应该做什么"，真正执行操作的始终只有 Runtime。

### createSnapshot 创建真实棋盘的快照

不能直接修改游戏棋盘的数据，我们需要“拷贝”一份棋盘数据，具体的处理方式是通过创建一个真实棋盘的快照：**`createSnapshot`**。

```js
const createSnapshot = (state) =>
  structuredClone({
  // 控制者身份
  controller: state.controller,

  // 棋盘状态
  board: state.board,

  // 游戏进度
  level: state.level,
  score: state.score,
  lines: state.lines,

  // 原始方块对象（保留完整信息，方便后续扩展）
  cur: state.curr,
  next: state.next,

  // AI 决策专用的方块信息：从 state.curr 和 state.cx/cy 中提取并结构化
  piece: state.curr
  ? {
  shape: state.curr.shape,
  position: {
  x: state.cx,
  y: state.cy,
  },
  }
  : null,

  // 游戏模式
  mode: state.mode,
  });

export default createSnapshot;
```

### Beam Search

AI 在决策工程中，需要大量的棋盘演算，我们不能将所有的数据都保留，只在"还需要继续递归"且"候选数超过 beam 限制"时执行。也就是采用 Beam Search 算法实现决策推演，保留 Beam Search 演算的最佳结果：

```js
const selfPlay = (snapshot, weights, depth = 1, beam = 5) => {
  // 生成当前方块所有可能的移动（4 个旋转状态 × 合法水平位置）
  const moves = generateMoves(snapshot);

  // 没有可用移动（例如游戏结束、棋盘已满）
  if (moves.length === 0) return null;

  /**
   * ======== Beam Search 剪枝 ========
   *
   * 只在"还需要继续递归"且"候选数超过 beam 限制"时执行。
   *
   * 剪枝逻辑：
   *
   * 1. 用 evaluateBoard 对第一层所有候选快速评分
   * 2. 按评分降序排列
   * 3. 只保留前 beam 个候选，其余丢弃
   *
   * 注意：depth=1 时不触发剪枝，因为不需要递归。
   */
  if (depth > 1 && moves.length > beam) {
    // 对每个候选的结果棋盘快速评分
    const scored = moves.map((move) => ({
      move,
      score: evaluateBoard(move.board, weights),
    }));

    // 按评分降序排列（分数越高越好，越接近 0）
    scored.sort((a, b) => b.score - a.score);

    // 清空原数组，只保留 top `beam` 个候选
    moves.length = 0;
    moves.push(...scored.slice(0, beam).map((s) => s.move));
  }

  // 最佳移动及其评分
  let best = null;
  let bestScore = -Infinity;

  // 遍历所有候选移动（已剪枝）
  for (const move of moves) {
    let score;

    if (depth <= 1) {
      /* ======== 最深一层：直接评估 ======== */
      // 不再往下看，直接用评估函数对放置后的棋盘打分
      score = evaluateBoard(move.board, weights);
    } else {
      /* ======== 还需要往下看：递归前瞻 ======== */

      // 1. 推进快照：模拟放置当前方块 → 消除满行 → 推进到下一个方块
      const nextSnapshot = advanceSnapshot(snapshot, move);

      // 2. 递归调用 selfPlay，对新方块做决策（depth - 1）
      const nextBest = selfPlay(nextSnapshot, weights, depth - 1, beam);

      /*
       * 3. 用下一步的最佳结果作为当前步的评分
       *
       * 如果下一步也没有可用移动（nextBest 为 null），
       * 退回到直接评估当前棋盘
       */
      score = nextBest
        ? evaluateBoard(nextBest.board, weights)
        : evaluateBoard(move.board, weights);
    }

    // 更新最佳选择（评分越高越好，最接近 0）
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }

  /*
   * 返回当前方块的最佳移动:
   *
   * 注意：返回的 actions 始终是当前方块的操作序列，
   * 后续步骤只用于辅助评分，不返回它们的最佳移动
   */
  return best;
};

export default selfPlay;
```

AI 搜索完成以后，最终输出的仍然只是：`Command`。`selfPlay` 是做决策的，`generateMoves` 就是用来创建 Command 的：

```js
import rotateMatrix from '@/lib/ai/simulator/rotate-matrix.js';
import simulateDrop from '@/lib/ai/simulator/simulate-drop.js';

/**
 * ## 获取所有合法的水平位置
 *
 * 计算形状在棋盘上所有可以放置的 X 坐标范围。
 *
 * @param {number[][]} board - 游戏棋盘
 * @param {number[][]} shape - 方块形状矩阵
 * @returns {number[]} 所有合法的 X 坐标数组
 */
const getValidXPositions = (board, shape) => {
  const boardWidth = board[0].length;
  const shapeWidth = shape[0].length;
  const maxX = boardWidth - shapeWidth;
  const positions = [];

  for (let x = 0; x <= maxX; x++) {
    positions.push(x);
  }

  return positions;
};

/**
 * ## 添加旋转动作
 *
 * @param {string[]} actions - 动作数组（会被修改）
 * @param {number} count - 旋转次数
 */
const addRotateActions = (actions, count) => {
  for (let i = 0; i < count; i++) {
    actions.push('ROTATE');
  }
};

/**
 * ## 添加水平移动动作
 *
 * 根据位移距离的正负决定向左还是向右移动。
 *
 * @param {string[]} actions - 动作数组（会被修改）
 * @param {number} delta - 位移量（正数向右，负数向左）
 */
const addMoveActions = (actions, delta) => {
  if (delta === 0) return;

  const moveDirection = delta > 0 ? 'MOVE_RIGHT' : 'MOVE_LEFT';
  const moveCount = Math.abs(delta);

  for (let i = 0; i < moveCount; i++) {
    actions.push(moveDirection);
  }
};

/**
 * ## 构建动作序列
 *
 * 按照执行顺序生成动作数组：先旋转，再移动，最后硬降。
 *
 * @param {object} params - 参数对象
 * @param {number} params.rotationCount - 需要旋转的次数（0-3）
 * @param {number} params.targetX - 目标 X 坐标
 * @param {number} params.originalX - 原始 X 坐标
 * @returns {string[]} 动作序列数组
 */
const buildActionSequence = ({ rotationCount, targetX, originalX }) => {
  const actions = [];

  // 1. 添加旋转动作
  addRotateActions(actions, rotationCount);

  // 2. 添加水平移动动作
  addMoveActions(actions, targetX - originalX);

  // 3. 添加硬降动作
  actions.push('DROP');

  return actions;
};

/**
 * ## 创建单个候选移动
 *
 * 对给定的旋转状态和水平位置，模拟硬降并生成动作序列。
 *
 * @param {object} params - 参数对象
 * @param {number[][]} params.board - 游戏棋盘
 * @param {number[][]} params.currentShape - 当前旋转后的形状
 * @param {number} params.targetX - 目标水平位置
 * @param {object} params.originalPiece - 原始方块对象
 * @param {number} params.rotationCount - 旋转次数（0-3）
 * @returns {{ board: number[][]; actions: string[] }} 候选移动对象
 */
const createCandidate = ({
  board,
  currentShape,
  targetX,
  originalPiece,
  rotationCount,
}) => {
  // 模拟硬降，获取结果棋盘
  const result = simulateDrop(board, currentShape, targetX);

  // 生成动作序列
  const actions = buildActionSequence({
    rotationCount,
    targetX,
    originalX: originalPiece.position.x,
  });

  return {
    board: result.board,
    actions,
  };
};

/**
 * # 生成所有可能的移动
 *
 * 对当前方块，遍历所有旋转状态和水平位置，模拟硬降后生成候选棋盘， 并为每个候选生成对应的动作序列。
 *
 * @function generateMoves
 * @param {object} snapshot - 游戏当前状态信息的快照
 * @returns {{ board: number[][]; actions: string[] }[]} 候选移动数组
 */
const generateMoves = (snapshot) => {
  const { board, piece } = snapshot;
  const moves = [];

  // 从初始形状开始
  let currentShape = piece.shape;

  // 遍历 4 个旋转状态（0°, 90°, 180°, 270°）
  for (let rotation = 0; rotation < 4; rotation++) {
    const validXPositions = getValidXPositions(board, currentShape);

    for (const targetX of validXPositions) {
      const candidate = createCandidate({
        board,
        currentShape,
        targetX,
        originalPiece: piece,
        rotationCount: rotation,
      });
      moves.push(candidate);
    }

    currentShape = rotateMatrix(currentShape);
  }

  return moves;
};

export default generateMoves;
```

例如：

```text
MOVE_LEFT
MOVE_RIGHT
ROTATE
SOFT_DROP
HARD_DROP
HOLD
```

随后，这些 Command 会像玩家输入一样，进入统一的 Command Queue，由 Runtime 在 Game Loop 中执行。

```js
import Base from '@/lib/core';
import AIDifficulty from '@/lib/ai/core/ai-difficulty.js';
import createSnapshot from '@/lib/ai/snapshot/create-snapshot.js';
import selfPlay from '@/lib/ai/planner/self-play.js';
import { AIEvents } from '@/lib/events/event-catalog.js';

/**
 * # AI 控制器
 *
 * 负责自动玩俄罗斯方块的 AI 逻辑。 支持两种决策算法：
 *
 * - **Self-Play**（EASY / NORMAL / HARD）：基于启发式评估 + 前瞻搜索
 * - **MCTS**（EXPERT）：基于蒙特卡洛树搜索，通过大量随机模拟做决策
 *
 * ## 核心流程
 *
 * 1. 通过 `loop()` 持续监控游戏状态
 * 2. 当需要决策时，调用 `think()` 分析当前棋盘
 * 3. `think()` 根据难度选择决策算法：
 *
 *    - EASY / NORMAL / HARD → `selfPlay`（前瞻搜索 + 束搜索剪枝）
 *    - EXPERT → `mcts`（蒙特卡洛树搜索）
 * 4. 选出最优动作序列，逐个通过 `dispatch:input` 发送给 Game 执行
 *
 * ## 生命周期
 *
 * - `ai:start` 事件 → `start()` → 开始循环
 * - `ai:stop` 事件 → `stop()` → 停止循环并清空待执行动作
 *
 * ## 依赖注入
 *
 * | 依赖       | 类型   | 说明                                           |
 * | ---------- | ------ | ---------------------------------------------- |
 * | Game       | object | 游戏主实例，提供 Store、emit、getSpeed 等      |
 * | Store      | object | 游戏状态存储，提供 getState()、getDifficulty() |
 * | Scheduler  | object | 调度器，管理定时任务                           |
 * | Animations | object | 动画系统，用于判断动画阻塞状态                 |
 *
 * @augments Base
 * @class AIController
 */
class AIController extends Base {
  /**
   * ## 构造函数
   *
   * 初始化 AI 控制器的默认状态。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Store - 游戏状态存储
   * @param {object} options.Scheduler - 调度器
   * @param {object} options.Animations - 动画系统
   */
  constructor(options) {
    super(options);

    /**
     * ## 是否启用 AI
     *
     * @default false
     * @type {boolean}
     */
    this.enabled = false;

    /**
     * ## 待执行的动作队列
     *
     * 每次 `think()` 产生的最佳动作序列存储在此， 然后由 `loop()` 逐个取出执行。
     *
     * @type {string[]}
     */
    this.actions = [];

    /**
     * ## 当前调度任务的 ID
     *
     * 用于取消上一次未执行的调度。
     *
     * @default 0
     * @type {number}
     */
    this.aiSchedulerId = 0;
  }

  /**
   * ## 启动 AI
   *
   * 设置 enabled 标志并立即开始第一次循环。
   *
   * @returns {void}
   */
  start() {
    this.enabled = true;

    this.loop();
  }

  /**
   * ## 停止 AI
   *
   * 清除 enabled 标志、清空待执行动作、取消调度任务。
   *
   * @returns {void}
   */
  stop() {
    const { Scheduler } = this;

    this.enabled = false;
    this.actions = [];

    Scheduler.cancel(this.aiSchedulerId);
    this.aiSchedulerId = 0;
  }

  /**
   * ## AI 主循环
   *
   * 每帧（由调度器触发）执行以下逻辑：
   *
   * 1. 检查是否启用
   * 2. 检查游戏状态（必须为 playing 且无动画阻塞）
   * 3. 如果没有待执行动作，调用 `think()` 生成新的动作计划
   * 4. 从队列中取出一个动作，通过 `dispatch:input` 发送给 Game
   * 5. 根据当前难度配置的 delay 调度下一次循环
   *
   * @returns {void}
   */
  loop = () => {
    // 未启用则直接退出
    if (!this.enabled) {
      return;
    }

    const { Game, Animations, Scheduler } = this;

    const state = Game.Store.getState();

    // 游戏中断或者游戏动画暂停了，100 毫秒后再尝试
    if (state.mode !== 'playing' || Animations.hasBlocking()) {
      this.aiSchedulerId = Scheduler.delay(this.loop, 100);
      return;
    }

    // 获取当前难度配置（用于 delay）
    const difficulty = this.getDifficultyConfig();

    /** 当前没有 action plan，需要重新决策 */
    if (this.actions.length === 0) {
      const best = this.think(state);

      if (best) {
        // 深拷贝动作序列，避免后续操作污染原始数据
        this.actions = [...best.actions];
      }
    }

    /** 一次只执行一个 action，保证动作节奏与游戏同步 */
    const action = this.actions.shift();

    if (action) {
      this.emit('dispatch:input', {
        device: 'ai',
        action,
        payload: {
          Game,
        },
      });
    }

    /**
     * 调度下一次循环，延迟时间使用难度配置的 delay。
     *
     * 不同难度的 delay 不同：
     *
     * - EASY: 580ms（慢，给玩家充足反应时间）
     * - NORMAL: 480ms（中等）
     * - HARD: 280ms（快，有压迫感）
     * - EXPERT: 150ms（极快，但保留呼吸感）
     */
    this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
  };

  /**
   * ## AI 决策
   *
   * 分析当前游戏状态，计算最佳动作序列。
   *
   * ### 决策算法选择
   *
   * | 难度   | 算法                          | 说明                            |
   * | ------ | ----------------------------- | ------------------------------- |
   * | EASY   | selfPlay (lookahead=1)        | 只看当前方块，轻度启发式评估    |
   * | NORMAL | selfPlay (lookahead=1)        | 同上，但权重更严格              |
   * | HARD   | selfPlay (lookahead=2 + beam) | 前瞻搜索 + 束搜索剪枝           |
   * | EXPERT | MCTS (iterations=300)         | 蒙特卡洛树搜索，随机模拟 300 次 |
   *
   * ### 流程
   *
   * 1. 根据当前难度等级读取配置（lookahead、weights、beam 等）
   * 2. 从真实游戏状态创建快照（深拷贝，隔离 AI 模拟）
   * 3. 调用对应的决策算法
   * 4. 返回最佳移动对象（{ board, actions, y }）
   *
   * @param {object} state - 游戏状态对象（Store.getState() 的返回值）
   * @param {string[][]} state.board - 棋盘二维数组（颜色字符串格式）
   * @param {object} state.curr - 当前活动方块对象（含 shape、color）
   * @param {number} state.cx - 当前方块的 X 坐标（列索引）
   * @param {number} state.cy - 当前方块的 Y 坐标（行索引）
   * @returns {object | null} 最佳移动对象 `{ board, actions, y }`，无法决策时返回 null
   */
  think(state) {
    // 根据当前难度等级读取配置
    const difficulty = this.getDifficultyConfig();
    const { lookahead, weights, beam } = difficulty;

    // 从真实游戏状态创建快照（深拷贝，隔离 AI 模拟）
    const snapshot = createSnapshot(state);

    // EASY / NORMAL / HARD 使用 selfPlay（前瞻搜索 + 束搜索剪枝）
    return selfPlay(snapshot, weights, lookahead, beam);
  }

  /**
   * ## 获取当前难度的完整配置
   *
   * 从 Store 读取当前选择的难度等级（easy/normal/hard/expert）， 映射到对应的 `AIDifficulty` 配置对象。
   *
   * @returns {object} 难度配置对象，包含 lookahead、noise、weights、delay、beam 等字段
   */
  getDifficultyConfig() {
    const { Game } = this;
    const difficulty = Game.Store.getDifficulty();

    // 难度等级 → 配置对象映射
    const map = {
      easy: AIDifficulty.EASY,
      normal: AIDifficulty.NORMAL,
      hard: AIDifficulty.HARD,
      expert: AIDifficulty.EXPERT,
    };

    // 未知难度降级为 NORMAL
    return map[difficulty] || AIDifficulty.NORMAL;
  }

  /**
   * ## 订阅 AI 事件
   *
   * 监听 `ai:<uuid>:start` 和 `ai:<uuid>:stop` 事件。
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    const uuid = Game.id;
    const events = AIEvents(uuid);

    this.on(events.START, this._onStart);
    this.on(events.STOP, this._onStop);
  }

  /**
   * ## 取消订阅 AI 事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    const uuid = Game.id;
    const events = AIEvents(uuid);

    this.off(events.START, this._onStart);
    this.off(events.STOP, this._onStop);
  }

  /**
   * ## 处理 AI 启动事件
   *
   * @private
   * @returns {void}
   */
  _onStart = () => {
    this.start();
  };

  /**
   * ## 处理 AI 停止事件
   *
   * @private
   * @returns {void}
   */
  _onStop = () => {
    this.stop();
  };
}

export default AIController;
```

整个 AI 流程如下：

```text
AI
 │
 │ Search
 ▼
Best Move
 │
 ▼
Generate Commands
 │
 ▼
Command Queue
 │
 ▼
Game Runtime
 │
 ▼
Game Logic
```

这样，无论 Command 来自 Keyboard、Gamepad、Replay 还是 AI，Runtime 都完全不需要关心来源，所有输入共享同一套执行流程。这种设计带来了几个明显优势：

- **统一输入模型**：玩家、AI、Replay 使用完全一致的 Command；
- **Replay 天然支持 AI**：AI 对局可以直接录制和回放，无需额外逻辑；
- **Battle 更容易扩展**：多个 AI、本地双人甚至网络对战，都只是产生更多 Command；
- **调试更加简单**：AI 的行为可以完整记录，任何一次决策都可以重新回放；
- **职责更加清晰**：AI 负责 Decision（决策），Runtime 负责 Simulation（模拟），Renderer 负责 Presentation（渲染）；

整个 AI 模块遵循项目统一的设计原则：**AI 负责 Decision，Runtime 负责 Simulation**。AI 永远不会直接修改游戏状态，而是通过 Command 参与整个 Simulation。因此，在 Runtime 看来玩家与 AI 并没有任何区别，它们只是不同的 Command Producer。

### Web Worker 优化 AI 决策性能

虽然采用了 Beam Search 算法，但 AI 演算 1 个 10 x 20 的游戏棋盘，大概也要演算 300-400 次，性能会是一个问题。因此选择了使用 Web Worker 另外开启一个进程进行演算：

```js
/**
   * ## AI 决策入口
   *
   * 根据运行模式选择决策方式：
   *
   * - **Worker 模式**：异步发送消息给 Worker 线程
   * - **主线程模式**（当前使用）：同步调用 selfPlay，直接返回最佳移动对象
   *
   * ### mode 参数
   *
   * 根据当前游戏模式传递不同的 mode 给 selfPlay：
   *
   * - Single 模式：'survival'（生存模式，只关心自己棋盘的存活）
   * - Battle 模式：'versus'（对战模式，额外考虑攻击力奖励）
   *
   * Mode 参数贯穿整个决策链：selfPlay → evaluateBoard， 在 evaluateBoard 中根据 mode
   * 使用不同的权重和奖励策略。
   *
   * ### bag 参数
   *
   * 从 Game.getBagSnapshot() 获取当前 Game 实例专属的 7-bag 快照。 每个 Game 实例维护独立的
   * this.bag，Battle 模式下不会互相干扰。
   *
   * @param {object} state - 游戏状态对象（Game.Store.getState() 的返回值）
   * @param {object} difficulty - 难度配置对象，包含 lookahead、weights、beam、delay
   * @returns {object | void} 主线程模式返回 { x, y, placeOn, actions }，Worker 模式返回
   *   undefined
   */
  think(state, difficulty) {
    const { Store, Game } = this;
    const { lookahead, weights, beam } = difficulty;
    const difficultyLevel = Store.getDifficulty();
    // Expert 难度预留 mcts 算法切换（当前统一使用 selfPlay）
    const algorithm = difficultyLevel === 'expert' ? 'mcts' : 'selfPlay';
    // 根据游戏模式决定 AI 策略模式
    const mode = Game.isVersus() ? 'versus' : 'survival';
    // 获取当前 Game 实例专属的 7-bag 快照
    const bag = Game.getBagSnapshot();

    if (this.worker) {
      // Worker 模式（当前未使用，保留备用）
      this.workerBusy = true;
      this.worker.postMessage({
        type: 'think',
        state,
        bag,
        weights,
        depth: lookahead,
        beam,
        algorithm,
        mode,
      });
    } else {
      /*
       * ==================== 降级返回（Worker 不可用时） ====================
       *
       * 如果 Worker 分支走了但没有 return（Worker 模式下 think() 返回 undefined），
       * 下面的代码作为降级方案，确保 AI 仍然能做出决策。
       */
      const snapshot = createSnapshot(state, bag);
      return selfPlay(snapshot, weights, lookahead, beam, mode);
    }
  }
```

### AI 架构图

![AI Architecture Diagram](assets/img/ai-poster.png)

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
