import padStart from './pad-start.js';

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
