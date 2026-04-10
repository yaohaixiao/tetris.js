import chalk from 'chalk';
import esbuild from 'esbuild';

import CONSTANTS from './utils/constants.js';
import isFileExists from './utils/is-file-exists.js';
import removeFile from './utils/remove-file.js';

// 执行打包
const buildScript = (args) => {
  const { BASE_PATH, SCRIPT_FILE_PATH, SCRIPT_MAP_PATH } = CONSTANTS;
  const minify = args.action === 'minify';

  return esbuild
    .build({
      // 入口文件（你的 ES6 主模块）
      entryPoints: [`${BASE_PATH}/lib/tetris.js`],
      // 输出文件（浏览器直接用）
      outfile: SCRIPT_FILE_PATH,
      // 打包模式：浏览器环境
      platform: 'browser',
      // 输出格式：iife（浏览器立即执行函数，完美兼容所有浏览器）
      format: 'iife',
      // 开启压缩（发布必备，减小体积）
      minify,
      sourcemap: minify,
      // 打包成一个单独文件（把所有 import 的文件都打包进来）
      bundle: true,
      // 把你的模块挂载到全局变量 window.tetris 上（浏览器可直接用）
      globalName: 'tetris',
    })
    .then(() => {
      if (!minify && isFileExists(SCRIPT_MAP_PATH)) {
        removeFile(SCRIPT_MAP_PATH);
      }

      console.log(
        chalk.greenBright('成功：'),
        chalk.blueBright(SCRIPT_FILE_PATH),
        chalk.green('发布成功！'),
      );

      return true;
    })
    .catch((error) => {
      console.log(chalk.redBright('错误：'), error);
      return false;
    });
};

export default buildScript;
