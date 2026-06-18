// lib/localPlan.js - 离线降级计划生成器

const { pets, advisorStyles } = require('./planIntake');

function addDays(date, days) {
  var d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function ymd(date) {
  return date.toISOString().split('T')[0];
}

function inferDurationDays(goal) {
  var dayMatch = goal.match(/(\d+)\s*(?:天|day|days)/i);
  if (dayMatch) return parseInt(dayMatch[1]);
  var monthMatch = goal.match(/(\d+)\s*(?:个月|月|month|months)/i);
  if (monthMatch) return parseInt(monthMatch[1]) * 30;
  return 30;
}

// Phase-specific task banks (10 tasks each for 4 phases = 40 unique)
var examPhases = [
  // Phase 1
  [
    { title: '摸底自测：做一套真题找到起点', desc: '严格计时完成一套真题，记录每个题型的用时和正确率，建立能力基线。', category: 'test', priority: 'high' },
    { title: '错因归类：把错题分成三类', desc: '将错题按"粗心""知识盲区""题型不熟"分类，每类写一道代表题的错因。', category: 'review', priority: 'high' },
    { title: '薄弱地图：列出最需攻克的 3 个考点', desc: '找出正确率最低的 3 个考点，按提分潜力排序，作为后续训练重点。', category: 'review', priority: 'high' },
    { title: '基础回补：针对最弱考点梳理知识', desc: '把最弱考点的核心概念、公式、常见陷阱整理成一页纸速查表。', category: 'study', priority: 'high' },
    { title: '小批量验证：最弱考点做 10 道题', desc: '从最弱考点挑 10 道题限时完成，对比速查表看看哪些知识点已激活。', category: 'practice', priority: 'high' },
    { title: '节奏试跑：用考试节奏做限时训练', desc: '设定考试时间限制完成一组题目，重点关注时间分配，找到答题节奏。', category: 'practice', priority: 'medium' },
    { title: '第一周复盘：写下本周最大发现', desc: '回顾这 7 天的数据和感受，写下最明显的进步和最顽固的问题。', category: 'review', priority: 'medium' },
    { title: '查漏补缺：速查表上模糊的点再过一遍', desc: '对每个知识点快速自测，仍然模糊的标红，作为下周重点。', category: 'study', priority: 'medium' },
    { title: '题型预热：提前了解下一阶段的高频题型', desc: '快速浏览下一阶段要训练的高频题型，了解出题方式和基本解题思路。', category: 'study', priority: 'medium' },
    { title: '学习日志：记录学习节奏和感受', desc: '写下每天什么时候效率最高、哪个时间段容易走神，优化后续安排。', category: 'review', priority: 'medium' },
  ],
  // Phase 2
  [
    { title: '高频考点精讲：整理 A 类高频题型', desc: '选出出现频率最高的 2 类题型，写出解题步骤和容易踩的坑，形成解题模板。', category: 'study', priority: 'high' },
    { title: '限时专项：A 类题型 20 道连刷', desc: '按考试节奏连续完成 20 道 A 类题型，记录每道题用时，找出最耗时的步骤。', category: 'practice', priority: 'high' },
    { title: '高频考点精讲：整理 B 类高频题型', desc: '处理第二大高频题型，对比 A 类的解题思路，找出两种题型的共通策略。', category: 'study', priority: 'high' },
    { title: '限时专项：B 类题型 20 道连刷', desc: '用同样节奏训练 B 类题型，做完后对比 A 类的正确率。', category: 'practice', priority: 'high' },
    { title: '交叉训练：A+B 类混合限时', desc: '把 A 类和 B 类题型混在一起，模拟真实考试中题型穿插出现的情况。', category: 'practice', priority: 'high' },
    { title: '错题深挖：本周最有代表性的 3 道错题', desc: '从本周错题中挑最有价值的 3 道，写出完整错因分析和正确解法。', category: 'review', priority: 'medium' },
    { title: '策略调整：根据数据微调方法', desc: '回顾本周正确率和用时变化，进步明显的减少训练量，停滞的换练法。', category: 'review', priority: 'medium' },
    { title: '解题速度测试：对比本周和上周用时', desc: '选 10 道题对比上周同类题用时，如果提速明显说明训练有效。', category: 'practice', priority: 'medium' },
    { title: '知识串联：把零散考点连成网络', desc: '在纸上画出所有高频考点之间的关联，发现共通解题思路。', category: 'study', priority: 'medium' },
    { title: '本周数据复盘：正确率和用时趋势', desc: '把每天的正确率和平均用时画成折线图，趋势比单天数据更有参考价值。', category: 'review', priority: 'medium' },
  ],
  // Phase 3
  [
    { title: '难点攻坚：攻克正确率最低的题型', desc: '集中火力攻克正确率最低的题型，先复习错题笔记，再做 15 道同类题。', category: 'practice', priority: 'high' },
    { title: '速度训练：同样正确率下压缩用时', desc: '选正确率已稳定的题型，挑战更短时间内完成，每次缩短 2 分钟。', category: 'practice', priority: 'high' },
    { title: '综合模拟 1：完整套题实战', desc: '严格按考试时间和流程完成一套完整模拟题，记录每个环节的感受。', category: 'test', priority: 'high' },
    { title: '模拟复盘：逐题分析模拟结果', desc: '逐题复盘昨天的模拟，重点分析每道题的决策过程：为什么选这个？犹豫了多久？', category: 'review', priority: 'high' },
    { title: '薄弱补强：针对模拟暴露的问题训练', desc: '根据模拟复盘发现的问题做 15-20 道针对性训练。', category: 'practice', priority: 'high' },
    { title: '综合模拟 2：第二次完整套题', desc: '第二次模拟考试，重点对比第一次：哪些题型进步了？哪些老问题还在？', category: 'test', priority: 'high' },
    { title: '阶段总结：记录突破和瓶颈', desc: '对比第一次摸底和两次模拟的数据，写下最明显的突破和最大瓶颈。', category: 'review', priority: 'medium' },
    { title: '易错陷阱清单：整理所有踩过的坑', desc: '把所有模拟和练习中踩过的陷阱整理成清单，考试前快速过一遍。', category: 'study', priority: 'medium' },
    { title: '时间管理优化：重新分配各题型时间', desc: '根据两次模拟数据重新计算每个题型应该花多少时间。', category: 'review', priority: 'medium' },
    { title: '自信心建设：回顾所有进步记录', desc: '翻看从第一天到现在的所有数据和笔记，进步比想象中大得多。', category: 'review', priority: 'medium' },
  ],
  // Phase 4
  [
    { title: '全科回顾：过一遍所有速查表', desc: '快速过一遍所有速查表和错题卡片，用荧光笔标出仍然模糊的知识点。', category: 'study', priority: 'high' },
    { title: '最终模拟：考前实战演练', desc: '最后一次完整模拟，目标不是提分而是建立信心和稳定节奏。', category: 'test', priority: 'high' },
    { title: '错题清零：消灭最后的顽固错题', desc: '把错题本中还没搞懂的题目全部重做一遍，能做对的划掉。', category: 'review', priority: 'high' },
    { title: '考场策略：制定答题顺序和时间分配', desc: '根据所有模拟数据确定考试时每个题型的答题顺序和时间，写在小卡片上。', category: 'study', priority: 'high' },
    { title: '心态准备：写下信心清单', desc: '列出已完成的所有准备工作、取得的进步、掌握的技巧。考试前看一遍。', category: 'review', priority: 'medium' },
    { title: '轻松复习：翻看笔记不做新题', desc: '今天不做新题，轻松翻看笔记和错题卡片，让大脑在放松中巩固记忆。', category: 'study', priority: 'medium' },
    { title: '考前调整：早睡早起保持节奏', desc: '保持正常作息和轻松心情，做几道简单题保持手感，不要挑战难题。', category: 'practice', priority: 'medium' },
    { title: '高频公式和要点速览', desc: '把考试中最常用的公式、定理、关键要点快速过一遍，只看不练。', category: 'study', priority: 'medium' },
    { title: '考前模拟彩排：走一遍完整流程', desc: '模拟考试当天的完整流程：起床、出门、到达、答题节奏，减少紧张感。', category: 'review', priority: 'medium' },
    { title: '最后一天：轻松翻看早点休息', desc: '考试前一天不做新题，轻松翻看错题卡片和信心清单，准备文具，早点睡。', category: 'review', priority: 'medium' },
  ],
];

function taskMinutes(intake) {
  var base = intake.dailyTime * 60;
  if (intake.advisorProfile.granularity === 'light') return Math.max(25, Math.round(base * 0.55));
  if (intake.advisorProfile.granularity === 'detailed') return Math.max(25, Math.round(base * 0.8));
  return Math.max(25, Math.round(base * 0.7));
}

function createLocalStudyPlan(intake) {
  var durationDays = inferDurationDays(intake.goal);
  var start = new Date(intake.startDate + 'T00:00:00');
  var phaseLength = Math.max(7, Math.ceil(durationDays / 4));
  var pet = pets[intake.petId];
  var minutes = taskMinutes(intake);
  var phaseBanks = examPhases;

  var phaseNames = ['诊断与校准', '主线推进', '强化突破', '复盘冲刺'];
  var phaseObjectives = [
    '找到你在「' + intake.goal + '」上的起点和薄弱点，建立每天的学习节奏。',
    '围绕高频考点展开系统训练，把正确率稳定在一个台阶上。',
    '集中攻克难点，通过模拟考试验证训练效果。',
    '回顾所有积累，调整状态，以最佳节奏迎接最终检验。',
  ];

  var phases = phaseNames.map(function (title, index) {
    var phaseStart = addDays(start, index * phaseLength);
    var phaseEnd = addDays(phaseStart, phaseLength - 1);
    return {
      id: 'phase_' + (index + 1),
      title: title,
      startDate: ymd(phaseStart),
      endDate: ymd(phaseEnd),
      objective: phaseObjectives[index],
      tasks: [],
    };
  });

  var tasks = [];
  var totalTaskDays = Math.min(durationDays, 28);
  var phaseOffsets = [0, 2, 4, 6];
  var phaseTaskCounters = phaseOffsets.slice();
  var taskCounter = 0;

  for (var day = 0; day < totalTaskDays; day++) {
    taskCounter++;
    var phaseIndex = Math.min(Math.floor(day / phaseLength), phases.length - 1);
    var phase = phases[phaseIndex];
    var bank = phaseBanks[phaseIndex] || phaseBanks[0];
    var taskTemplate = bank[phaseTaskCounters[phaseIndex] % bank.length];
    phaseTaskCounters[phaseIndex]++;

    var task = {
      id: 'task_' + taskCounter,
      title: taskTemplate.title,
      description: taskTemplate.desc,
      date: ymd(addDays(start, day)),
      durationMinutes: minutes,
      category: taskTemplate.category,
      priority: taskTemplate.priority,
      status: 'todo',
      dependsOn: [],
      source: 'template',
    };
    tasks.push(task);
    phase.tasks.push(task.id);
  }

  return {
    id: 'local_plan_' + Date.now(),
    version: 1,
    validationStatus: 'valid_with_warnings',
    goal: {
      title: intake.goal,
      type: 'learning',
      startDate: intake.startDate,
      targetDate: ymd(addDays(start, durationDays)),
      currentLevel: intake.level || undefined,
      targetLevel: '达成目标',
      dailyAvailableMinutes: Math.round(intake.dailyTime * 60),
    },
    brief: {
      summary: pet.name + '已经帮你把「' + intake.goal + '」拆成了 ' + durationDays + ' 天的计划。每天大约 ' + intake.dailyTime + ' 小时，按阶段推进，完成一项就打卡一项。',
      assumptions: [
        '计划采用双层结构：阶段路线 + 每日任务。',
        '每天按 ' + intake.dailyTime + ' 小时估算，单任务时长约 ' + minutes + ' 分钟。',
      ],
      sources: [
        { type: 'template', title: '本地学习计划模板', note: '后端不可达时的降级方案。' },
        { type: 'user_input', title: '用户目标', note: intake.goal },
      ],
    },
    phases: phases,
    tasks: tasks,
    risks: [{ type: 'offline_fallback', message: '当前计划由本地生成，建议后端可用后重新生成 AI 版本。', severity: 'medium', relatedTaskIds: [] }],
    history: [],
  };
}

module.exports = { createLocalStudyPlan };
