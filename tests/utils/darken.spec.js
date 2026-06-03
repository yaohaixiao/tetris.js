import darken from '@/lib/utils/darken.js';

describe('darken', () => {
  /*
   * ==================== 基本变暗 ====================
   */
  it('应按比例降低红色亮度', () => {
    expect(darken('#FF0000', 0.5)).toBe('#7f0000');
  });

  it('应按比例降低绿色亮度', () => {
    expect(darken('#00FF00', 0.5)).toBe('#007f00');
  });

  it('应按比例降低蓝色亮度', () => {
    expect(darken('#0000FF', 0.5)).toBe('#00007f');
  });

  it('应按比例降低混合颜色亮度', () => {
    expect(darken('#FF6B6B', 0.35)).toBe('#a54545');
  });

  /*
   * ==================== 边界值 ====================
   */
  it('factor 为 0 时应返回原色', () => {
    expect(darken('#FF6B6B', 0)).toBe('#ff6b6b');
  });

  it('factor 为 1 时应返回纯黑', () => {
    expect(darken('#FF6B6B', 1)).toBe('#000000');
  });

  it('应正确处理黑色（不会变负）', () => {
    expect(darken('#000000', 0.5)).toBe('#000000');
  });

  it('应正确处理白色', () => {
    expect(darken('#FFFFFF', 0.5)).toBe('#7f7f7f');
  });

  /*
   * ==================== 精度 ====================
   */
  it('应向下取整确保结果为整数', () => {
    expect(darken('#FF0000', 0.3)).toBe('#b20000');
  });

  it('padStart 应补零保证两位数', () => {
    expect(darken('#0A0A0A', 0.5)).toBe('#050505');
  });
});
