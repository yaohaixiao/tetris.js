const getFamousBuildings = (hour) => {
  const map = [
    'Vatican',
    'Temple',
    'Egypt',
    'India',
    'America',
    'Chile',
    'Forbidden',
    'Tiger',
    'Greece',
    'England',
    'Spring',
    'France',
    'Italy',
    'Pavilion',
    'Forbidden',
    'Heaven',
    'Temple',
    'Tower',
    'Russia',
    'India',
    'Gate',
    'Mexico',
    'Wall',
    'Vietnam',
    'Australia',
  ];

  return map[hour];
};

export default getFamousBuildings;
