// lib/api.js - API 调用层
const app = getApp();

function generatePlan(params) {
  return new Promise((resolve, reject) => {
    const body = typeof params === 'string'
      ? { input: params }
      : {
          goal: params.goal,
          dailyTime: params.dailyTime,
          startDate: params.startDate,
          level: params.level,
          supplement: params.supplement,
        };

    wx.request({
      url: `${app.globalData.apiBase}/api/plans/generate`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: body,
      success(res) {
        if (res.statusCode === 200 && res.data.plan) {
          resolve(res.data.plan);
        } else {
          reject(new Error(res.data.error || '计划生成失败'));
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'));
      },
    });
  });
}

module.exports = { generatePlan };
