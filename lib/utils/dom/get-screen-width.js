/**
 * ============================================================
 *
 * # 获取屏幕宽度
 *
 * ============================================================
 *
 * 取 screen.width 与 screen.availWidth 中的较大值， 确保在移动端横屏等场景下获得准确的屏幕宽度。
 *
 * @function getScreenWidth
 * @returns {number} 屏幕宽度（像素）
 */
const getScreenWidth = () => Math.max(screen.width, screen.availWidth);

export default getScreenWidth;
