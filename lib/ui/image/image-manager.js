const ImagesCache = new Map();

/**
 * # SVG 转 Data URI
 *
 * 将 SVG 字符串转换为可用于 Image.src 的 data URI
 *
 * @param {string} svg - SVG 字符串
 * @returns {string} Data URI
 */
const toDataURI = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/**
 * # 获取缓存图片（SVG -> Image）
 *
 * 将 SVG 转换为 Image 对象，并进行缓存，避免重复创建。
 *
 * @param {string} svg - SVG 字符串
 * @returns {HTMLImageElement} 图片对象
 */
export const getImage = (svg) => {
  // 先从缓存中读取
  const cached = ImagesCache.get(svg);

  if (cached) {
    return cached;
  }

  // 创建新的 Image 实例
  const img = new Image();

  // 设置图片源
  img.src = toDataURI(svg);

  // 写入缓存
  ImagesCache.set(svg, img);

  return img;
};

/**
 * # 清理图片缓存
 *
 * 清空缓存并尝试释放资源引用
 */
export const clearImagesCache = () => {
  // 清空 Map 缓存
  ImagesCache.clear();
};

/**
 * # 预加载图片资源
 *
 * 用于提前加载 SVG 图片，避免渲染时延迟
 *
 * @param {object} images - SVG 图片集合（key -> svg string）
 */
export const preloadImages = (images) => {
  const svgs = Object.values(images);

  // 清理旧缓存（用于场景切换 / UI 重载）
  clearImagesCache();

  // 逐个预加载 SVG
  for (const svg of svgs) {
    getImage(svg);
  }
};
