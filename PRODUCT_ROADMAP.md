# AI 计划工作台 - 产品路线图

## 📋 产品定位

**核心定位**：帮你把目标变成现实的 AI 执行教练

**差异化**：
- ❌ 不是"计划版豆包"（只生成建议）
- ✅ 而是"AI 执行教练"（确保完成）

**Slogan**：90 天，从计划到实现

---

## 🎯 产品愿景

### 短期目标（3个月）
成为最懂用户的 AI 计划助手，帮助用户真正完成目标

### 中期目标（6-12个月）
在考试备考场景成为第一选择（雅思、考研、公务员等）

### 长期目标（1-2年）
成为覆盖学习、健身、项目管理的 AI 执行教练平台

---

## 🚀 三阶段发展路径

### 阶段 1：MVP 强化（1-2周）
**目标**：让用户养成每天打卡的习惯

**核心指标**：
- 7 日留存率 > 40%
- 平均打卡天数 > 5 天
- 任务完成率 > 60%

**功能清单**：
- [x] AI 生成计划（已完成）
- [x] 任务打卡管理（已完成）
- [x] 三视图展示（已完成）
- [ ] 导入计划功能
- [ ] 本地通知提醒
- [ ] 数据统计页面
- [ ] 打卡动画优化

---

### 阶段 2：AI 教练（2-3周）
**目标**：AI 真正理解用户，提供个性化建议

**核心指标**：
- AI 建议采纳率 > 50%
- 用户对话次数 > 3 次/周
- 难度自适应准确率 > 70%

**功能清单**：
- [ ] AI 每日复盘对话
- [ ] 智能难度调整
- [ ] 基于数据的建议
- [ ] 一键应用建议
- [ ] 进度预测和风险预警
- [ ] AI 教练人设和名字

---

### 阶段 3：垂直场景（1个月）
**目标**：在考试备考场景做到专业和深度

**核心指标**：
- 考试备考用户占比 > 60%
- 场景功能使用率 > 40%
- 用户推荐率（NPS）> 8

**功能清单**：
- [ ] 真题进度追踪
- [ ] 错题本功能
- [ ] 模考时间规划
- [ ] 各科目平衡建议
- [ ] 学习资料推荐
- [ ] 学长经验分享

---

## 📊 功能优先级矩阵

### P0（必须有）- 核心功能

| 功能 | 价值 | 难度 | 工期 | 负责人 |
|------|------|------|------|--------|
| 导入计划 | ⭐⭐⭐⭐⭐ | ⭐ | 1天 | - |
| 本地通知 | ⭐⭐⭐⭐⭐ | ⭐⭐ | 2天 | - |
| 数据统计 | ⭐⭐⭐⭐ | ⭐⭐ | 3天 | - |
| AI 复盘对话 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 3天 | - |

### P1（重要但不紧急）

| 功能 | 价值 | 难度 | 工期 |
|------|------|------|------|
| 智能难度调整 | ⭐⭐⭐⭐ | ⭐⭐⭐ | 2天 |
| 进度预测 | ⭐⭐⭐⭐ | ⭐⭐⭐ | 2天 |
| 快捷打卡（左滑）| ⭐⭐⭐ | ⭐⭐ | 1天 |
| 主题自动切换 | ⭐⭐⭐ | ⭐ | 0.5天 |

### P2（锦上添花）

| 功能 | 价值 | 难度 | 工期 |
|------|------|------|------|
| 好友陪伴 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 5天 |
| 分享功能 | ⭐⭐⭐ | ⭐⭐ | 2天 |
| 时间银行 | ⭐⭐ | ⭐⭐⭐ | 3天 |

---

## 🎨 核心功能详细设计

### 1. AI 每日复盘对话

**功能描述**：
每天晚上 AI 主动发起对话，了解完成情况和遇到的困难

**交互流程**：
```
晚上 8:00 - 通知
"小明教练想和你聊聊今天的进度 💬"

点击进入对话界面
AI: "今天完成得怎么样？"

用户: "完成了词汇，但听力没做"

AI: "听力是第 3 天没完成了，遇到什么困难了吗？"

用户: "太难了，听不懂"

AI: "我看了一下，这份材料是 7 分难度，确实偏难。
     我帮你换成 6 分的，先建立信心。
     要不要试试？"
     
[一键替换] [继续挑战] [明天再说]
```

**技术实现**：
```typescript
// 1. 对话状态管理
interface ChatSession {
  date: string;
  messages: Message[];
  userFeedback: {
    completedTasks: string[];
    skippedTasks: string[];
    difficulties: string[];
  };
}

// 2. AI 上下文构建
function buildAIContext(user: User, plan: Plan) {
  return `
    用户信息：
    - 目标：${plan.goal.title}
    - 当前进度：${getProgress(plan)}
    - 历史数据：${getHistoryStats(user)}
    
    今日情况：
    - 计划任务：${plan.todayTasks}
    - 完成情况：${getTodayCompletion()}
    
    你的角色：
    - 名字：小明教练
    - 性格：温和、耐心、鼓励为主
    - 目标：了解困难，给出建议
    
    注意：
    - 问题要具体，不要泛泛而谈
    - 基于数据分析，不要瞎猜
    - 给出可操作的建议
    - 建议要有选项，让用户选择
  `;
}

// 3. API 调用
async function getAIResponse(context: string, userMessage: string) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ context, message: userMessage })
  });
  return response.json();
}
```

**数据存储**：
```typescript
// LocalStorage 结构
{
  "chat_sessions": [
    {
      "date": "2024-06-10",
      "messages": [...],
      "insights": {
        "difficulty_level": "too_hard",
        "suggested_adjustment": "reduce_listening_difficulty"
      }
    }
  ]
}
```

---

### 2. 智能难度调整

**功能描述**：
根据用户完成情况，自动建议调整任务难度

**触发条件**：
```typescript
// 难度过高
if (task.skippedCount >= 3 || task.completionRate < 40%) {
  suggestReduceDifficulty();
}

// 难度过低
if (task.completionTime < task.estimatedTime * 0.6) {
  suggestIncreaseDifficulty();
}

// 长期趋势
if (weeklyCompletionRate > 90% for 2 weeks) {
  suggestOverallIncrease();
}
```

**建议方式**：
```
场景 1：任务太难
"我注意到'雅思听力练习'你连续 3 天都跳过了。
 当前材料是 7 分难度，可能偏难了。

建议方案：
1. 降低到 6 分材料（推荐）
2. 减少时间：40分钟 → 25分钟
3. 暂停几天，先巩固其他技能

[应用方案1] [应用方案2] [保持现状]"

场景 2：任务太简单
"词汇记忆你最近完成得很快，通常 20 分钟就搞定了
 （计划是 30 分钟）。

建议：
- 增加单词量：50 个/天 → 80 个/天
- 或增加复习轮次：1 轮 → 2 轮

[增加难度] [保持现状]"
```

**实现逻辑**：
```typescript
// 难度调整算法
function analyzeDifficulty(task: Task, history: TaskHistory[]) {
  // 1. 计算完成率
  const completionRate = history.filter(h => h.status === 'done').length / history.length;
  
  // 2. 计算平均用时
  const avgTime = history.reduce((sum, h) => sum + h.actualTime, 0) / history.length;
  
  // 3. 判断难度
  if (completionRate < 0.4) {
    return {
      level: 'too_hard',
      suggestions: [
        { type: 'reduce_content', amount: 0.3 },
        { type: 'reduce_time', amount: 0.4 },
        { type: 'pause', days: 3 }
      ]
    };
  }
  
  if (avgTime < task.estimatedTime * 0.6 && completionRate > 0.9) {
    return {
      level: 'too_easy',
      suggestions: [
        { type: 'increase_content', amount: 0.5 },
        { type: 'add_complexity', level: 1 }
      ]
    };
  }
  
  return { level: 'appropriate', suggestions: [] };
}
```

---

### 3. 本地通知提醒

**通知类型**：
```typescript
enum NotificationType {
  MORNING_REMINDER = 'morning',    // 早上任务提醒
  EVENING_REVIEW = 'evening',      // 晚上复盘提醒
  STREAK_MILESTONE = 'streak',     // 连续打卡里程碑
  DEADLINE_WARNING = 'deadline'    // 截止日期提醒
}
```

**通知内容设计**：
```
早上 9:00 - 任务提醒
🌅 早安！今天有 3 个任务等你挑战
📝 词汇记忆 30分钟
🎧 听力练习 40分钟  
📖 阅读理解 30分钟

[查看详情]

---

晚上 8:00 - 复盘提醒
💬 小明教练想和你聊聊今天的进度
今天完成率：67% (2/3)

[开始对话]

---

连续打卡 7 天
🎉 太棒了！连续打卡 7 天
你已经超过了 80% 的用户
继续保持，养成习惯就在眼前！

[查看数据]

---

截止日期临近
⏰ 距离目标日期还有 7 天
当前进度：75%
按照这个速度，可能会延期 2 天

[查看建议]
```

**技术实现**：
```typescript
// Expo Notifications
import * as Notifications from 'expo-notifications';

// 1. 请求权限
async function registerNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('需要通知权限才能提醒你打卡哦');
  }
}

// 2. 调度通知
async function scheduleDailyReminders(plan: Plan) {
  // 早上提醒
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌅 早安！今天有 3 个任务等你挑战',
      body: '点击查看详情',
      data: { type: 'morning', tasks: plan.todayTasks }
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true
    }
  });
  
  // 晚上复盘
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💬 小明教练想和你聊聊',
      body: '今天完成得怎么样？',
      data: { type: 'evening' }
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true
    }
  });
}

// 3. 处理点击
Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data;
  
  if (data.type === 'morning') {
    navigation.navigate('Timeline');
  } else if (data.type === 'evening') {
    navigation.navigate('Chat');
  }
});
```

---

### 4. 数据统计页面

**页面布局**：
```
┌─────────────────────────────────┐
│  本周概览                         │
│  ┌─────┬─────┬─────┬─────┐      │
│  │ 一  │ 二  │ 三  │ 四  │      │
│  │ ✅  │ ✅  │ ✅  │ ⏳  │      │
│  └─────┴─────┴─────┴─────┘      │
│  完成率：75% 📈                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  连续打卡                         │
│  ┌─────────────────────┐        │
│  │   🔥  7 天           │        │
│  │   最佳记录：15 天    │        │
│  └─────────────────────┘        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  任务类别分布                     │
│  ┌─────────────────────┐        │
│  │ 词汇 ████████ 40%   │        │
│  │ 听力 ██████   30%   │        │
│  │ 阅读 ████     20%   │        │
│  │ 写作 ██       10%   │        │
│  └─────────────────────┘        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  完成趋势图                       │
│  100% ┤                          │
│   75% ┤  ●─●─●                  │
│   50% ┤●         ●─●            │
│   25% ┤                          │
│    0% └─────────────────         │
│       周一 周二 周三...          │
└─────────────────────────────────┘
```

**数据计算**：
```typescript
interface Stats {
  // 基础数据
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  
  // 时间统计
  totalMinutes: number;
  averageDaily: number;
  
  // 连续打卡
  currentStreak: number;
  longestStreak: number;
  
  // 趋势
  weeklyTrend: DailyStats[];
  monthlyTrend: WeeklyStats[];
  
  // 类别分布
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

function calculateStats(plan: Plan): Stats {
  const tasks = plan.tasks;
  const completed = tasks.filter(t => t.status === 'done');
  
  return {
    totalTasks: tasks.length,
    completedTasks: completed.length,
    completionRate: (completed.length / tasks.length) * 100,
    // ... 其他计算
  };
}
```

---

## 🔄 迭代计划

### 第 1 周：MVP 功能完善

**目标**：提升基础体验，让用户愿意每天打开

**任务清单**：
- [ ] Day 1-2：导入计划功能
  - [ ] 设计导入 UI
  - [ ] 解析 Markdown/JSON 格式
  - [ ] 测试导入流程
  
- [ ] Day 3-4：本地通知
  - [ ] 集成 Expo Notifications
  - [ ] 设计通知内容
  - [ ] 测试不同场景
  
- [ ] Day 5-7：数据统计页面
  - [ ] 设计统计页面 UI
  - [ ] 实现数据计算逻辑
  - [ ] 添加趋势图表
  - [ ] 测试和优化

**验收标准**：
- [ ] 用户可以导入之前导出的计划
- [ ] 每天准时收到 2 次通知
- [ ] 统计页面数据准确且美观

---

### 第 2-3 周：AI 教练功能

**目标**：AI 真正理解用户，给出有价值的建议

**任务清单**：
- [ ] Week 2 Day 1-3：AI 对话基础
  - [ ] 设计对话界面
  - [ ] 集成 AI API（Claude/GPT）
  - [ ] 实现上下文管理
  
- [ ] Week 2 Day 4-5：复盘对话
  - [ ] 设计对话流程
  - [ ] 实现每日复盘触发
  - [ ] 测试对话质量
  
- [ ] Week 3 Day 1-3：智能建议
  - [ ] 实现难度分析算法
  - [ ] 设计建议展示 UI
  - [ ] 实现一键应用
  
- [ ] Week 3 Day 4-5：数据分析
  - [ ] 实现进度预测
  - [ ] 风险预警逻辑
  - [ ] 测试和优化

**验收标准**：
- [ ] AI 对话响应时间 < 2秒
- [ ] 建议采纳率 > 30%（初期目标）
- [ ] 用户反馈正面 > 80%

---

### 第 4-6 周：垂直场景深化

**目标**：在考试备考场景做出差异化

**任务清单**：
- [ ] Week 4：真题追踪
  - [ ] 设计真题进度 UI
  - [ ] 实现进度同步
  - [ ] 添加常见考试模板
  
- [ ] Week 5：错题本
  - [ ] 设计错题记录功能
  - [ ] 实现智能复习提醒
  - [ ] AI 分析错题规律
  
- [ ] Week 6：模考和报告
  - [ ] 模考时间自动规划
  - [ ] 生成学习报告
  - [ ] 各科目平衡建议

**验收标准**：
- [ ] 考试备考用户占比 > 40%
- [ ] 场景功能使用率 > 30%
- [ ] NPS 分数 > 7

---

## 💰 商业模式

### 定价策略

**免费版**：
- ✅ 生成 1 个计划
- ✅ 基础打卡管理
- ✅ 简单数据统计
- ✅ 每天 3 次 AI 对话
- ❌ 无智能建议
- ❌ 无场景功能

**教练版**：¥99/90天
- ✅ 包含免费版所有功能
- ✅ 无限 AI 对话
- ✅ 智能难度调整
- ✅ 进度预测和风险预警
- ✅ 数据深度分析
- ✅ 场景专属功能
- 🎁 不达目标退款 50%

**导师版**：¥299/90天
- ✅ 包含教练版所有功能
- ✅ 真人导师 1v1 答疑（2次/90天）
- ✅ 定制学习资料包
- ✅ 优先客服支持
- 🎁 不达目标退款 50%

### 增值服务

- **定制计划**：¥199/次
  - 专业规划师 1v1 沟通
  - 定制专属学习计划
  
- **学长经验包**：¥49/份
  - 已通过考试的学长分享
  - 完整计划 + 资料 + 心得

- **数据分析报告**：¥49/份
  - AI 生成深度分析
  - 具体改进建议
  - 预测最终结果

---

## 📈 关键指标

### 用户增长
- DAU（日活）
- MAU（月活）
- 新增用户数
- 用户来源渠道

### 用户留存
- 次日留存率（目标 > 60%）
- 7 日留存率（目标 > 40%）
- 30 日留存率（目标 > 25%）

### 用户活跃
- 平均打卡天数（目标 > 15 天）
- 任务完成率（目标 > 65%）
- AI 对话次数（目标 > 5 次/周）

### 商业化
- 付费转化率（目标 > 5%）
- ARPU（人均收入）
- 退款率（目标 < 10%）
- NPS 推荐值（目标 > 8）

---

## 🎯 里程碑

### M1（第 2 周）：MVP 上线
- [ ] 完善基础功能
- [ ] 发布到 Google Play
- [ ] 获得前 100 个用户

### M2（第 4 周）：AI 教练上线
- [ ] AI 对话功能完成
- [ ] 用户 > 500
- [ ] 7日留存 > 35%

### M3（第 8 周）：垂直场景上线
- [ ] 考试备考场景完成
- [ ] 用户 > 2000
- [ ] 付费用户 > 50

### M4（第 12 周）：规模化
- [ ] 用户 > 10000
- [ ] 付费用户 > 500
- [ ] 月收入 > ¥50000

---

## 🚨 风险和应对

### 技术风险

**风险 1**：AI API 成本过高
- **应对**：设置免费版调用次数限制
- **应对**：优化 prompt 减少 token 消耗
- **应对**：使用本地模型处理简单任务

**风险 2**：数据存储和同步
- **应对**：优先本地存储，延后云端同步
- **应对**：使用增量同步减少流量
- **应对**：选择 Firebase/Supabase 等成熟方案

### 产品风险

**风险 1**：用户留存率低
- **应对**：强化通知和提醒机制
- **应对**：增加打卡激励
- **应对**：优化用户引导流程

**风险 2**：AI 建议不被采纳
- **应对**：提升建议质量和准确度
- **应对**：添加建议反馈机制
- **应对**：人工审核和优化 prompt

### 商业风险

**风险 1**：用户不愿意付费
- **应对**：免费版功能够用但有限制
- **应对**：强化付费版价值感知
- **应对**：提供退款保证降低决策门槛

**风险 2**：竞品模仿
- **应对**：快速迭代保持领先
- **应对**：深耕垂直场景建立壁垒
- **应对**：积累用户数据形成网络效应

---

## ✅ 行动计划

### 本周（Week 1）

**周一-周二**：
- [ ] 实现导入功能
- [ ] 设计通知策略

**周三-周四**：
- [ ] 集成 Expo Notifications
- [ ] 测试通知功能

**周五-周日**：
- [ ] 开发数据统计页面
- [ ] 整体测试和优化
- [ ] 提交到 Google Play

### 下周（Week 2）

**周一-周三**：
- [ ] 设计 AI 对话界面
- [ ] 集成 AI API
- [ ] 实现基础对话

**周四-周五**：
- [ ] 实现复盘对话
- [ ] 测试对话质量
- [ ] 收集用户反馈

---

**文档版本**：v1.0  
**创建时间**：2026-06-09  
**负责人**：产品团队  
**更新频率**：每周回顾和更新
