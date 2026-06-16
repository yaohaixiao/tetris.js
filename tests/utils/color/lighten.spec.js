import lighten from '@/lib/utils/color/lighten.js';

describe('lighten', () => {
  // ==================== 基本变亮 ====================
  it('应按比例提亮红色', () => {
    expect(lighten('#800000', 0.5)).toBe('#bf7f7f');
  });

  it('应按比例提亮绿色', () => {
    expect(lighten('#008000', 0.5)).toBe('#7fbf7f');
  });

  it('应按比例提亮蓝色', () => {
    expect(lighten('#000080', 0.5)).toBe('#7f7fbf');
  });

  it('应按比例提亮混合颜色', () => {
    expect(lighten('#804040', 0.5)).toBe('#bf9f9f');
  });

  // ==================== 3 位简写 ====================
  it('应支持 3 位简写 #444', () => {
    expect(lighten('#444', 0.6)).toBe('#b4b4b4');
  });

  it('应支持 3 位简写 #000', () => {
    expect(lighten('#000', 0.5)).toBe('#7f7f7f');
  });

  it('应支持 3 位简写 #fff', () => {
    expect(lighten('#fff', 0.5)).toBe('#ffffff');
  });

  it('应支持 3 位简写 #f80', () => {
    expect(lighten('#f80', 0.5)).toBe('#ffc37f');
  });

  // ==================== 边界值 ====================
  it('factor 为 0 时应返回原色', () => {
    expect(lighten('#804040', 0)).toBe('#804040');
  });

  it('factor 为 1 时应返回纯白', () => {
    expect(lighten('#804040', 1)).toBe('#ffffff');
  });

  it('应正确处理白色（不会超过 255）', () => {
    expect(lighten('#FFFFFF', 0.5)).toBe('#ffffff');
  });

  it('应正确处理黑色', () => {
    expect(lighten('#000000', 0.5)).toBe('#7f7f7f');
  });

  // ==================== 精度 ====================
  it('应向下取整确保结果为整数', () => {
    expect(lighten('#0080FF', 0.3)).toBe('#4ca6ff');
  });

  it('padStart 应补零保证两位数', () => {
    expect(lighten('#050505', 0.5)).toBe('#828282');
  });
});
