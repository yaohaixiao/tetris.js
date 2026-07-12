import padStart from '@/lib/utils/string/pad-start.js';

/**
 * ============================================================
 *
 * # 格式化日期时间为指定字符串格式
 *
 * ============================================================
 *
 * 支持常见时间占位符替换，适用于日志、UI 展示等场景。
 *
 * ## 支持占位符
 *
 * | 占位符 | 说明             | 示例  |
 * | :----- | :--------------- | :---- |
 * | yyyy   | 四位年份         | 2026  |
 * | MM     | 月份（补零）     | 01-12 |
 * | dd     | 日期（补零）     | 01-31 |
 * | HH     | 24小时制（补零） | 00-23 |
 * | hh     | 12小时制（补零） | 01-12 |
 * | mm     | 分钟（补零）     | 00-59 |
 * | ss     | 秒（补零）       | 00-59 |
 * | a      | AM / PM          | AM    |
 *
 * ## 示例
 *
 * ```javascript
 * formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss');
 * formatTime(new Date(), 'yyyy/MM/dd hh:mm:ss a');
 * ```
 *
 * @function formatTime
 * @param {Date} date - 要格式化的日期对象
 * @param {string} [format='yyyy-MM-dd HH:mm:ss'] - 格式字符串. Default is
 *   `'yyyy-MM-dd HH:mm:ss'`
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = (date, format = 'yyyy-MM-dd HH:mm:ss') => {
  /*
   * ============================================================
   * 步骤 1：基础时间拆解
   * ============================================================
   */
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  /*
   * ============================================================
   * 步骤 2：AM / PM 与 12 小时制处理
   * ============================================================
   */
  const toSymbol = () => (hours >= 12 ? 'PM' : 'AM');
  const hasSymbol = format.includes('a');
  const hour12 = hours % 12 || 12;

  /*
   * ============================================================
   * 步骤 3：构建占位符映射表
   * ============================================================
   */
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

  /*
   * ============================================================
   * 步骤 4：执行全局替换
   * ============================================================
   *
   * 使用正则全局替换每个占位符，
   * 避免 replace 只替换第一个匹配的问题。
   * ============================================================
   */
  let time = format;

  for (const key of Object.keys(symbols)) {
    time = time.replaceAll(new RegExp(key, 'g'), symbols[key]);
  }

  return time;
};

export default formatTime;
