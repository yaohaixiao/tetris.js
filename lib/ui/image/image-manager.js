const ImagesCache = new Map();

export const getImage = (svg) => {
  if (ImagesCache.has(svg)) {
    return ImagesCache.get(svg);
  }

  const img = new Image();
  const blob = new Blob([svg], { type: 'image/svg+xml' });

  img.src = URL.createObjectURL(blob);

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
