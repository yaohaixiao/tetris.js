import fs from 'node:fs/promises';
import path from 'node:path';
import isFileExists from './is-file-exists.js';

/**
 * ## 拷贝单个文件（自动创建目标目录）
 *
 * @function copyFile
 * @param {string} src 源文件路径
 * @param {string} dest 目标文件路径
 * @returns {Promise<void>}
 */
const copyFile = async (src, dest) => {
  const { resolve, dirname } = path;
  const { constants } = fs;

  // 1. 定义源文件和目标文件路径
  const sourcePath = resolve(src);
  const destPath = resolve(dest);

  if (!isFileExists(sourcePath)) {
    return Promise.reject(`警告：${sourcePath} 不存在或已被删除`);
  }

  // 2. 获取目标文件所在的目录
  const destDir = dirname(destPath);

  // 3. 检查目录是否存在，不存在则创建（递归创建多级目录）
  await fs.access(destDir, constants.F_OK).catch(async () => {
    await fs.mkdir(destDir, { recursive: true });
  });

  // 4. 执行文件拷贝
  await fs.copyFile(sourcePath, destPath);

  return Promise.resolve(`拷贝文件成功：${sourcePath} -> ${destPath}`);
};

export default copyFile;
