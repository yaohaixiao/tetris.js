import GamepadController from '@/lib/services/input/gamepad-controller.js';
import Keyboard from '@/lib/services/input/keyboard.js';

const Input = {
  Gamepad: new GamepadController(),
  Keyboards: Keyboard,
};

export default Input;
