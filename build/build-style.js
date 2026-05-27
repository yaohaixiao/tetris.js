import chalk from 'chalk';
import less from 'less';

import CONSTANTS from './constants.js';
import isFileExists from './utils/is-file-exists.js';
import readFile from './utils/read-file.js';
import removeFile from './utils/remove-file.js';
import writeFile from './utils/write-file.js';

const buildStyle = (args) => {
  const {
    LESS_FILE_PATH,
    STYLE_FILE_PATH,
    MINIFY_STYLE_FILE_PATH,
    STYLE_MAP_PATH,
  } = CONSTANTS;
  const compress = args.action === 'minify';
  // 读取 less 文件
  const code = readFile(LESS_FILE_PATH, 'utf8');

  // 自己调用 less 编译器
  return less
    .render(code, {
      // 支持 @import 其他 less
      filename: LESS_FILE_PATH,
      math: 'always',
      compress,
      // 开启 sourcemap
      sourceMap: {
        // 不内联，输出独立 map
        sourceMapFileInline: false,
        // 把源码写进 map
        outputSourceFiles: true,
        // 基础路径
        sourceMapBasepath: process.cwd(),
      },
    })
    .then(({ css, map }) => {
      const filePath = compress ? MINIFY_STYLE_FILE_PATH : STYLE_FILE_PATH;

      writeFile(filePath, css);

      // 处理 .map 文件
      if (compress) {
        // 创建 .map 文件
        writeFile(STYLE_MAP_PATH, map);
      }

      console.log(
        chalk.greenBright('成功：'),
        chalk.blueBright(filePath),
        chalk.green('发布成功！'),
      );

      return true;
    })
    .catch((error) => {
      console.log(chalk.redBright('错误：'), error);

      return false;
    });
};

export default buildStyle;
