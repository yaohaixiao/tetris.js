import addMoveActions from '@/lib/ai/utils/add-move-actions.js';

describe('addMoveActions', () => {
  it('delta 为 0 时不应添加任何动作', () => {
    const actions = [];
    addMoveActions(actions, 0);
    expect(actions).toEqual([]);
  });

  it('delta 为正数时应添加 MOVE_RIGHT', () => {
    const actions = [];
    addMoveActions(actions, 3);
    expect(actions).toEqual(['MOVE_RIGHT', 'MOVE_RIGHT', 'MOVE_RIGHT']);
  });

  it('delta 为负数时应添加 MOVE_LEFT', () => {
    const actions = [];
    addMoveActions(actions, -2);
    expect(actions).toEqual(['MOVE_LEFT', 'MOVE_LEFT']);
  });

  it('应该追加到已有动作数组后面', () => {
    const actions = ['ROTATE'];
    addMoveActions(actions, 1);
    expect(actions).toEqual(['ROTATE', 'MOVE_RIGHT']);
  });

  it('delta 为 1 时应添加一个 MOVE_RIGHT', () => {
    const actions = [];
    addMoveActions(actions, 1);
    expect(actions).toEqual(['MOVE_RIGHT']);
  });

  it('delta 为 -1 时应添加一个 MOVE_LEFT', () => {
    const actions = [];
    addMoveActions(actions, -1);
    expect(actions).toEqual(['MOVE_LEFT']);
  });
});
