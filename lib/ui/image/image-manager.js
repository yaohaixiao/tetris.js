const ImagesCache = new Map();

const toDataURI = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export const getImage = (svg) => {
  const cached = ImagesCache.get(svg);

  if (cached) {
    return cached;
  }

  const img = new Image();

  img.src = toDataURI(svg);

  ImagesCache.set(svg, img);

  return img;
};

export const clearImagesCache = () => {
  for (const { url } of ImagesCache.values()) {
    // 释放内存
    URL.revokeObjectURL(url);
  }

  ImagesCache.clear();
};

export const preloadImages = (images) => {
  const svgs = Object.values(images);

  // 刷新界面，清理 SVG 缓存
  clearImagesCache();

  for (const svg of svgs) {
    getImage(svg);
  }
};
