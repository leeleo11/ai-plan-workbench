Component({
  properties: {
    plan: { type: Object, value: null },
    selectedDate: { type: String, value: '' },
  },
  data: {
    viewYear: 0,
    viewMonth: 0,
    cells: [],
    weekDays: ['一', '二', '三', '四', '五', '六', '日'],
    today: '',
    taskMap: {},
  },
  lifetimes: {
    attached() {
      var today = new Date().toISOString().split('T')[0];
      var initial = this.data.selectedDate || today;
      var parts = initial.split('-');
      this.setData({
        today: today,
        viewYear: parseInt(parts[0]),
        viewMonth: parseInt(parts[1]) - 1,
      });
      this._buildTaskMap();
      this._buildCells();
    },
  },
  observers: {
    'plan': function () {
      this._buildTaskMap();
      this._buildCells();
    },
    'selectedDate': function () {
      this._buildCells();
    },
  },
  methods: {
    _buildTaskMap() {
      var plan = this.data.plan;
      if (!plan || !plan.tasks) return;
      var map = {};
      plan.tasks.forEach(function (task) {
        if (!map[task.date]) map[task.date] = { total: 0, done: 0 };
        map[task.date].total++;
        if (task.status === 'done') map[task.date].done++;
      });
      this.setData({ taskMap: map });
    },
    _buildCells() {
      var year = this.data.viewYear;
      var month = this.data.viewMonth;
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var firstDay = new Date(year, month, 1).getDay();
      var offset = firstDay === 0 ? 6 : firstDay - 1;
      var cells = [];
      for (var i = 0; i < offset; i++) cells.push({ day: 0, key: 'e' + i });
      for (var d = 1; d <= daysInMonth; d++) {
        var date = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var info = this.data.taskMap[date];
        cells.push({
          day: d,
          date: date,
          key: date,
          hasTasks: info && info.total > 0,
          allDone: info && info.done === info.total && info.total > 0,
          isToday: date === this.data.today,
          isSelected: date === this.data.selectedDate,
          doneText: info ? info.done + '/' + info.total : '',
        });
      }
      this.setData({ cells: cells, monthTitle: year + ' 年 ' + (month + 1) + ' 月' });
    },
    prevMonth() {
      var m = this.data.viewMonth;
      var y = this.data.viewYear;
      if (m === 0) { this.setData({ viewYear: y - 1, viewMonth: 11 }); }
      else { this.setData({ viewMonth: m - 1 }); }
      this._buildCells();
    },
    nextMonth() {
      var m = this.data.viewMonth;
      var y = this.data.viewYear;
      if (m === 11) { this.setData({ viewYear: y + 1, viewMonth: 0 }); }
      else { this.setData({ viewMonth: m + 1 }); }
      this._buildCells();
    },
    onDayTap(e) {
      var date = e.currentTarget.dataset.date;
      if (date) this.triggerEvent('daypress', { date: date });
    },
  },
});
