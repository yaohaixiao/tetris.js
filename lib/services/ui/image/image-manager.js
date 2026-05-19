/**
 * ## 图片缓存映射表
 *
 * 使用 Map 存储 SVG 字符串到 Image 对象的映射， 避免重复创建相同的图片实例。
 *
 * @type {Map<string, HTMLImageElement>}
 */
const ImagesCache = new Map();

/**
 * # SVG 转 Data URI
 *
 * 将 SVG 字符串转换为可用于 `Image.src` 的 Data URI 格式。
 *
 * @param {string} svg - SVG 字符串
 * @returns {string} Data URI（`data:image/svg+xml;charset=utf-8,...`）
 */
const toDataURI = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/**
 * # 获取缓存图片（SVG → Image）
 *
 * 将 SVG 字符串转换为 Image 对象并进行缓存。 如果同一 SVG 已创建过图片，直接返回缓存实例，避免重复创建。
 *
 * @example
 *   const img = getImage(mySvgString);
 *   // img 可用于 canvas.drawImage()
 *
 * @param {string} svg - SVG 字符串
 * @returns {HTMLImageElement} 图片对象
 */
export const getImage = (svg) => {
  // 先从缓存中查找
  const cached = ImagesCache.get(svg);

  if (cached) {
    return cached;
  }

  // 缓存未命中，创建新的 Image 实例
  const img = new Image();

  // 将 SVG 转为 Data URI 并设置为图片源
  img.src = toDataURI(svg);

  // 写入缓存
  ImagesCache.set(svg, img);

  return img;
};

/**
 * # 清理图片缓存
 *
 * 清空所有缓存的图片资源，释放引用。 通常在场景切换或 UI 重载时调用。
 *
 * @returns {void}
 */
export const clearImagesCache = () => {
  ImagesCache.clear();
};

/**
 * # 预加载图片资源
 *
 * 提前将一批 SVG 图片加载到缓存中，避免渲染时出现延迟。 调用时会先清理旧缓存，确保切换场景后不会有残留。
 *
 * @example
 *   preloadImages(ScenesBackground);
 *   // 预加载所有场景背景图片
 *
 * @param {object} images - SVG 图片集合（key → svg string 的映射对象）
 * @returns {void}
 */
export const preloadImages = (images) => {
  const svgs = Object.values(images);

  // 清理旧缓存（用于场景切换 / UI 重载）
  clearImagesCache();

  // 逐个预加载 SVG 图片到缓存
  for (const svg of svgs) {
    getImage(svg);
  }
};
