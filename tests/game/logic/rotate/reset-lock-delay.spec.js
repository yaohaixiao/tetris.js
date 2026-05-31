import resetLockDelay from '@/lib/game/logic/rotate/reset-lock-delay.js';

describe('resetLockDelay', () => {
  let mockStore;

  beforeEach(() => {
    mockStore = {
      getState: jest.fn(),
    };
  });

  it('应该将 _lockTimer 重置为 0', () => {
    const curr = { _lockTimer: 500 };
    mockStore.getState.mockReturnValue({ curr });

    resetLockDelay({ Store: mockStore });

    expect(curr._lockTimer).toBe(0);
  });

  it('_lockTimer 为 0 时仍应该保持 0', () => {
    const curr = { _lockTimer: 0 };
    mockStore.getState.mockReturnValue({ curr });

    resetLockDelay({ Store: mockStore });

    expect(curr._lockTimer).toBe(0);
  });

  it('_lockTimer 不存在时不应该崩溃', () => {
    const curr = {};
    mockStore.getState.mockReturnValue({ curr });

    expect(() => resetLockDelay({ Store: mockStore })).not.toThrow();
  });

  it('curr 为 null 时不应该崩溃', () => {
    mockStore.getState.mockReturnValue({ curr: null });

    expect(() => resetLockDelay({ Store: mockStore })).not.toThrow();
  });

  it('应该调用 Store.getState', () => {
    const curr = { _lockTimer: 100 };
    mockStore.getState.mockReturnValue({ curr });

    resetLockDelay({ Store: mockStore });

    expect(mockStore.getState).toHaveBeenCalled();
  });

  it('多次调用应该每次重置', () => {
    const curr = { _lockTimer: 200 };
    mockStore.getState.mockReturnValue({ curr });

    resetLockDelay({ Store: mockStore });
    expect(curr._lockTimer).toBe(0);

    curr._lockTimer = 300;
    resetLockDelay({ Store: mockStore });
    expect(curr._lockTimer).toBe(0);
  });

  it('应该接收 runtime 对象并解构 Store', () => {
    const curr = { _lockTimer: 100 };
    const runtime = { Store: { getState: jest.fn(() => ({ curr })) } };

    resetLockDelay(runtime);

    expect(runtime.Store.getState).toHaveBeenCalled();
    expect(curr._lockTimer).toBe(0);
  });
});
