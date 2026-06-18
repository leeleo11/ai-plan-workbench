var store = require('../../lib/store');
var api = require('../../lib/api');
var localPlan = require('../../lib/localPlan');

Page({
  data: {
    statusText: '正在请求 AI 生成个性化计划...',
    hasError: false,
    errorMsg: '',
  },

  onLoad: function () {
    this.generate();
  },

  generate: function () {
    var that = this;
    var chatState = store.loadChatState();

    if (!chatState) {
      wx.navigateBack();
      return;
    }

    that.setData({ hasError: false, statusText: '正在请求 AI 生成个性化计划...' });

    var params = {
      goal: chatState.goal,
      dailyTime: chatState.dailyTime,
      startDate: chatState.startDate,
      level: chatState.level,
      supplement: chatState.supplement,
    };

    api
      .generatePlan(params)
      .then(function (plan) {
        store.savePlan(plan);
        wx.redirectTo({ url: '/pages/plan/plan' });
      })
      .catch(function () {
        try {
          that.setData({ statusText: 'AI 不可用，正在使用本地模板生成...' });
          var localResult = localPlan.createLocalStudyPlan(chatState);
          store.savePlan(localResult);
          wx.redirectTo({ url: '/pages/plan/plan' });
        } catch (err) {
          that.setData({
            hasError: true,
            errorMsg: '生成计划失败：' + (err.message || '未知错误'),
          });
        }
      });
  },

  onRetry: function () {
    this.generate();
  },
});
