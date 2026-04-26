const getChineseHourDialTheme = (hour) => {
  const map = [
    'Red',
    'White',
    'White',
    'Orange',
    'Orange',
    'Cyan',
    'Cyan',
    'Blue',
    'Blue',
    'Coral',
    'Coral',
    'Purple',
    'Purple',
    'Green',
    'Green',
    'Yellow',
    'Yellow',
    'Pink',
    'Pink',
    'Teal',
    'Teal',
    'Violet',
    'Violet',
    'Red',
  ];

  return map[hour];
};

export default getChineseHourDialTheme;
