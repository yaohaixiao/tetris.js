import buildHTML from './build-html.js';
import buildStyle from './build-style.js';
import buildScript from './build-script.js';

import getProcessArguments from './utils/get-process-arguments.js';

/**
 * # 发布 trtris.js 项目的 HTML、CSS、JS 文件到根目录
 *
 * @function publish
 */
const build = async () => {
  const args = getProcessArguments();

  return buildHTML(args)
    .then(() => {
      return buildStyle(args);
    })
    .then(() => {
      return buildScript(args);
    });
};

build();
