const getChineseHourCharacter = (hour) => {
  const map = [
    'zi',
    'chou',
    'chou',
    'yin',
    'yin',
    'mao',
    'mao',
    'chen',
    'chen',
    'si',
    'si',
    'wu',
    'wu',
    'wei',
    'wei',
    'shen',
    'shen',
    'you',
    'you',
    'xu',
    'xu',
    'hai',
    'hai',
    'zi',
  ];

  return map[hour];
};

export default getChineseHourCharacter;
