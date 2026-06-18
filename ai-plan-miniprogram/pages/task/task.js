var store = require('../../lib/store');
var theme = require('../../lib/theme');

var categoryLabel = theme.categoryLabel;
var priorityLabel = theme.priorityLabel;

function formatDate(dateStr) {
  if (!dateStr) return '';
  var parts = dateStr.split('-');
  return parts[0] + ' 年 ' + parseInt(parts[1]) + ' 月 ' + parseInt(parts[2]) + ' 日';
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function tomorrowStr() {
  var d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function dayAfterStr() {
  var d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
}

Page({
  data: {
    taskId: '',
    task: null,
    editMode: false,
    editTitle: '',
    editDesc: '',
    editDate: '',
    editDuration: 0,
    dateQuickButtons: [
      { label: '今天', value: '' },
      { label: '明天', value: '' },
      { label: '后天', value: '' },
    ],
    durationQuickButtons: [30, 45, 60, 90],
  },

  onLoad: function (options) {
    var dates = [todayStr(), tomorrowStr(), dayAfterStr()];
    this.setData({
      taskId: options.id,
      'dateQuickButtons[0].value': dates[0],
      'dateQuickButtons[1].value': dates[1],
      'dateQuickButtons[2].value': dates[2],
    });
    this._loadTask();
  },

  onShow: function () {
    if (this.data.taskId) {
      this._loadTask();
    }
  },

  _loadTask: function () {
    var plan = store.getLatestPlan();
    if (!plan || !plan.tasks) return;
    var task = null;
    for (var i = 0; i < plan.tasks.length; i++) {
      if (plan.tasks[i].id === this.data.taskId) {
        task = plan.tasks[i];
        break;
      }
    }
    if (!task) return;

    var categoryText = categoryLabel[task.category] || task.category || '';
    var priorityText = priorityLabel[task.priority] || task.priority || '';
    var dateDisplay = formatDate(task.date);
    var isDone = task.status === 'done';

    this.setData({
      task: task,
      categoryText: categoryText,
      priorityText: priorityText,
      dateDisplay: dateDisplay,
      isDone: isDone,
      editMode: false,
    });
  },

  onBack: function () {
    wx.navigateBack();
  },

  onToggleStatus: function () {
    store.toggleTaskStatus(this.data.taskId);
    this._loadTask();
  },

  onTapEdit: function () {
    var task = this.data.task;
    if (!task) return;
    this.setData({
      editMode: true,
      editTitle: task.title || '',
      editDesc: task.description || '',
      editDate: task.date || '',
      editDuration: task.durationMinutes || 30,
    });
  },

  onEditTitleInput: function (e) {
    this.setData({ editTitle: e.detail.value });
  },

  onEditDescInput: function (e) {
    this.setData({ editDesc: e.detail.value });
  },

  onEditDateInput: function (e) {
    this.setData({ editDate: e.detail.value });
  },

  onQuickDate: function (e) {
    var value = e.currentTarget.dataset.value;
    this.setData({ editDate: value });
  },

  onQuickDuration: function (e) {
    var value = e.currentTarget.dataset.duration;
    this.setData({ editDuration: parseInt(value) });
  },

  onCancelEdit: function () {
    this.setData({ editMode: false });
  },

  onSaveEdit: function () {
    var title = this.data.editTitle.trim();
    if (!title) {
      wx.showToast({ title: '任务标题不能为空', icon: 'none' });
      return;
    }
    var date = this.data.editDate.trim();
    if (!date) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }
    store.updateTaskField(this.data.taskId, {
      title: title,
      description: this.data.editDesc.trim(),
      date: date,
      durationMinutes: this.data.editDuration,
    });
    this._loadTask();
    wx.showToast({ title: '已保存', icon: 'success' });
  },
});
