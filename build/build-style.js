import chalk from 'chalk';
import less from 'less';

import CONSTANTS from './utils/constants.js';
import isFileExists from './utils/is-file-exists.js';
import readFile from './utils/read-file.js';
import removeFile from './utils/remove-file.js';
import writeFile from './utils/write-file.js';

const buildStyle = (args) => {
  const { LESS_FILE_PATH, STYLE_FILE_PATH, STYLE_MAP_PATH } = CONSTANTS;
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
      writeFile(STYLE_FILE_PATH, css);

      // 处理 .map 文件
      if (compress) {
        // 创建 .map 文件
        writeFile(STYLE_MAP_PATH, map);
      } else {
        if (isFileExists(STYLE_MAP_PATH)) {
          // 删除 .map 文件
          removeFile(STYLE_MAP_PATH);
        }
      }

      console.log(
        chalk.greenBright('成功：'),
        chalk.blueBright(STYLE_FILE_PATH),
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
