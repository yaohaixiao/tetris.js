import COLORS from '@/lib/constants/colors.js';

const {
  WHITE,
  PINK,
  TEAL,
  RED,
  ORANGE,
  DARK_GREEN,
  RGBA_TEAL,
  RGBA_GREEN
} = COLORS;

const ClockThemes = {
  Teal: {
    stroke: TEAL,
    face: RGBA_GREEN,
    secondHand: ORANGE,
  },

  Green: {
    stroke: DARK_GREEN,
    face: RGBA_TEAL,
    secondHand: TEAL,
  },

  Orange: {
    stroke: ORANGE,
    face: RGBA_GREEN,
    secondHand: RED,
  },

  White: {
    stroke: WHITE,
    face: RGBA_TEAL,
    secondHand: PINK,
  },
};

export default ClockThemes;
