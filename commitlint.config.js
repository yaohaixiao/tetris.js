/**
 * Commitlint.configuration.js - git commit 校验配置
 *
 * Commit 类型：
 *
 * - Build：主要目的是修改项目构建系统(例如 glup，webpack，rollup 的配置等)的提交
 * - Ci：主要目的是修改项目继续集成流程(例如 Travis，Jenkins，GitLab CI，Circle等)的提交
 * - Docs：文档更新
 * - Feat：新增功能
 * - Fix：bug 修复
 * - Pref：性能优化
 * - Refactor：重构代码(既没有新增功能，也没有修复 bug)
 * - Style：不影响程序逻辑的代码修改(修改空白字符，补全缺失的分号等)
 * - Test：新增测试用例或是更新现有测试 revert：回滚某个更早之前的提交
 * - Chore：不属于以上类型的其他类型(日常事务)
 *
 * @see https://github.com/conventional-changelog/commitlint
 * @see https://typicode.github.io/husky/#/?id
 *
 * Created By: Yaohaixiao
 * Update: 2026.1.10
 */
const TYPES = [
  'build',
  'ci',
  'chore',
  'docs',
  'feat',
  'fix',
  'pref',
  'refactor',
  'revert',
  'style',
  'test',
];

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', TYPES],
    'type-case': [0],
    'type-empty': [0],
    'scope-empty': [0],
    'scope-case': [0],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 72],
  },
};
