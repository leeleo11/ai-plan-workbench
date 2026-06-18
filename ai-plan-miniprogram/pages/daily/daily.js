// pages/daily/daily.js
var api = require('../../lib/api');

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
    plan: null,
    loading: false,
    error: null,
    showAdjust: false,
    adjustOptions: [
      { text: '太满了', instruction: '用户觉得太满了，请减少任务密度，增加休息时间。' },
      { text: '太松了', instruction: '用户觉得太松了，请增加任务密度，减少空闲时间。' },
      { text: '晚点起床', instruction: '用户想晚点起床，请把起床时间推迟到 10:00 左右，后面的任务顺延。' },
      { text: '多安排休息', instruction: '用户希望多安排休息时间，在每个高强度任务后加入 15-20 分钟休息。' },
      { text: '晚上不学习', instruction: '用户晚上不想学习，请把学习任务集中在上午和下午，晚上只安排生活和休息。' },
      { text: '重新生成', instruction: '' },
    ],
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  onQuickExample(e) {
    this.setData({ inputText: e.currentTarget.dataset.text });
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

    api.generateDailyPlan({
      input: text,
      intensity: this.data.intensity,
      date: this.data.date,
      wakeTime: '08:00',
      sleepTime: '23:00',
    }).then(function (plan) {
      // Add done state to each item
      plan.schedule.forEach(function (item) { item.done = false; });
      this.setData({ plan: plan, loading: false });
      this._saveToHistory(plan);
    }.bind(this)).catch(function (err) {
      // Fallback
      this.setData({
        plan: this._generateLocalFallback(text),
        loading: false,
      });
    }.bind(this));
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
    var instruction = e.currentTarget.dataset.instruction;
    var text = e.currentTarget.dataset.text;

    if (text === '重新生成') {
      this.onGenerate();
      return;
    }

    this.setData({ loading: true, showAdjust: false });

    api.revisePlan(this.data.plan, instruction).then(function (plan) {
      plan.schedule.forEach(function (item) { item.done = false; });
      this.setData({ plan: plan, loading: false });
    }.bind(this)).catch(function (err) {
      wx.showToast({ title: '调整失败，请重试', icon: 'none' });
      this.setData({ loading: false });
    }.bind(this));
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
      if (history.length > 30) history = history.slice(0, 30);
      wx.setStorageSync(key, history);
    } catch (e) {}
  },

  _generateLocalFallback(input) {
    return {
      title: '今日计划',
      summary: '根据你的描述，为你安排了以下日程。',
      date_type: 'today',
      intensity: 'standard',
      schedule: [
        { id: 'item_1', start_time: '08:00', end_time: '08:30', title: '起床、洗漱、早餐', description: '完成洗漱和简单早餐，进入状态。', type: 'life', priority: 'low', difficulty: 'easy', can_skip: false, done: false },
        { id: 'item_2', start_time: '09:00', end_time: '10:30', title: input.substring(0, 15) || '专注工作/学习', description: '集中精力完成最重要的任务。', type: 'study', priority: 'high', difficulty: 'medium', can_skip: false, done: false },
        { id: 'item_3', start_time: '10:30', end_time: '10:45', title: '休息', description: '喝水、活动身体、放松眼睛。', type: 'rest', priority: 'low', difficulty: 'easy', can_skip: false, done: false },
        { id: 'item_4', start_time: '10:45', end_time: '12:00', title: '继续推进任务', description: '回到任务中，保持专注。', type: 'study', priority: 'high', difficulty: 'medium', can_skip: false, done: false },
        { id: 'item_5', start_time: '12:00', end_time: '13:30', title: '午饭 + 午休', description: '吃午饭，适当午休恢复精力。', type: 'meal', priority: 'low', difficulty: 'easy', can_skip: false, done: false },
        { id: 'item_6', start_time: '14:00', end_time: '15:30', title: '下午专注时段', description: '利用下午精力继续推进任务。', type: 'work', priority: 'high', difficulty: 'medium', can_skip: false, done: false },
        { id: 'item_7', start_time: '16:00', end_time: '17:00', title: '运动/散步', description: '出门走走或做一组简单运动。', type: 'exercise', priority: 'medium', difficulty: 'medium', can_skip: true, done: false },
        { id: 'item_8', start_time: '18:00', end_time: '19:00', title: '晚饭 + 放松', description: '吃晚饭，看看视频或聊聊天。', type: 'meal', priority: 'low', difficulty: 'easy', can_skip: false, done: false },
        { id: 'item_9', start_time: '20:00', end_time: '21:00', title: '轻量任务或复盘', description: '回顾今天完成的内容，规划明天。', type: 'study', priority: 'medium', difficulty: 'easy', can_skip: true, done: false },
        { id: 'item_10', start_time: '23:00', end_time: '23:30', title: '准备睡觉', description: '放下手机，准备入睡。', type: 'life', priority: 'low', difficulty: 'easy', can_skip: false, done: false },
      ],
      tips: ['后端暂时不可用，这是本地生成的通用计划。', '建议稍后重试获取 AI 个性化安排。'],
    };
  },
});
