// lib/store.js - 本地存储层
const PLAN_KEY = 'planpal.plans.v2';
const CHAT_KEY = 'planpal.chatState.v2';

// Plan storage
function listPlans() {
  try {
    const raw = wx.getStorageSync(PLAN_KEY);
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}

function savePlan(plan) {
  const existing = listPlans().filter((p) => p.id !== plan.id);
  wx.setStorageSync(PLAN_KEY, [plan, ...existing]);
}

function getLatestPlan() {
  const plans = listPlans();
  return plans[0] || null;
}

function toggleTaskStatus(taskId) {
  const plan = getLatestPlan();
  if (!plan) return null;
  const task = plan.tasks.find((t) => t.id === taskId);
  if (!task) return plan;
  task.status = task.status === 'done' ? 'todo' : 'done';
  savePlan(plan);
  return plan;
}

function updateTaskField(taskId, patch) {
  const plan = getLatestPlan();
  if (!plan) return null;
  const task = plan.tasks.find((t) => t.id === taskId);
  if (!task) return plan;
  Object.assign(task, patch);
  savePlan(plan);
  return plan;
}

// Chat state storage
function loadChatState() {
  try {
    const raw = wx.getStorageSync(CHAT_KEY);
    return raw || null;
  } catch (e) {
    return null;
  }
}

function saveChatState(state) {
  wx.setStorageSync(CHAT_KEY, state);
}

function resetChatState() {
  wx.removeStorageSync(CHAT_KEY);
}

module.exports = {
  listPlans, savePlan, getLatestPlan,
  toggleTaskStatus, updateTaskField,
  loadChatState, saveChatState, resetChatState,
};
