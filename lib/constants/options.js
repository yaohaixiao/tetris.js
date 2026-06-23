const OPTIONS = {
  MODE_OPTIONS: [
    { key: 'S', label: 'SINGLE', mode: 'single', players: ['human'] },
    {
      key: 'B',
      label: 'BATTLE',
      mode: 'versus',
      players: ['human', 'ai'],
    },
  ],

  BATTLE_OPTIONS: [
    { key: 'A', label: 'VS AI   ', players: ['human', 'ai'] },
    { key: 'H', label: 'VS HUMAN', players: ['human', 'human'] },
  ],
};

export default OPTIONS;
