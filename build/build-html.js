import chalk from 'chalk';

import CONSTANTS from './utils/constants.js';
import HTML_TEMPLATE from './utils/html-template.js';
import formatHtml from './utils/format-html.js';
import minifyHtml from './utils/minify-html.js';
import writeFile from './utils/write-file.js';

const buildHtml = (args) => {
  const { HTML_FILE_PATH } = CONSTANTS;

  let action;

  switch (args.action) {
    case 'minify': {
      action = minifyHtml;
      break;
    }
    case 'format': {
      action = formatHtml;
      break;
    }
    default: {
      action = minifyHtml;
      break;
    }
  }

  return action(HTML_TEMPLATE)
    .then((convertedCode) => {
      writeFile(HTML_FILE_PATH, convertedCode);

      console.log(
        chalk.greenBright('成功：'),
        chalk.blueBright(HTML_FILE_PATH),
        chalk.green('发布成功！'),
      );

      return true;
    })
    .catch((error) => {
      console.log(chalk.redBright('错误：'), error);

      return false;
    });
};

export default buildHtml;
