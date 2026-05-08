/** @jest-environment jsdom */

import {
  getImage,
  clearImagesCache,
  preloadImages,
} from '@/lib/services/ui/image/image-manager.js';

describe('images-cache', () => {
  const testSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>';

  beforeEach(() => {
    clearImagesCache();
  });

  // ========== toDataURI ==========
  test('getImage 返回 Image 实例', () => {
    const img = getImage(testSvg);

    expect(img).toBeInstanceOf(Image);
    expect(img.src).toContain('data:image/svg+xml;charset=utf-8,');
  });

  test('相同 SVG 返回同一个缓存对象', () => {
    const img1 = getImage(testSvg);
    const img2 = getImage(testSvg);

    expect(img1).toBe(img2);
  });

  test('不同 SVG 返回不同对象', () => {
    const svg2 =
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="5" cy="5" r="5" fill="blue"/></svg>';

    const img1 = getImage(testSvg);
    const img2 = getImage(svg2);

    expect(img1).not.toBe(img2);
  });

  // ========== clearImagesCache ==========
  test('clearImagesCache 清空缓存', () => {
    const img1 = getImage(testSvg);
    clearImagesCache();
    const img2 = getImage(testSvg);

    expect(img1).not.toBe(img2);
  });

  // ========== preloadImages ==========
  test('preloadImages 预加载所有图片', () => {
    const images = {
      red: testSvg,
      blue: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="5" cy="5" r="5" fill="blue"/></svg>',
    };

    preloadImages(images);

    // 两张都应该被缓存
    const img1 = getImage(testSvg);
    const img2 = getImage(images.blue);

    expect(img1).toBeInstanceOf(Image);
    expect(img2).toBeInstanceOf(Image);
  });

  test('preloadImages 清理旧缓存再加载', () => {
    const oldSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="green"/></svg>';

    getImage(oldSvg);

    const images = {
      red: testSvg,
    };

    preloadImages(images);

    // 旧缓存已被清除，重新获取
    const img = getImage(testSvg);
    expect(img).toBeInstanceOf(Image);
  });
});
