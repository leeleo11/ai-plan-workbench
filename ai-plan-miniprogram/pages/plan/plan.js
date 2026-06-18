var store = require('../../lib/store');
var planIntake = require('../../lib/planIntake');

var pets = planIntake.pets;

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

Page({
  data: {
    plan: null,
    petInfo: null,
    goalTitle: '',
    summary: '',
    phases: [],
    phaseCount: 0,
    taskCount: 0,
    totalMinutes: 0,
    totalHours: '0',
    doneCount: 0,
    progressPercent: 0,
    selectedDate: todayStr(),
    todayTasks: [],
    hasPlan: false,
  },

  onShow: function () {
    this._loadPlan();
  },

  _loadPlan: function () {
    var plan = store.getLatestPlan();
    if (!plan) {
      this.setData({ hasPlan: false });
      return;
    }

    var goalTitle = '';
    if (plan.goal && plan.goal.title) {
      goalTitle = plan.goal.title;
    } else if (plan.goal && typeof plan.goal === 'string') {
      goalTitle = plan.goal;
    } else {
      goalTitle = plan.brief ? plan.brief.summary : '学习计划';
    }

    var petInfo = null;
    if (plan.petId && pets[plan.petId]) {
      petInfo = pets[plan.petId];
    }

    var tasks = plan.tasks || [];
    var totalTasks = tasks.length;
    var doneCount = 0;
    var totalMinutes = 0;
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].status === 'done') doneCount++;
      totalMinutes += tasks[i].durationMinutes || 0;
    }
    var progressPercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    var phases = (plan.phases || []).map(function (p) {
      return {
        id: p.id,
        title: p.title,
        startDate: p.startDate,
        endDate: p.endDate,
        objective: p.objective,
      };
    });

    this.setData({
      plan: plan,
      hasPlan: true,
      petInfo: petInfo,
      goalTitle: goalTitle,
      summary: plan.brief ? plan.brief.summary : '',
      phases: phases,
      phaseCount: phases.length,
      taskCount: totalTasks,
      totalMinutes: totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      doneCount: doneCount,
      progressPercent: progressPercent,
    });

    this._filterTodayTasks();
  },

  _filterTodayTasks: function () {
    var plan = this.data.plan;
    if (!plan) return;
    var date = this.data.selectedDate;
    var tasks = plan.tasks || [];
    var todayTasks = [];
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].date === date) {
        todayTasks.push(tasks[i]);
      }
    }
    this.setData({ todayTasks: todayTasks });
  },

  onDayPress: function (e) {
    var date = e.detail.date;
    this.setData({ selectedDate: date });
    this._filterTodayTasks();
  },

  onGoToday: function () {
    var today = todayStr();
    this.setData({ selectedDate: today });
    this._filterTodayTasks();
  },

  onBackToIndex: function () {
    wx.navigateTo({ url: '/pages/index/index' });
  },

  onToggleTask: function (e) {
    var taskId = e.currentTarget.dataset.taskId;
    store.toggleTaskStatus(taskId);
    this._loadPlan();
  },

  onTapTask: function (e) {
    var taskId = e.currentTarget.dataset.taskId;
    wx.navigateTo({ url: '/pages/task/task?id=' + taskId });
  },

  onNavigateAdjust: function () {
    wx.navigateTo({ url: '/pages/index/index' });
  },

  onNavigateStats: function () {
    wx.showToast({ title: '数据统计开发中', icon: 'none' });
  },
});
