/**
 * ## 判断文件夹是否存在
 *
 * @function isDirExists
 * @param {string} dirPath - 文件夹路径
 * @returns {Promise<boolean>} 存在返回 true，不存在返回 false
 */
const isDirExists = async (dirPath) => {
  try {
    // 检测路径是否存在 + 是否是文件夹
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch (err) {
    // 不存在 或 报错 → 返回 false
    return false;
  }
};

export default isDirExists;
