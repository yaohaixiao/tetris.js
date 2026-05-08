// cypress/e2e/tetris.cy.js

describe('Tetris E2E', () => {
  beforeEach(() => {
    cy.visit('/tetris.html');
  });

  // ========== 页面加载 ==========
  it('页面加载显示所有元素', () => {
    cy.get('#game-board').should('be.visible');
    cy.get('#next-piece').should('be.visible');
    cy.get('#score').should('be.visible');
    cy.get('#lines').should('be.visible');
    cy.get('#level').should('be.visible');
    cy.get('#high-score').should('be.visible');
  });

  // ========== 主菜单：等级选择 ==========
  describe('主菜单 - 等级选择', () => {
    it('按 1 键选择等级 1', () => {
      cy.get('body').type('1');
      cy.get('#level').should('contain', '01');
    });

    it('按 5 键选择等级 5', () => {
      cy.get('body').type('5');
      cy.get('#level').should('contain', '05');
    });

    it('按 T 键选择等级 10', () => {
      cy.get('body').type('t');
      cy.get('#level').should('contain', '10');
    });
  });

  // ========== 难度选择 ==========
  describe('难度选择', () => {
    it('Enter 进入难度选择界面', () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('#game-board[data-mode="difficulty"]').should('exist');
    });

    it('按 E 选择 Easy 并确认开始', () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.get('#game-board').should('be.visible');
    });

    it('按 N 选择 Normal 并确认开始', () => {
      cy.get('body').type('3');
      cy.get('body').type('{enter}');
      cy.get('body').type('n');
      cy.get('body').type('{enter}');
      cy.get('#game-board').should('be.visible');
    });

    it('按 H 选择 Hard 并确认开始', () => {
      cy.get('body').type('5');
      cy.get('body').type('{enter}');
      cy.get('body').type('h');
      cy.get('body').type('{enter}');
      cy.get('#game-board').should('be.visible');
    });

    it('按 X 选择 Expert 并确认开始', () => {
      cy.get('body').type('9');
      cy.get('body').type('{enter}');
      cy.get('body').type('x');
      cy.get('body').type('{enter}');
      cy.get('#game-board').should('be.visible');
    });

    it('难度选择界面按 B 返回等级选择', () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('b');
      cy.get('body').type('3');
      cy.get('#level').should('contain', '03');
    });
  });

  // ========== 游戏中操作 ==========
  describe('游戏中操作', () => {
    const startGame = () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
    };

    it('完整开始流程：选等级 → 难度 → 开始 → 倒计时', () => {
      startGame();
      cy.get('#game-board').should('be.visible');
    });

    it('方向键移动方块', () => {
      startGame();

      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type(' ');
    });

    it('P 暂停 / 恢复', () => {
      startGame();

      cy.get('body').type('p');
      cy.wait(500);
      cy.get('body').type('p');
      cy.wait(500);

      cy.get('#game-board').should('be.visible');
    });

    it('M 切换背景音乐', () => {
      startGame();

      cy.get('body').type('m');
      cy.wait(300);
      cy.get('body').type('m');

      cy.get('#game-board').should('be.visible');
    });

    it('R 重新开始', () => {
      startGame();

      cy.get('body').type('r');
      cy.wait(2000);

      cy.get('#game-board').should('be.visible');
    });
  });

  // ========== Replay 回放 ==========
  // ========== Replay 回放 ==========
  describe('Replay 回放', () => {
    const playAndTriggerReplay = () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);

      // 做些操作产生记录
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type(' ').wait(300);
      cy.get('body').type('{leftarrow}');
      cy.get('body').type(' ').wait(300);
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type(' ');

      // 按 Q 强制结束，触发 replay
      cy.get('body').type('q');
      cy.wait(500);
    };

    it('按 Q 强制结束后自动进入回放，HUD 归零', () => {
      playAndTriggerReplay();

      cy.get('#game-board[data-mode="replay"]').should('exist');
      cy.get('#score').should('contain', '00000');
      cy.get('#lines').should('contain', '00');
      cy.get('#level').should('contain', '01');
    });

    it('回放期间键盘只有 Enter 有效，其他键不报错', () => {
      playAndTriggerReplay();

      cy.get('#game-board[data-mode="replay"]').should('exist');

      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type('p');
      cy.get('body').type('r');
      cy.get('body').type('m');
      cy.get('body').type('{enter}');

      cy.get('#game-board').should('be.visible');
    });

    it('回放结束后进入 game-over，画布可见', () => {
      playAndTriggerReplay();

      cy.get('#game-board[data-mode="game-over"]', { timeout: 30000 }).should(
        'exist',
      );
      cy.get('#game-board').should('be.visible');
      cy.get('#score').should('be.visible');
    });

    it('回放结束后 high-score 已显示', () => {
      playAndTriggerReplay();

      cy.get('#game-board[data-mode="game-over"]', { timeout: 30000 }).should(
        'exist',
      );
      cy.get('#high-score').should('be.visible');
    });

    it('game-over 后按 Enter 回到主菜单，分数清零', () => {
      playAndTriggerReplay();

      cy.get('#game-board[data-mode="game-over"]', { timeout: 30000 }).should(
        'exist',
      );

      cy.get('body').type('{enter}');
      cy.get('#game-board[data-mode="main-menu"]').should('exist');
      cy.get('#score').should('contain', '00000');
    });

    it('回放结束后可重新开始游戏', () => {
      playAndTriggerReplay();

      cy.get('#game-board[data-mode="game-over"]', { timeout: 30000 }).should(
        'exist',
      );
      cy.get('body').type('{enter}');
      cy.get('#game-board[data-mode="main-menu"]').should('exist');

      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);

      cy.get('#game-board').should('be.visible');
    });
  });
});
