# tetris.js

[![npm version](https://img.shields.io/npm/v/@yaohaixiao/tetris.js)](https://www.npmjs.com/package/@yaohaixiao/tetris.js)
[![prettier code style](https://img.shields.io/badge/code_style-prettier-07b759.svg)](https://prettier.io)
[![npm downloads](https://img.shields.io/npm/dt/@yaohaixiao/tetris.js)](https://npmcharts.com/compare/@yaohaixiao/tetris.js?minimal=true)
[![MIT License](https://img.shields.io/github/license/yaohaixiao/tetris.js.svg)](https://github.com/yaohaixiao/tetris.js/blob/main/LICENSE)

English | [简体中文](./README.md)

> A Modern JavaScript Game Runtime & Tetris Engine

<p align="center">
    <img src="docs/assets/img/screen-shot.gif" alt="tetris.js">
</p>

## Project Introduction

**tetris.js** is a Tetris project developed using vanilla JavaScript and HTML5
Canvas, without relying on any third-party game engines.

The project initially aimed to implement a complete and playable Tetris game.
However, as it continued to evolve, it gradually transformed into a complete
architectural practice built around a **Game Runtime**.

Today, Tetris is merely the first practical project of this runtime. The real
exploration lies not in re-implementing Tetris, but in answering:

- How to design a game architecture that can continuously evolve?
- How to keep game state deterministic at all times?
- How to enable AI, Replay, animation, audio, and multiplayer to share the same
  Runtime?
- How to maintain simplicity and maintainability while continuously adding
  features?

Therefore, what you see in this project is not just a playable Tetris game, but
a practice of modern JavaScript game development that is constantly evolving.

As the project continues to evolve, new features are increasingly built on the
same Runtime. Replay, AI, Battle, Scheduler, animation system, input system...

They are not independently developed modules, but capabilities that naturally
grow from a unified architecture. This is the core design philosophy that the
entire project aims to express.

> **For me, Tetris is just the beginning.** **What I truly hope to solidify is a
> JavaScript game architecture that can continuously evolve and be reused.**

## Why This Project?

There are already many excellent Tetris projects on GitHub. They implement
complete gameplay and demonstrate various technical approaches.

However, **tetris.js** aims to answer a different set of questions, such as:

- Why does a game need its own Runtime?
- Why should game state be centrally managed?
- Why doesn't Replay require video recording?
- Why shouldn't AI directly modify game state?
- Why should the input system be decoupled from game logic?
- Why should animation, audio, and game logic run on a unified timeline?

Almost the entire architectural evolution of this project has been completed
step by step around these questions.

Therefore, rather than just a Tetris project, I hope this serves as a practical
record of modern JavaScript game architecture.

## Core Capabilities

Compared to traditional Canvas game demos, tetris.js focuses more on the overall
design of the game runtime, rather than just the gameplay itself.

![System Architecture Diagram](docs/assets/img/architecture-poster.png)

> Deep Dive: [01-features.en.md](./docs/01-features.en.md)

### ⚙️ Independent Game Runtime

Instead of writing game logic directly into browser events, the project
establishes an independent runtime.

All inputs, state updates, animations, audio, AI, Replay, and multiplayer
battles all run on this unified Runtime.

The Runtime is the most core component of the entire project.

> Deep Dive：[03-runtime.en.md](./docs/03-runtime.en.md)

### 🧠 AI Decision System

AI shares the same game logic as human players.

It doesn't directly modify the real board. Instead, it completes searching,
evaluation, and decision-making in an independent simulation environment, then
converts the results into standard commands for the Runtime to execute.

Therefore, there aren't two different sets of game logic for human players and
AI.

> Deep Dive：[04-ai.en.md](./docs/04-ai.en.md)

### 🎬 Replay System

Replay does not record Canvas output or save every frame of the screen.

It only records the **Commands** generated during the game process.

With a deterministic Runtime, the same command sequence can stably reproduce the
entire game process.

> Deep Dive：[05-replay.en.md](./docs/05-replay.en.md)

### 🎯 Command-Driven Architecture

Whether input comes from keyboard, gamepad, touch screen, or AI — it is
ultimately converted into unified Commands.

The Runtime only processes Commands and doesn't care about their source.

This design enables Replay, AI, multiplayer synchronization, and other features
to share the same execution flow.

> Deep Dive：[02-architecture.en.md](./docs/02-architecture.en.md)

### 🗂️ Centralized State Management

All game states are managed by a unified Store.

Rendering, animation, audio, and other modules do not directly modify game data.
Instead, they perform their work based on state changes.

This effectively reduces coupling between modules and makes the entire system
easier to maintain.

### ⏱️ Scheduler System

Animation, delayed tasks, audio playback, and other asynchronous behaviors are
uniformly managed by the Scheduler.

Compared to heavy use of `setTimeout()` or `setInterval()`, this approach
ensures consistent timing across different modules.

### 🔌 Modular Design

Input system, AI, animation, audio, Replay, Renderer, and other modules remain
relatively independent.

As the project continues to expand, new features typically only require adding
modules without modifying existing code.

### 🌍 Multi-Platform Input Support

Supports keyboard, Gamepad, and mobile touch operations.

<p align="center">
  <img src="docs/assets/img/game-boy-layout.png" alt="Tetris Game Screenshot - GAME BOY Layout">
</p>

Different input devices go through unified input abstraction and are ultimately
converted into Commands recognizable by the Runtime. The game logic doesn't need
to care about the input source.

### 📦 Zero Dependencies

The entire project is implemented using modern JavaScript, without relying on
game frameworks like Phaser or PixiJS.

Apart from native browser APIs, there are no game runtime-related dependencies.


## Browser Compatibility

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" width="24"/>](#) Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" width="24"/>](#) Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" width="24"/>](#) Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" width="24"/>](#) Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" width="24"/>](#) Opera |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 128 – 131                                                                                                              | 130 – 132                                                                                                                       | 109 – 131                                                                                                                    | 17.5 – 18.1                                                                                                                  | 113 – 114                                                                                                                 |

**Note**: The project uses standard ES6+, Canvas, and Gamepad API, and is not
compatible with IE series browsers.

## Project Documentation

1. [Architecture](./docs/02-architecture.en.md)
2. [Runtime](./docs/03-runtime.en.md)
3. [AI](./docs/04-ai.en.md)
4. [Replay](./docs/05-replay.en.md)
5. [Battle](./docs/06-battle.en.md)
6. [Development](./docs/07-development.en.md)
7. [Game Controls and Rules](./docs/08-controls-and-rules.en.md)

## Acknowledgments

During development, this project has fully leveraged modern AI tools. Thanks for
their suggestions and assistance in architecture design, code optimization,
testing, documentation, and more.

- ChatGPT: Participated in architecture design discussions, Runtime evolution
  analysis, documentation, and architecture diagram design.
- DeepSeek: Participated in code commenting, test case writing, and
  implementation and optimization of some functional modules.

## Open Source License

- tetris.js project: Open source under the
  [MIT License](http://opensource.org/licenses/mit-license.html)
- Press Start 2P font (Google open source font): Open source under the
  [OFL License](assets/font/OFL.txt)
