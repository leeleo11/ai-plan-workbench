var planIntake = require('../../lib/planIntake');
var store = require('../../lib/store');

var pets = planIntake.pets;
var petList = [pets.fox, pets.owl, pets.dog];

var strictnessOptions = [
  { value: 'soft', label: '轻提醒' },
  { value: 'balanced', label: '适中' },
  { value: 'strict', label: '盯得紧' },
];

var granularityOptions = [
  { value: 'light', label: '留白多' },
  { value: 'balanced', label: '平衡' },
  { value: 'detailed', label: '拆得细' },
];

var reminderOptions = [
  { value: 'quiet', label: '安静型' },
  { value: 'checkin', label: '复盘型' },
  { value: 'push', label: '推进型' },
];

Page({
  data: {
    goal: '30天考研英语阅读冲刺',
    petList: petList,
    selectedPetId: 'fox',
    strictnessOptions: strictnessOptions,
    strictness: 'balanced',
    granularityOptions: granularityOptions,
    granularity: 'balanced',
    reminderOptions: reminderOptions,
    reminder: 'checkin',
    hasExistingPlan: false,
  },

  onLoad: function () {
    var existingPlan = store.getLatestPlan();
    if (existingPlan) {
      this.setData({ hasExistingPlan: true });
    }
  },

  onGoalInput: function (e) {
    this.setData({ goal: e.detail.value });
  },

  onSelectPet: function (e) {
    var petId = e.currentTarget.dataset.petId;
    this.setData({ selectedPetId: petId });
    var defaultProfile = planIntake.createDefaultAdvisorProfile(
      pets[petId].defaultStyle
    );
    this.setData({
      strictness: defaultProfile.strictness,
      granularity: defaultProfile.granularity,
      reminder: defaultProfile.reminderStyle,
    });
  },

  onSelectStrictness: function (e) {
    this.setData({ strictness: e.currentTarget.dataset.value });
  },

  onSelectGranularity: function (e) {
    this.setData({ granularity: e.currentTarget.dataset.value });
  },

  onSelectReminder: function (e) {
    this.setData({ reminder: e.currentTarget.dataset.value });
  },

  onTapContinue: function () {
    var goal = this.data.goal.trim();
    if (!goal) {
      wx.showToast({ title: '请输入学习目标', icon: 'none' });
      return;
    }
    var chatState = planIntake.createInitialChatState({
      goal: goal,
      petId: this.data.selectedPetId,
      advisorStyle: pets[this.data.selectedPetId].defaultStyle,
      advisorProfile: {
        strictness: this.data.strictness,
        granularity: this.data.granularity,
        reminderStyle: this.data.reminder,
      },
    });
    store.saveChatState(chatState);
    wx.navigateTo({ url: '/pages/chat/chat' });
  },

  onTapViewPlan: function () {
    wx.navigateTo({ url: '/pages/plan/plan' });
  },

  goToDaily: function () {
    wx.navigateTo({ url: '/pages/daily/daily' });
  },
});
