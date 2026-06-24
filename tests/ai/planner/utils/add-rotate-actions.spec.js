import addRotateActions from '@/lib/ai/planner/utils/add-rotate-actions.js';

describe('addRotateActions', () => {
  it('count 为 0 时不应添加任何动作', () => {
    const actions = [];
    addRotateActions(actions, 0);
    expect(actions).toEqual([]);
  });

  it('count 为 1 时应添加一个 ROTATE', () => {
    const actions = [];
    addRotateActions(actions, 1);
    expect(actions).toEqual(['ROTATE']);
  });

  it('count 为 3 时应添加三个 ROTATE', () => {
    const actions = [];
    addRotateActions(actions, 3);
    expect(actions).toEqual(['ROTATE', 'ROTATE', 'ROTATE']);
  });

  it('应该追加到已有动作数组后面', () => {
    const actions = ['MOVE_LEFT'];
    addRotateActions(actions, 2);
    expect(actions).toEqual(['MOVE_LEFT', 'ROTATE', 'ROTATE']);
  });
});
