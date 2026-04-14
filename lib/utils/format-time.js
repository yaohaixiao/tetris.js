import pad from './pad.js';

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
    MM: pad(month, 2),
    dd: pad(day, 2),
    HH: pad(hours, 2),
    hh: hasSymbol && hours > 12 ? hours - 12 : hours,
    mm: pad(minutes, 2),
    ss: pad(seconds, 2),
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
