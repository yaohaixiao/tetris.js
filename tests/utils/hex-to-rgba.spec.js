import hexToRgba from '@/lib/utils/hex-to-rgba.js';

describe('hexToRgba', () => {
  /*
   * ==================== 基本转换 ====================
   */
  it('应将红色十六进制转换为 rgba', () => {
    expect(hexToRgba('#FF0000', 1)).toBe('rgba(255, 0, 0, 1)');
  });

  it('应将绿色十六进制转换为 rgba', () => {
    expect(hexToRgba('#00FF00', 1)).toBe('rgba(0, 255, 0, 1)');
  });

  it('应将蓝色十六进制转换为 rgba', () => {
    expect(hexToRgba('#0000FF', 1)).toBe('rgba(0, 0, 255, 1)');
  });

  it('应正确处理混合颜色', () => {
    expect(hexToRgba('#FF6B6B', 1)).toBe('rgba(255, 107, 107, 1)');
  });

  /*
   * ==================== 透明度 ====================
   */
  it('应支持半透明（alpha = 0.5）', () => {
    expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('应支持完全透明（alpha = 0）', () => {
    expect(hexToRgba('#FF0000', 0)).toBe('rgba(255, 0, 0, 0)');
  });

  it('应支持完全不透明（alpha = 1）', () => {
    expect(hexToRgba('#FF0000', 1)).toBe('rgba(255, 0, 0, 1)');
  });

  /*
   * ==================== 边界情况 ====================
   */
  it('应正确处理小写十六进制', () => {
    expect(hexToRgba('#ff0000', 1)).toBe('rgba(255, 0, 0, 1)');
  });

  it('应正确处理黑色（#000000）', () => {
    expect(hexToRgba('#000000', 1)).toBe('rgba(0, 0, 0, 1)');
  });

  it('应正确处理白色（#FFFFFF）', () => {
    expect(hexToRgba('#FFFFFF', 1)).toBe('rgba(255, 255, 255, 1)');
  });
});
