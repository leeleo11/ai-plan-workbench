const assert = require('node:assert/strict');
const test = require('node:test');

const { buildPlanPrompt } = require('../.tmp-test/planIntake.js');

test('builds a study advisor prompt for exam planning', () => {
  const prompt = buildPlanPrompt({
    goal: '30天考研英语阅读冲刺',
    petId: 'owl',
    advisorStyle: 'coach',
    planMode: 'exam',
    advisorProfile: {
      strictness: 'strict',
      granularity: 'detailed',
      reminderStyle: 'checkin',
    },
    dailyTime: 2,
    startDate: '2026-06-12',
    level: '有基础',
    supplement: '阅读正确率不稳定，晚上学习',
  });

  assert.match(prompt, /study exam plan/i);
  assert.match(prompt, /30天考研英语阅读冲刺/);
  assert.match(prompt, /每天 2 小时/);
  assert.match(prompt, /2026-06-12/);
  assert.match(prompt, /双层结构/);
  assert.match(prompt, /阶段路线/);
  assert.match(prompt, /每日任务/);
  assert.match(prompt, /owl/i);
  assert.match(prompt, /strict/i);
  assert.match(prompt, /detailed/i);
});
