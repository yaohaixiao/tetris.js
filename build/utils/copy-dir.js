import fs from 'node:fs/promises';
import path from 'node:path';
import isDirExists from './is-dir-exists.js';
import copyFile from './copy-file.js';

/**
 * ## 递归拷贝整个目录（文件夹）
 *
 * @function copyDir
 * @param {string} srcDir 源目录
 * @param {string} destDir 目标目录
 */
const copyDir = async (srcDir, destDir) => {
  const { resolve } = path;
  const srcDirPath = resolve(srcDir);
  const destDirPath = resolve(destDir);

  if (!isDirExists(srcDirPath)) {
    return Promise.reject(`警告：${srcDirPath} 不存在或已被删除！`);
  }

  // 先创建目标目录
  await fs.mkdir(destDir, { recursive: true });

  // 读取源目录所有内容
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  // 遍历目录内容
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    // 判断是目录还是文件
    if (entry.isDirectory()) {
      // 递归拷贝子目录
      await copyDir(srcPath, destPath);
    } else {
      // 拷贝文件
      await copyFile(srcPath, destPath);
    }
  }

  return Promise.resolve(`拷贝目录成功：${srcDir} -> ${destDir}`);
};

export default copyDir;
