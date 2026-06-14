import path from 'node:path';

const { resolve } = path;

/* ========== 基础变量 ========== */
const BASE_PATH = './';
const BASE_NAME = 'tetris';

/* ========== 页面相关变量 ========== */
const HTML_FILE_PATH = resolve(BASE_PATH, `dist/index.html`);

/* ========== 样式相关变量  ========== */
const LESS_FILE_PATH = resolve(BASE_PATH, `theme/${BASE_NAME}.less`);
const STYLE_FILE_PATH = resolve(BASE_PATH, `dist/css/${BASE_NAME}.css`);
const MINIFY_STYLE_FILE_PATH = resolve(
  BASE_PATH,
  `dist/css/${BASE_NAME}.min.css`,
);
const STYLE_MAP_PATH = resolve(BASE_PATH, `dist/css/${BASE_NAME}.min.css.map`);

/* ========== 脚本相关变量 ========== */
const SCRIPT_FILE_PATH = resolve(BASE_PATH, `dist/js/${BASE_NAME}.js`);
const MINIFY_SCRIPT_FILE_PATH = resolve(
  BASE_PATH,
  `dist/js/${BASE_NAME}.min.js`,
);
const SCRIPT_MAP_PATH = resolve(BASE_PATH, `dist/js/${BASE_NAME}.min.js.map`);

/* ========== Worker 相关 ========== */
const WORKER_NAME = 'ai-worker';
const WORKER_FILE_PATH = resolve(BASE_PATH, `dist/js/${WORKER_NAME}.js`);
const MINIFY_WORKER_FILE_PATH = resolve(
  BASE_PATH,
  `dist/js/${WORKER_NAME}.min.js`,
);
const WORKER_MAP_PATH = resolve(BASE_PATH, `dist/js/${WORKER_NAME}.min.js.map`);

const CONSTANTS = {
  BASE_PATH,

  HTML_FILE_PATH,

  LESS_FILE_PATH,
  STYLE_FILE_PATH,
  MINIFY_STYLE_FILE_PATH,
  STYLE_MAP_PATH,

  SCRIPT_FILE_PATH,
  MINIFY_SCRIPT_FILE_PATH,
  SCRIPT_MAP_PATH,

  WORKER_FILE_PATH,
  MINIFY_WORKER_FILE_PATH,
  WORKER_MAP_PATH,
};

export default CONSTANTS;
