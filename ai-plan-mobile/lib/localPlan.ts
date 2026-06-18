import type { Plan, Phase, PlanTask } from './shared/schema';
import type { PlanIntake } from './planIntake';
import {
  buildAdvisorSummary,
  inferDurationDays,
  pets,
} from './planIntake';

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function ymd(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ── Phase-specific task banks ──────────────────────────────────────────────
// Each phase has ~20 unique tasks. We draw from them sequentially so no day repeats.

type TaskTemplate = {
  title: string;
  desc: string;
  category: string;
  priority: 'high' | 'medium';
};

const examPhases: TaskTemplate[][] = [
  // Phase 1: 诊断与校准 (day 1-7) — 10 tasks for safety margin
  [
    { title: '摸底自测：做一套真题找到起点', desc: '严格计时完成一套真题。不用在意分数，重点是记录每个题型的用时和正确率，建立你的能力基线。', category: 'test', priority: 'high' },
    { title: '错因归类：把摸底错题分成三类', desc: '将错题按"粗心""知识盲区""题型不熟"分类。每一类挑一道代表性题目，写出你当时为什么选错。', category: 'review', priority: 'high' },
    { title: '薄弱地图：列出最需要优先攻克的 3 个考点', desc: '根据前两天的数据，找出正确率最低的 3 个考点，按提分潜力排序，作为后续训练的重点。', category: 'review', priority: 'high' },
    { title: '基础回补：针对最弱考点做知识梳理', desc: '翻开教材或笔记，把最弱考点的核心概念、公式、常见陷阱整理成一页纸速查表。', category: 'study', priority: 'high' },
    { title: '小批量验证：最弱考点做 10 道专项题', desc: '从最弱考点中挑 10 道题限时完成。做完后对比昨天的速查表，看看哪些知识点已经激活。', category: 'practice', priority: 'high' },
    { title: '节奏试跑：用考试节奏做一组限时训练', desc: '设定与考试相同的时间限制，完成一组题目。重点关注"时间分配"而非正确率，找到自己的答题节奏。', category: 'practice', priority: 'medium' },
    { title: '第一周复盘：写下本周最大的发现', desc: '回顾这 7 天的数据和感受。写下：最明显的进步、最顽固的问题、下周想调整什么。', category: 'review', priority: 'medium' },
    { title: '查漏补缺：把速查表上模糊的点再过一遍', desc: '翻开前几天整理的速查表，对每个知识点快速自测。仍然模糊的标红，作为下周重点。', category: 'study', priority: 'medium' },
    { title: '题型预热：提前了解下一阶段的高频题型', desc: '快速浏览下一阶段要训练的高频题型，了解出题方式和基本解题思路，为正式训练做准备。', category: 'study', priority: 'medium' },
    { title: '学习日志：记录当前的学习节奏和感受', desc: '写下每天什么时候学习效率最高、哪个时间段容易走神。这些信息会帮你优化后续的学习安排。', category: 'review', priority: 'medium' },
  ],
  // Phase 2: 主线推进 (day 8-14) — 10 tasks
  [
    { title: '高频考点精讲：整理 A 类高频题型', desc: '选出考试中出现频率最高的 2 类题型，分别写出解题步骤和容易踩的坑，形成自己的解题模板。', category: 'study', priority: 'high' },
    { title: '限时专项：A 类题型 20 道连刷', desc: '按照考试节奏连续完成 20 道 A 类题型。记录每道题的用时，找出哪些步骤最耗时。', category: 'practice', priority: 'high' },
    { title: '高频考点精讲：整理 B 类高频题型', desc: '处理第二大高频题型。对比 A 类题型的解题思路，找出两种题型之间的共通策略。', category: 'study', priority: 'high' },
    { title: '限时专项：B 类题型 20 道连刷', desc: '用同样的节奏训练 B 类题型。做完后对比 A 类的正确率，看看哪个还需要更多训练。', category: 'practice', priority: 'high' },
    { title: '交叉训练：A+B 类混合限时', desc: '把 A 类和 B 类题型混在一起，模拟真实考试中题型穿插出现的情况。训练快速切换思维的能力。', category: 'practice', priority: 'high' },
    { title: '错题深挖：本周最有代表性的 3 道错题', desc: '从本周错题中挑出最有价值的 3 道，写出完整的错因分析和正确解法，做成错题卡片。', category: 'review', priority: 'medium' },
    { title: '策略调整：根据本周数据微调方法', desc: '回顾本周的正确率和用时变化。如果某类题型进步明显就减少训练量，停滞的就换一种练法。', category: 'review', priority: 'medium' },
    { title: '解题速度测试：对比本周和上周的用时', desc: '选 10 道题，对比上周做同类题的用时。如果提速明显，说明训练有效；如果没变，需要调整策略。', category: 'practice', priority: 'medium' },
    { title: '知识串联：把零散考点连成知识网络', desc: '在纸上画出所有高频考点之间的关联。你会发现很多题型之间有共通的解题思路。', category: 'study', priority: 'medium' },
    { title: '本周数据复盘：正确率和用时趋势图', desc: '把本周每天的正确率和平均用时画成简单的折线图。趋势比单天数据更有参考价值。', category: 'review', priority: 'medium' },
  ],
  // Phase 3: 强化突破 (day 15-21) — 10 tasks
  [
    { title: '难点攻坚：攻克正确率最低的题型', desc: '集中火力攻克你正确率最低的题型。先复习错题笔记，再做 15 道同类题，目标是正确率提升 10%。', category: 'practice', priority: 'high' },
    { title: '速度训练：同样正确率下压缩用时', desc: '选一个正确率已经稳定的题型，挑战在更短时间内完成。每次缩短 2 分钟，找到速度极限。', category: 'practice', priority: 'high' },
    { title: '综合模拟 1：完整套题实战', desc: '严格按考试时间和流程完成一套完整模拟题。把这次当作正式考试来对待，记录每个环节的感受。', category: 'test', priority: 'high' },
    { title: '模拟复盘：逐题分析模拟结果', desc: '逐题复盘昨天的模拟。不只看对错，重点分析每道题的决策过程：为什么选这个？犹豫了多久？', category: 'review', priority: 'high' },
    { title: '薄弱补强：针对模拟暴露的问题专项训练', desc: '根据模拟复盘发现的问题，做 15-20 道针对性训练。如果时间分配有问题，就专门练时间管理。', category: 'practice', priority: 'high' },
    { title: '综合模拟 2：第二次完整套题', desc: '第二次模拟考试。重点对比第一次模拟：哪些题型进步了？哪些老问题还在？', category: 'test', priority: 'high' },
    { title: '阶段总结：记录突破和瓶颈', desc: '对比第一次摸底和两次模拟的数据。写下最明显的突破和目前最大的瓶颈，为最后冲刺做准备。', category: 'review', priority: 'medium' },
    { title: '易错陷阱清单：整理所有踩过的坑', desc: '把所有模拟和练习中踩过的陷阱整理成一份清单。考试前快速过一遍，避免重复犯错。', category: 'study', priority: 'medium' },
    { title: '时间管理优化：重新分配各题型时间', desc: '根据两次模拟的数据，重新计算每个题型应该花多少时间。把省下来的时间留给难题。', category: 'review', priority: 'medium' },
    { title: '自信心建设：回顾所有进步记录', desc: '翻看从第一天到现在的所有数据和笔记。你会发现自己的进步比想象中大得多。', category: 'review', priority: 'medium' },
  ],
  // Phase 4: 复盘冲刺 (day 22-28) — 10 tasks
  [
    { title: '全科回顾：过一遍所有考点速查表', desc: '快速过一遍你整理的所有速查表和错题卡片。用荧光笔标出仍然模糊的知识点，这就是最后要补的。', category: 'study', priority: 'high' },
    { title: '最终模拟：考前实战演练', desc: '最后一次完整模拟。这次的目标不是提分，而是建立信心和稳定节奏。把它当作考前最后一次彩排。', category: 'test', priority: 'high' },
    { title: '错题清零：消灭最后的顽固错题', desc: '把错题本中还没彻底搞懂的题目全部重做一遍。能做对的划掉，仍然错的写出最终版解析。', category: 'review', priority: 'high' },
    { title: '考场策略：制定你的答题顺序和时间分配', desc: '根据所有模拟数据，确定考试时每个题型的答题顺序和时间分配。写在一张小卡片上带进考场。', category: 'study', priority: 'high' },
    { title: '心态准备：写下你的信心清单', desc: '列出你已经完成的所有准备工作、取得的进步、掌握的技巧。考试前看一遍，提醒自己已经足够努力。', category: 'review', priority: 'medium' },
    { title: '轻松复习：翻看笔记不做新题', desc: '今天不做新题。轻松地翻看笔记、速查表和错题卡片，让大脑在放松状态下巩固记忆。', category: 'study', priority: 'medium' },
    { title: '考前调整：早睡早起，保持节奏', desc: '今天的目标是保持正常作息和轻松心情。做几道简单的题目保持手感，不要挑战难题。', category: 'practice', priority: 'medium' },
    { title: '高频公式和要点速览', desc: '把考试中最常用的公式、定理、关键要点快速过一遍。只看不练，强化记忆即可。', category: 'study', priority: 'medium' },
    { title: '考前模拟彩排：走一遍完整流程', desc: '模拟考试当天的完整流程：起床时间、出门时间、到达考场、答题节奏。提前彩排减少紧张感。', category: 'review', priority: 'medium' },
    { title: '最后一天：轻松翻看，早点休息', desc: '考试前一天不要再做任何新题。轻松翻看错题卡片和信心清单，准备好文具，早点睡觉。', category: 'review', priority: 'medium' },
  ],
];

const languagePhases: TaskTemplate[][] = [
  // Phase 1: 诊断与校准 — 10 tasks
  [
    { title: '词汇摸底：测试核心词汇掌握量', desc: '用词汇测试工具或自己默写，找出不认识的词。按主题分类记录，建立你的词汇缺口清单。', category: 'test', priority: 'high' },
    { title: '听力诊断：做一段精听找到起点', desc: '选一段 3-5 分钟的听力材料，逐句听写。记录听不懂的地方是连读、词汇还是语速问题。', category: 'practice', priority: 'high' },
    { title: '阅读诊断：限时完成一篇阅读理解', desc: '选一篇与目标难度相当的文章，限时完成。标注每道题的依据在文章哪里，找出你的阅读策略问题。', category: 'practice', priority: 'high' },
    { title: '口语/写作摸底：录一段自我介绍或写一篇短文', desc: '用目标语言说 2 分钟或写 150 词。回听或回看，标记语法错误、词汇重复和表达不自然的地方。', category: 'practice', priority: 'high' },
    { title: '制定个人词表：整理高频易错词', desc: '把前几天发现的生词按出现频率排序，选出最常用的 50 个作为第一轮攻克目标。', category: 'study', priority: 'high' },
    { title: '学习方法复盘：哪种练习对你最有效', desc: '回顾这一周的练习，哪种方式让你记住最多？是听写、阅读还是造句？找到最适合你的学习方式。', category: 'review', priority: 'medium' },
    { title: '第一周小结：记录进步和困惑', desc: '写下这周最大的收获和最困惑的地方。这些记录会在后面帮你看到自己的成长轨迹。', category: 'review', priority: 'medium' },
    { title: '语音语调自查：录一段朗读对比原声', desc: '选一段材料朗读并录音，然后和原声对比。标记发音差距最大的 5 个词，专门练习。', category: 'practice', priority: 'medium' },
    { title: '语法薄弱点速查：做一组诊断题', desc: '做一组涵盖主要语法点的诊断题，快速找出哪些语法规则还不熟练，建立语法提升清单。', category: 'test', priority: 'medium' },
    { title: '学习环境优化：整理学习资料和工具', desc: '整理好学习用的教材、App、笔记本。确保接下来的训练能高效进行，减少找资料的时间浪费。', category: 'study', priority: 'medium' },
  ],
  // Phase 2: 主线推进 — 10 tasks
  [
    { title: '词汇扩展：学习第一组核心词（20 个）', desc: '从个人词表中取出前 20 个词，用"看-读-造句-回忆"四步法学习。晚上睡前再过一遍。', category: 'study', priority: 'high' },
    { title: '语法精练：攻克一个核心语法点', desc: '选一个你常犯错的语法点（时态、从句、虚拟语气等），学规则后做 15 道专项练习。', category: 'practice', priority: 'high' },
    { title: '精听训练：逐句听写一段材料', desc: '选 2-3 分钟的听力材料，逐句暂停听写。对照原文标出漏听和错听的部分，分析原因。', category: 'practice', priority: 'high' },
    { title: '词汇扩展：学习第二组核心词（20 个）', desc: '继续个人词表的下 20 个词。这次尝试用新词编一个小故事或对话，加深记忆。', category: 'study', priority: 'high' },
    { title: '阅读策略：练习定位关键信息', desc: '做一篇阅读，这次重点关注"题目问什么→答案在文章哪里"的定位能力，而不是逐字翻译。', category: 'practice', priority: 'high' },
    { title: '口语/写作练习：用新学的词和语法输出', desc: '用本周学的词汇和语法点，写一段 200 词的短文或录 2 分钟口语。重点是"用出来"而不只是"认识"。', category: 'practice', priority: 'medium' },
    { title: '周复盘：词汇测试 + 听力对比', desc: '重新测试本周学的 40 个词汇，对比学习前的正确率。再听一遍第一天的听力材料，感受进步。', category: 'review', priority: 'medium' },
    { title: '词汇扩展：第三组核心词 + 复习前两组', desc: '学习新一组词汇的同时，快速过一遍前两组。这次用"遮住中文→回忆意思"的方式自测。', category: 'study', priority: 'medium' },
    { title: '听力跟读：模仿原声的语速和语调', desc: '选一段听力材料，播放一句跟读一句。重点模仿连读、重音和语调，提升口语流利度。', category: 'practice', priority: 'medium' },
    { title: '语法串联：把学过的语法点连成体系', desc: '在纸上画出所有学过语法点之间的关系图。你会发现很多规则是相互关联的，记住一个能推出好几个。', category: 'study', priority: 'medium' },
  ],
  // Phase 3: 强化突破 — 10 tasks
  [
    { title: '高频词组和搭配：学习地道表达', desc: '从阅读和听力材料中摘录 15 个高频搭配（如 make a decision 而不是 do a decision），背诵并造句。', category: 'study', priority: 'high' },
    { title: '听力提速：用 1.25 倍速听材料', desc: '把之前听过的材料加速到 1.25 倍再听一遍。如果能听懂 80% 以上，说明听力在进步。', category: 'practice', priority: 'high' },
    { title: '阅读提速：限时完成两篇阅读', desc: '两篇阅读共限时 30 分钟完成。第一篇求准，第二篇求快。对比两篇的策略差异。', category: 'practice', priority: 'high' },
    { title: '综合练习：听说读写各 15 分钟', desc: '把每天的学习拆成四块：听 15 分钟→说 15 分钟→读 15 分钟→写 15 分钟。训练综合能力。', category: 'practice', priority: 'high' },
    { title: '弱点攻坚：针对最弱的单项集中突破', desc: '根据前面的数据，找出最弱的单项（听力/阅读/写作/口语），今天专门花 1 小时攻克它。', category: 'practice', priority: 'high' },
    { title: '模拟测试：做一套完整模拟题', desc: '严格按考试时间完成一套模拟题。记录每个部分的用时和感觉，为最后阶段做参考。', category: 'test', priority: 'high' },
    { title: '模拟复盘：分析得分和失分模式', desc: '逐题分析模拟结果。你的失分集中在哪种题型？是理解问题还是策略问题？制定最后阶段的重点。', category: 'review', priority: 'medium' },
    { title: '写作模板：整理常用句型和段落结构', desc: '整理 10 个万能句型和 3 种段落结构模板。考试时可以直接套用，节省构思时间。', category: 'study', priority: 'medium' },
    { title: '口语话题库：准备 5 个万能素材', desc: '准备 5 个可以套用到多种话题的万能素材（个人经历、社会现象等），练习灵活套用。', category: 'practice', priority: 'medium' },
    { title: '进度评估：对比起点和当前位置', desc: '拿出第一天的摸底数据和现在的模拟数据做对比。看到进步会让你更有信心。', category: 'review', priority: 'medium' },
  ],
  // Phase 4: 复盘冲刺 — 10 tasks
  [
    { title: '错题重做：消灭所有标记的难题', desc: '把之前标记的所有难题和易错题重新做一遍。能做对的划掉，仍然错的写最终版解析。', category: 'review', priority: 'high' },
    { title: '最终模拟：考前完整模拟', desc: '最后一次完整模拟考试。重点是建立信心和稳定发挥，不追求超常发挥。', category: 'test', priority: 'high' },
    { title: '词汇最终过筛：快速过一遍所有生词', desc: '快速过一遍所有积累的生词。认识的划掉，仍然模糊的做最后标记，考前重点看这些。', category: 'study', priority: 'high' },
    { title: '考场策略：确定答题顺序和时间分配', desc: '根据所有练习数据，确定考试时每个部分的时间分配和答题策略。写在小卡片上带进考场。', category: 'study', priority: 'high' },
    { title: '轻松输入：看一部外语短片或听播客', desc: '今天不做题。看一部带字幕的外语短片或听一个轻松的播客，让大脑在放松中保持语感。', category: 'practice', priority: 'medium' },
    { title: '心态准备：写下你的进步清单', desc: '列出从开始学习到现在所有的进步：词汇量增长、听力提升、阅读变快…考试前看一遍给自己打气。', category: 'review', priority: 'medium' },
    { title: '考前调整：保持正常作息', desc: '今天的目标是保持好心情和正常作息。轻松复习笔记，不做新题，早点休息。', category: 'study', priority: 'medium' },
    { title: '高频表达速览：过一遍最常用的口语和写作表达', desc: '快速过一遍整理的高频表达和句型模板。只看不练，让它们在大脑中保持活跃状态。', category: 'study', priority: 'medium' },
    { title: '考前彩排：模拟考试当天的完整流程', desc: '从起床到出门到答题，走一遍完整流程。提前彩排能大幅减少考试当天的紧张感。', category: 'review', priority: 'medium' },
    { title: '最后一天：轻松翻看，早点休息', desc: '考试前一天不要再做任何新题。轻松翻看笔记和信心清单，准备好文具，早点睡觉。', category: 'review', priority: 'medium' },
  ],
];

// ── Task generation ────────────────────────────────────────────────────────

function pickTasksForPhase(
  phaseIndex: number,
  dayInPhase: number,
  totalDaysInPhase: number,
  goal: string,
): TaskTemplate {
  const banks = examPhases; // default; will be overridden by caller
  const bank = banks[phaseIndex] ?? banks[0];
  // Pick task based on position within phase, with some variation
  const index = dayInPhase % bank.length;
  return bank[index];
}

function taskMinutes(intake: PlanIntake): number {
  const base = intake.dailyTime * 60;
  if (intake.advisorProfile.granularity === 'light') return Math.max(25, Math.round(base * 0.55));
  if (intake.advisorProfile.granularity === 'detailed') return Math.max(25, Math.round(base * 0.8));
  return Math.max(25, Math.round(base * 0.7));
}

export function createLocalStudyPlan(intake: PlanIntake): Plan {
  const durationDays = inferDurationDays(intake.goal);
  const start = new Date(`${intake.startDate}T00:00:00`);
  const phaseLength = Math.max(7, Math.ceil(durationDays / 4));
  const pet = pets[intake.petId];
  const minutes = taskMinutes(intake);
  const phaseBanks = examPhases; // Default to exam tasks for local fallback

  const phaseNames = ['诊断与校准', '主线推进', '强化突破', '复盘冲刺'];
  const phaseObjectives = [
    `找到你在「${intake.goal}」上的起点和薄弱点，建立每天的学习节奏。`,
    `围绕高频考点展开系统训练，把正确率稳定在一个台阶上。`,
    `集中攻克难点，通过模拟考试验证训练效果。`,
    `回顾所有积累，调整状态，以最佳节奏迎接最终检验。`,
  ];

  const phases: Phase[] = phaseNames.map((title, index) => {
    const phaseStart = addDays(start, index * phaseLength);
    const phaseEnd = addDays(phaseStart, phaseLength - 1);
    return {
      id: `phase_${index + 1}`,
      title,
      startDate: ymd(phaseStart),
      endDate: ymd(phaseEnd),
      objective: phaseObjectives[index],
      tasks: [],
    };
  });

  const tasks: PlanTask[] = [];
  const totalTaskDays = Math.min(durationDays, 28);
  const spacing = intake.advisorProfile.granularity === 'light' ? 2 : 1;
  let taskCounter = 0;
  // Per-phase task counter with offset to avoid boundary repeats
  const phaseOffsets = [0, 2, 4, 6];
  const phaseTaskCounters = [...phaseOffsets];

  for (let day = 0; day < totalTaskDays; day += spacing) {
    taskCounter += 1;
    const phaseIndex = Math.min(Math.floor(day / phaseLength), phases.length - 1);
    const phase = phases[phaseIndex];
    const bank = phaseBanks[phaseIndex] ?? phaseBanks[0];
    const taskTemplate = bank[phaseTaskCounters[phaseIndex] % bank.length];
    phaseTaskCounters[phaseIndex] += 1;

    const task: PlanTask = {
      id: `task_${taskCounter}`,
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
    id: `local_plan_${Date.now()}`,
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
      summary: buildAdvisorSummary(intake),
      assumptions: [
        '计划采用双层结构：阶段路线 + 每日任务。',
        `伙伴设定：${pet.name}。`,
        `每天按 ${intake.dailyTime} 小时估算，单任务时长约 ${minutes} 分钟。`,
        intake.advisorProfile.granularity === 'light'
          ? '当前使用留白较多的安排方式，会主动留出缓冲天。'
          : '当前会把训练拆得更密，便于稳住推进节奏。',
      ],
      sources: [
        {
          type: 'template',
          title: '手机端本地学习计划模板',
          note: '用于后端不可达时保证生成流程不中断。',
        },
        {
          type: 'user_input',
          title: '用户目标',
          note: intake.goal,
        },
      ],
    },
    phases,
    tasks,
    risks: [
      {
        type: 'offline_fallback',
        message: '当前计划由本地模板生成，建议后端可用后重新生成 AI 版本。',
        severity: 'medium',
        relatedTaskIds: [],
      },
    ],
    history: [],
  };
}
