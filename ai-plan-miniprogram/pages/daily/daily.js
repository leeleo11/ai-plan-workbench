// pages/daily/daily.js
var store = require('../../lib/store');
var app = getApp();

Page({
  data: {
    inputText: '',
    intensity: '标准模式',
    intensityOptions: ['轻松模式', '标准模式', '高效模式', '冲刺模式'],
    date: '今天',
    dateOptions: ['今天', '明天'],
    quickExamples: [
      '今天想学习和运动',
      '明天要面试，帮我安排',
      '周末想放松但别浪费',
      '帮我安排一个高效的一天',
    ],
    // Result state
    plan: null,
    loading: false,
    error: null,
    // Adjustments
    showAdjust: false,
    adjustOptions: [
      '太满了，轻松一点',
      '太松了，紧凑一些',
      '多安排休息时间',
      '加入运动',
      '晚上别安排学习',
      '重新生成',
    ],
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  onQuickExample(e) {
    var text = e.currentTarget.dataset.text;
    this.setData({ inputText: text });
  },

  onSelectIntensity(e) {
    this.setData({ intensity: e.currentTarget.dataset.value });
  },

  onSelectDate(e) {
    this.setData({ date: e.currentTarget.dataset.value });
  },

  onGenerate() {
    var text = this.data.inputText.trim();
    if (!text) return;

    this.setData({ loading: true, error: null, plan: null, showAdjust: false });

    wx.request({
      url: app.globalData.apiBase + '/api/plans/daily',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: {
        input: text,
        intensity: this.data.intensity,
        date: this.data.date,
        wakeTime: '08:00',
        sleepTime: '23:00',
      },
      success: function (res) {
        if (res.statusCode === 200 && res.data.plan) {
          this.setData({ plan: res.data.plan, loading: false });
          // Save to history
          this._saveToHistory(res.data.plan);
        } else {
          this.setData({
            error: res.data.error || '生成失败，请重试',
            loading: false,
          });
        }
      }.bind(this),
      fail: function (err) {
        // Fallback: generate a simple local plan
        this.setData({
          plan: this._generateLocalFallback(text),
          loading: false,
        });
      }.bind(this),
    });
  },

  onToggleDone(e) {
    var index = e.currentTarget.dataset.index;
    var plan = this.data.plan;
    if (!plan || !plan.schedule[index]) return;
    plan.schedule[index].done = !plan.schedule[index].done;
    this.setData({ plan: plan });
  },

  onShowAdjust() {
    this.setData({ showAdjust: !this.data.showAdjust });
  },

  onAdjust(e) {
    var text = e.currentTarget.dataset.text;
    var newInput = this.data.inputText + '，' + text;
    this.setData({ inputText: newInput, showAdjust: false });
    this.onGenerate();
  },

  getCompletionStats() {
    var plan = this.data.plan;
    if (!plan || !plan.schedule) return { done: 0, total: 0, percent: 0 };
    var total = plan.schedule.length;
    var done = plan.schedule.filter(function (s) { return s.done; }).length;
    return { done: done, total: total, percent: total > 0 ? Math.round(done / total * 100) : 0 };
  },

  onBack() {
    this.setData({ plan: null, error: null, showAdjust: false });
  },

  _saveToHistory(plan) {
    try {
      var key = 'planpal.daily_history';
      var history = wx.getStorageSync(key) || [];
      history.unshift({
        date: new Date().toISOString().split('T')[0],
        input: this.data.inputText,
        plan: plan,
        timestamp: Date.now(),
      });
      // Keep last 30 entries
      if (history.length > 30) history = history.slice(0, 30);
      wx.setStorageSync(key, history);
    } catch (e) {}
  },

  _generateLocalFallback(input) {
    return {
      title: '今日计划',
      summary: '根据你的描述，为你安排了以下日程。',
      schedule: [
        { time: '08:00 - 08:30', task: '起床、洗漱、早餐', type: 'life', priority: 'low', done: false },
        { time: '09:00 - 10:30', task: input.substring(0, 20) || '专注工作/学习', type: 'study', priority: 'high', done: false },
        { time: '10:30 - 10:45', task: '休息、喝水', type: 'rest', priority: 'low', done: false },
        { time: '10:45 - 12:00', task: '继续推进任务', type: 'study', priority: 'high', done: false },
        { time: '12:00 - 13:30', task: '午饭 + 午休', type: 'life', priority: 'low', done: false },
        { time: '14:00 - 15:30', task: '下午专注时段', type: 'work', priority: 'high', done: false },
        { time: '16:00 - 17:00', task: '运动/散步', type: 'exercise', priority: 'medium', done: false },
        { time: '18:00 - 19:00', task: '晚饭 + 放松', type: 'life', priority: 'low', done: false },
        { time: '20:00 - 21:00', task: '轻量任务或复盘', type: 'study', priority: 'medium', done: false },
        { time: '23:00', task: '准备睡觉', type: 'life', priority: 'low', done: false },
      ],
      tips: ['后端暂时不可用，这是本地生成的通用计划。', '建议稍后重试获取 AI 个性化安排。'],
    };
  },
});
