import padStart from '@/lib/utils/pad-start.js';

/**
 * # 格式化日期时间。
 *
 * @function formatTime
 * @param {Date} date - 要格式化的日期对象。
 * @param {string} [format='yyyy-MM-dd HH:mm:ss'] - 格式字符串，支持以下占位符：
 *
 *   - `yyyy`: 年份 (例如: 2023)
 *   - `MM`: 月份 (01-12)
 *   - `dd`: 日期 (01-31)
 *   - `HH`: 24小时制小时 (00-23)
 *   - `hh`: 12小时制小时 (01-12), 结合 `a` 使用
 *   - `mm`: 分钟 (00-59)
 *   - `ss`: 秒数 (00-59)
 *   - `a`: AM/PM 指示符 (例如: AM, PM). Default is `'yyyy-MM-dd HH:mm:ss'`
 *
 * @returns {string} 格式化后的日期时间字符串。
 */
const formatTime = (date, format = 'yyyy-MM-dd HH:mm:ss') => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const toSymbol = () => (hours > 12 ? 'PM' : 'AM');
  const hasSymbol = format.includes('a');
  const symbols = {
    yyyy: year,
    MM: padStart(month, 2),
    dd: padStart(day, 2),
    HH: padStart(hours, 2),
    hh: hasSymbol && hours > 12 ? hours - 12 : hours,
    mm: padStart(minutes, 2),
    ss: padStart(seconds, 2),
    // a 表示12小时制
    a: toSymbol(),
  };
  let time = format;

  for (const key of Object.keys(symbols)) {
    time = time.replace(key, symbols[key]);
  }

  return time;
};

export default formatTime;
