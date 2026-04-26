import COLORS from '@/lib/constants/colors.js';

const {
  CORAL,
  RGBA_CORAL,

  WHITE,
  RGBA_WHITE,

  PURPLE,
  RGBA_PURPLE,

  TEAL,
  RGBA_TEAL,

  PINK,
  RGBA_PINK,

  ORANGE,
  RGBA_ORANGE,

  GREEN,
  RGBA_GREEN,

  BLUE,
  RGBA_BLUE,

  YELLOW,
  RGBA_YELLOW,

  RED,
  RGBA_RED,

  VIOLET,
  RGBA_VIOLET,

  CYAN,
  RGBA_CYAN,
} = COLORS;

const ClockThemes = {
  Teal: {
    stroke: TEAL,
    face: RGBA_TEAL,
    secondHand: VIOLET,
  },

  Violet: {
    stroke: VIOLET,
    face: RGBA_VIOLET,
    secondHand: TEAL,
  },

  Yellow: {
    stroke: YELLOW,
    face: RGBA_YELLOW,
    secondHand: PINK,
  },

  Pink: {
    stroke: PINK,
    face: RGBA_PINK,
    secondHand: YELLOW,
  },

  Purple: {
    stroke: PURPLE,
    face: RGBA_PURPLE,
    secondHand: GREEN,
  },

  Green: {
    stroke: GREEN,
    face: RGBA_GREEN,
    secondHand: CYAN,
  },

  Blue: {
    stroke: BLUE,
    face: RGBA_BLUE,
    secondHand: CORAL,
  },

  Coral: {
    stroke: CORAL,
    face: RGBA_CORAL,
    secondHand: BLUE,
  },

  Orange: {
    stroke: ORANGE,
    face: RGBA_ORANGE,
    secondHand: CYAN,
  },

  Cyan: {
    stroke: CYAN,
    face: RGBA_CYAN,
    secondHand: ORANGE,
  },

  White: {
    stroke: WHITE,
    face: RGBA_WHITE,
    secondHand: RED,
  },

  Red: {
    stroke: RED,
    face: RGBA_RED,
    secondHand: WHITE,
  },
};

export default ClockThemes;
