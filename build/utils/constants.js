import path from 'node:path';

const { resolve } = path;
// 基础变量
const BASE_PATH = process.cwd();
const BASE_NAME = 'tetris';
// 页面相关变量
const HTML_FILE_PATH = resolve(BASE_PATH, `${BASE_NAME}.html`);
// 样式相关变量
const LESS_FILE_PATH = resolve(BASE_PATH, `theme/${BASE_NAME}.less`);
const STYLE_FILE_NAME = `${BASE_NAME}.css`;
const STYLE_FILE_PATH = resolve(BASE_PATH, STYLE_FILE_NAME);
const STYLE_MAP_PATH = resolve(BASE_PATH, `${STYLE_FILE_NAME}.map`);
// 脚本相关变量
const SCRIPT_FILE_NAME = `${BASE_NAME}.js`;
const SCRIPT_FILE_PATH = resolve(BASE_PATH, SCRIPT_FILE_NAME);
const SCRIPT_MAP_PATH = resolve(BASE_PATH, `${SCRIPT_FILE_NAME}.map`);

const CONSTANTS = {
  BASE_PATH,
  HTML_FILE_PATH,
  LESS_FILE_PATH,
  STYLE_FILE_PATH,
  STYLE_MAP_PATH,
  SCRIPT_FILE_PATH,
  SCRIPT_MAP_PATH,
};

export default CONSTANTS;
