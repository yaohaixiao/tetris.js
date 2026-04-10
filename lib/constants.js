// 游戏面板尺寸
export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;

export const CLEAR_SCORES = [0, 100, 300, 500, 800];

export const MAX_LEVEL = 10

// 7种方块形状与颜色
export const TETROMINOES = [
  { shape: [[1, 1, 1, 1]], color: '#0ff' },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#ff0',
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#a0a',
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#00f',
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#f80',
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#0f0',
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#f00',
  },
];


