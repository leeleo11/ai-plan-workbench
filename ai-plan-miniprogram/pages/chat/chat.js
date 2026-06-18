var planIntake = require('../../lib/planIntake');
var store = require('../../lib/store');

var STEP_QUESTIONS = {
  goal: '你想达成什么学习目标？',
  dailyTime: '每天大概能投入多少时间？',
  startDate: '计划从哪天开始？',
  level: '你现在的基础大概怎样？',
  supplement: '还有什么要提醒我的？',
};

var STEP_ORDER = ['goal', 'dailyTime', 'startDate', 'level', 'supplement'];

Page({
  data: {
    petId: 'fox',
    petName: '',
    petEmoji: '',
    messages: [],
    currentStep: 'goal',
    inputValue: '',
    showTextInput: true,
    showDailyTimeButtons: false,
    showStartDateButtons: false,
    showLevelButtons: false,
    dailyTimeOptions: [
      { value: 1, label: '1 小时' },
      { value: 1.5, label: '1.5 小时' },
      { value: 2, label: '2 小时' },
      { value: 3, label: '3 小时' },
    ],
    startDateOptions: [
      { value: 'today', label: '今天开始' },
      { value: 'tomorrow', label: '明天开始' },
    ],
    levelOptions: [
      { value: '零基础', label: '零基础' },
      { value: '有基础', label: '有基础' },
      { value: '冲刺提分', label: '冲刺提分' },
    ],
  },

  onLoad: function () {
    var chatState = store.loadChatState();
    if (!chatState) {
      wx.navigateBack();
      return;
    }
    var pet = planIntake.pets[chatState.petId] || planIntake.pets.fox;
    this.chatState = chatState;
    this.setData({
      petId: chatState.petId,
      petName: pet.name,
      petEmoji: pet.emoji,
    });
    this.addAIMessage(STEP_QUESTIONS.goal);
  },

  addAIMessage: function (text) {
    var msg = planIntake.createMessage(text, true);
    this.data.messages.push(msg);
    this.setData({ messages: this.data.messages });
    this.scrollToBottom();
  },

  addUserMessage: function (text) {
    var msg = planIntake.createMessage(text, false);
    this.data.messages.push(msg);
    this.setData({ messages: this.data.messages });
    this.scrollToBottom();
  },

  scrollToBottom: function () {
    var that = this;
    setTimeout(function () {
      that.setData({ scrollTarget: 'msg-bottom' });
    }, 100);
  },

  updateUIForStep: function (step) {
    this.setData({
      currentStep: step,
      showTextInput: step === 'goal' || step === 'supplement',
      showDailyTimeButtons: step === 'dailyTime',
      showStartDateButtons: step === 'startDate',
      showLevelButtons: step === 'level',
      inputValue: '',
    });
  },

  advanceToNextStep: function () {
    var currentIndex = STEP_ORDER.indexOf(this.data.currentStep);
    var nextIndex = currentIndex + 1;
    if (nextIndex >= STEP_ORDER.length) {
      this.finishChat();
      return;
    }
    var nextStep = STEP_ORDER[nextIndex];
    this.chatState.currentStep = nextStep;
    store.saveChatState(this.chatState);
    var that = this;
    setTimeout(function () {
      that.addAIMessage(STEP_QUESTIONS[nextStep]);
      that.updateUIForStep(nextStep);
    }, 400);
  },

  onTextInput: function (e) {
    this.setData({ inputValue: e.detail.value });
  },

  onTextConfirm: function () {
    var value = (this.data.inputValue || '').trim();
    if (!value) return;
    this.handleStepInput(value);
  },

  handleStepInput: function (value) {
    var step = this.data.currentStep;
    this.addUserMessage(value);
    this.chatState[step] = value;
    store.saveChatState(this.chatState);
    this.advanceToNextStep();
  },

  onSelectDailyTime: function (e) {
    var value = e.currentTarget.dataset.value;
    this.handleStepInput(value + ' 小时');
    this.chatState.dailyTime = value;
    store.saveChatState(this.chatState);
  },

  onSelectStartDate: function (e) {
    var option = e.currentTarget.dataset.value;
    var today = new Date().toISOString().split('T')[0];
    var tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    var dateStr = option === 'today' ? today : tomorrow;
    this.handleStepInput(option === 'today' ? '今天开始' : '明天开始');
    this.chatState.startDate = dateStr;
    store.saveChatState(this.chatState);
  },

  onSelectLevel: function (e) {
    var value = e.currentTarget.dataset.value;
    this.handleStepInput(value);
    this.chatState.level = value;
    store.saveChatState(this.chatState);
  },

  finishChat: function () {
    store.saveChatState(this.chatState);
    wx.navigateTo({ url: '/pages/generating/generating' });
  },
});
