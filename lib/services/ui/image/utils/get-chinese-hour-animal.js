const getChineseHourAnimal = (hour) => {
  const map = [
    'rat',
    'ox',
    'ox',
    'tiger',
    'tiger',
    'rabbit',
    'rabbit',
    'dragon',
    'dragon',
    'snake',
    'snake',
    'horse',
    'horse',
    'goat',
    'goat',
    'monkey',
    'monkey',
    'rooster',
    'rooster',
    'dog',
    'dog',
    'pig',
    'pig',
    'rat',
  ];

  return map[hour];
};

export default getChineseHourAnimal;
