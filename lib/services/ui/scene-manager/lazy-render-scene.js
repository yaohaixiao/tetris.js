import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';

/**
 * # 延迟渲染场景
 *
 * 等待像素字体 "Press Start 2P" 加载完成后再执行首次渲染， 避免因字体未就绪导致的文字显示异常。
 *
 * ## 处理策略
 *
 * - **支持 document.fonts API**：使用 `document.fonts.load()` 等待字体就绪
 * - **降级方案**：不支持 Font Loading API 时，延迟 150ms 后渲染
 *
 * @function lazyRenderScene
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 游戏状态
 * @returns {void}
 */
const lazyRenderScene = (canvas, state) => {
  // 浏览器支持 Font Loading API
  if (document?.fonts?.load) {
    // 等待 "Press Start 2P" 字体 40px 大小加载完成
    document.fonts.load('40px "Press Start 2P"').then(() => {
      renderScene(canvas, state);
    });
  } else {
    // 降级方案：延迟 150ms 后渲染，给字体加载留出时间
    setTimeout(() => {
      renderScene(canvas, state);
    }, 150);
  }
};

export default lazyRenderScene;
