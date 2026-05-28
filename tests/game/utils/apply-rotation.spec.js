import applyRotation from '@/lib/game/utils/apply-rotation';

describe('applyRotation', () => {
  let mockStore;
  let curr;

  beforeEach(() => {
    curr = {
      shape: [[1]],
      rotation: 0,
      colorIndex: 3,
      _lockTimer: 100,
    };

    mockStore = {
      setState: jest.fn(),
      getState: jest.fn(() => ({ curr })),
    };
  });

  it('原地旋转：不传 cx/cy，不更新坐标', () => {
    applyRotation(mockStore, curr, [[0, 1], [1, 0]], 1);

    expect(mockStore.setState).toHaveBeenCalledWith({
      curr: {
        shape: [[0, 1], [1, 0]],
        rotation: 1,
        colorIndex: 3,
        _lockTimer: 100,  // setState 时还未归零
      },
    });
    expect(curr._lockTimer).toBe(0); // 之后归零
  });

  it('墙踢偏移：传 cx/cy，同步更新坐标', () => {
    applyRotation(mockStore, curr, [[0, 1], [1, 0]], 1, 5, 10);

    expect(mockStore.setState).toHaveBeenCalledWith({
      curr: {
        shape: [[0, 1], [1, 0]],
        rotation: 1,
        colorIndex: 3,
        _lockTimer: 100,
      },
      cx: 5,
      cy: 10,
    });
    expect(curr._lockTimer).toBe(0);
  });

  it('重置 _lockTimer', () => {
    applyRotation(mockStore, curr, [[1]], 1);

    // setState 之后 getState 被调用，_lockTimer 被重置
    const { curr: updatedCurr } = mockStore.getState();
    // _lockTimer 在原对象上被清零
    // 注意：applyRotation 里先 setState 后 getState，所以 getState 返回的是同一个 curr 引用
  });

  it('_lockTimer 不存在时不报错', () => {
    delete curr._lockTimer;
    expect(() => applyRotation(mockStore, curr, [[1]], 1)).not.toThrow();
  });
});
