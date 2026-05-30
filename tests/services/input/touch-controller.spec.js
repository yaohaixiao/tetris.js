import TouchController from '@/lib/services/input/touch-controller';

describe('TouchController', () => {
  let mockStore;
  let mockGame;
  let controller;
  let controls;

  beforeEach(() => {
    jest.clearAllMocks();

    controls = {
      back: 'tetris-back',
      hold: 'tetris-hold',
      start: 'tetris-start',
      up: 'tetris-up',
      down: 'tetris-down',
      left: 'tetris-left',
      right: 'tetris-right',
      a: 'tetris-a',
      b: 'tetris-b',
      x: 'tetris-x',
      y: 'tetris-y',
    };

    Object.values(controls).forEach((id) => {
      const el = document.createElement('div');
      el.id = id;
      el.dataset.key = id.replace('tetris-', '');
      document.body.appendChild(el);
    });

    mockStore = {
      getMode: jest.fn().mockReturnValue('playing'),
    };

    mockGame = { id: 'test-uuid' };

    controller = new TouchController({
      Controls: controls,
      Store: mockStore,
      Game: mockGame,
    });
  });

  afterEach(() => {
    Object.values(controls).forEach((id) => {
      const el = document.getElementById(id);
      if (el) document.body.removeChild(el);
    });
  });

  // ==================== 初始化 ====================
  describe('初始化', () => {
    it('level 初始为 0', () => {
      expect(controller.level).toBe(0);
    });

    it('所有 DOM 元素正确获取', () => {
      expect(controller.$a).toBeInstanceOf(HTMLElement);
      expect(controller.$b).toBeInstanceOf(HTMLElement);
      expect(controller.$x).toBeInstanceOf(HTMLElement);
      expect(controller.$y).toBeInstanceOf(HTMLElement);
      expect(controller.$up).toBeInstanceOf(HTMLElement);
      expect(controller.$down).toBeInstanceOf(HTMLElement);
      expect(controller.$left).toBeInstanceOf(HTMLElement);
      expect(controller.$right).toBeInstanceOf(HTMLElement);
      expect(controller.$start).toBeInstanceOf(HTMLElement);
      expect(controller.$back).toBeInstanceOf(HTMLElement);
      expect(controller.$hold).toBeInstanceOf(HTMLElement);
    });
  });

  // ==================== playing 模式 ====================
  describe('playing 模式', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('playing');
    });

    it('A 键发射 TOGGLE_MUSIC', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('A');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'TOGGLE_MUSIC',
        payload: { Game: mockGame },
      });
    });

    it('B 键发射 DROP', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('B');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'DROP',
        payload: { Game: mockGame },
      });
    });

    it('X 键发射 RESTART', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('X');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'RESTART',
        payload: { Game: mockGame },
      });
    });

    it('Y 键发射 TOGGLE_PAUSED', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('Y');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'TOGGLE_PAUSED',
        payload: { Game: mockGame },
      });
    });

    it('HOLD 键发射 HOLD', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('HOLD');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'HOLD',
        payload: { Game: mockGame },
      });
    });

    it('BACK 键发射 QUIT', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('BACK');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'QUIT',
        payload: { Game: mockGame },
      });
    });

    it('DPAD_UP 发射 ROTATE', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('DPAD_UP');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'ROTATE',
        payload: { Game: mockGame },
      });
    });

    it('DPAD_DOWN 发射 MOVE_DOWN', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('DPAD_DOWN');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'MOVE_DOWN',
        payload: { Game: mockGame },
      });
    });

    it('DPAD_LEFT 发射 MOVE_LEFT', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('DPAD_LEFT');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'MOVE_LEFT',
        payload: { Game: mockGame },
      });
    });

    it('DPAD_RIGHT 发射 MOVE_RIGHT', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('DPAD_RIGHT');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'MOVE_RIGHT',
        payload: { Game: mockGame },
      });
    });
  });

  // ==================== main-menu 模式 ====================
  describe('main-menu 模式', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('main-menu');
    });

    it('START 键发射 CONFIRM', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('START');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'CONFIRM',
        payload: { Game: mockGame },
      });
    });

    it('DPAD_UP 增加等级并发射 LEVEL_TWO', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.level = 0;
      controller.dispatchTouch('DPAD_UP');
      expect(controller.level).toBe(1);
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'LEVEL_TWO',
        payload: { Game: mockGame },
      });
    });

    it('DPAD_DOWN 减少等级并发射 LEVEL_TWO', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.level = 2;
      controller.dispatchTouch('DPAD_DOWN');
      expect(controller.level).toBe(1);
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'LEVEL_TWO',
        payload: { Game: mockGame },
      });
    });

    it('DPAD_UP 最高不超过 9', () => {
      controller.level = 9;
      controller.dispatchTouch('DPAD_UP');
      expect(controller.level).toBe(9);
    });

    it('DPAD_DOWN 最低不小于 0', () => {
      controller.level = 0;
      controller.dispatchTouch('DPAD_DOWN');
      expect(controller.level).toBe(0);
    });
  });

  // ==================== difficulty 模式 ====================
  describe('difficulty 模式', () => {
    beforeEach(() => {
      mockStore.getMode.mockReturnValue('difficulty');
    });

    it('A 键发射 EASY', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('A');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'EASY',
        payload: { Game: mockGame },
      });
    });

    it('B 键发射 NORMAL', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('B');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'NORMAL',
        payload: { Game: mockGame },
      });
    });

    it('Y 键发射 HARD', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('Y');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'HARD',
        payload: { Game: mockGame },
      });
    });

    it('X 键发射 EXPERT', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('X');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'EXPERT',
        payload: { Game: mockGame },
      });
    });

    it('BACK 键发射 BACK', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('BACK');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'BACK',
        payload: { Game: mockGame },
      });
    });

    it('START 键发射 CONFIRM', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.dispatchTouch('START');
      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'CONFIRM',
        payload: { Game: mockGame },
      });
    });
  });

  // ==================== 事件绑定 ====================
  describe('事件绑定', () => {
    it('点击按钮触发 emit', () => {
      const spy = jest.spyOn(controller, 'emit');
      mockStore.getMode.mockReturnValue('playing');

      controller.$a.click();

      expect(spy).toHaveBeenCalledWith('dispatch:input', {
        device: 'touch',
        action: 'TOGGLE_MUSIC',
        payload: { Game: mockGame },
      });
    });

    it('removeEventListeners 后点击不触发', () => {
      const spy = jest.spyOn(controller, 'emit');
      controller.removeEventListeners();

      controller.$a.click();

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
