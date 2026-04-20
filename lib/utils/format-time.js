import padStart from '@/lib/utils/pad-start.js';

/**
 * # 格式化日期时间为指定字符串格式
 *
 * 支持常见时间占位符替换，适用于日志、UI展示等场景。
 *
 * 支持占位符：
 * - yyyy: 四位年份 (2026)
 * - MM: 月份 (01-12)
 * - dd: 日期 (01-31)
 * - HH: 24小时制小时 (00-23)
 * - hh: 12小时制小时 (01-12)
 * - mm: 分钟 (00-59)
 * - ss: 秒 (00-59)
 * - a: AM / PM
 *
 * 示例：
 * ```js
 * formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss')
 * formatTime(new Date(), 'yyyy/MM/dd hh:mm:ss a')
 * ```
 *
 * @function formatTime
 * @param {Date} date - 要格式化的日期对象
 * @param {string} [format='yyyy-MM-dd HH:mm:ss'] - 格式字符串
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = (date, format = 'yyyy-MM-dd HH:mm:ss') => {
  // ======== 基础时间拆解 ========
  const year = date.getFullYear();       // 年
  const month = date.getMonth() + 1;     // 月（0-11 → 1-12）
  const day = date.getDate();            // 日
  const hours = date.getHours();         // 小时（0-23）
  const minutes = date.getMinutes();     // 分
  const seconds = date.getSeconds();     // 秒

  // ======== AM / PM 处理 ========
  const toSymbol = () => (hours >= 12 ? 'PM' : 'AM');
  const hasSymbol = format.includes('a');

  // ======== 12小时制处理 ========
  const hour12 = hours % 12 || 12; // 0 → 12

  // ======== 占位符映射表 ========
  const symbols = {
    yyyy: year,
    MM: padStart(month, 2),
    dd: padStart(day, 2),
    HH: padStart(hours, 2),
    hh: padStart(hour12, 2),
    mm: padStart(minutes, 2),
    ss: padStart(seconds, 2),
    a: hasSymbol ? toSymbol() : '',
  };

  let time = format;

  // ======== 执行全局替换（关键修复点） ========
  for (const key of Object.keys(symbols)) {
    // 使用正则全局替换，避免只替换一次的问题
    time = time.replace(new RegExp(key, 'g'), symbols[key]);
  }

  return time;
};

export default formatTime;
