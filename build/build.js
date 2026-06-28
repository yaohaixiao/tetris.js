import buildHTML from './build-html.js';
import buildStyle from './build-style.js';
import buildScript from './build-script.js';
import buildWorker from './build-worker.js';
import copyFile from './utils/copy-file.js';
import copyDir from './utils/copy-dir.js';

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
    })
    .then(() => {
      return buildWorker(args);
    })
    .then(() => {
      return copyFile('./docs/assets/img/bg.jpg', './dist/img/bg.jpg');
    })
    .then(() => {
      return copyDir('./docs/assets/font', './dist/font');
    });
};

build();
