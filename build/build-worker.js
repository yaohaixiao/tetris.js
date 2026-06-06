import chalk from 'chalk';
import esbuild from 'esbuild';

import CONSTANTS from './constants.js';

// 执行打包
const buildWorker = (args) => {
  const {
    BASE_PATH,
    WORKER_FILE_PATH,
    MINIFY_WORKER_FILE_PATH,
    WORKER_MAP_PATH,
  } = CONSTANTS;
  const minify = args.action === 'minify';
  const outfile = minify ? MINIFY_WORKER_FILE_PATH : WORKER_FILE_PATH;

  return esbuild
    .build({
      entryPoints: [`${BASE_PATH}/lib/worker/ai-worker.js`],

      outfile,

      bundle: true,
      platform: 'browser',

      // Worker 推荐 esm
      format: 'esm',

      minify,
      sourcemap: minify,
    })
    .then(() => {
      console.log(
        chalk.greenBright('成功：'),
        chalk.blueBright(outfile),
        chalk.green('发布成功！'),
      );

      return true;
    })
    .catch((error) => {
      console.log(chalk.redBright('错误：'), error);
      return false;
    });
};

export default buildWorker;
