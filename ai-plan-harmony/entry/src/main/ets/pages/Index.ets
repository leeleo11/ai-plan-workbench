import { router } from '@kit.ArkUI';
import { Theme } from '../common/Theme';
import { TaskCardComponent } from '../components/TaskCard';
import { StorageService } from '../service/StorageService';
import type { Plan, PlanTask } from '../model/PlanModel';

@Entry
@Component
struct IndexPage {
  @State plan: Plan | null = null;
  @State loading: boolean = true;
  @State todayTasks: PlanTask[] = [];
  @State doneCount: number = 0;
  @State todoCount: number = 0;
  @State streak: number = 0;
  @State progress: number = 0;

  async aboutToAppear() {
    await this.loadPlan();
  }

  async loadPlan() {
    this.loading = true;
    const latest = await StorageService.getInstance().getLatestPlan();
    this.plan = latest;
    if (latest) {
      const today = new Date().toISOString().split('T')[0];
      this.todayTasks = latest.tasks.filter((t) => t.date === today);
      this.doneCount = latest.tasks.filter((t) => t.status === 'done').length;
      this.todoCount = latest.tasks.filter((t) => t.status === 'todo').length;
      this.progress = Math.round((this.doneCount / Math.max(1, latest.tasks.length)) * 100);
    }
    this.loading = false;
  }

  async toggleTaskStatus(task: PlanTask) {
    if (!this.plan) return;
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    const updated: PlanTask = { ...task, status: nextStatus, source: 'user_edited' };
    const nextPlan: Plan = {
      ...this.plan,
      tasks: this.plan.tasks.map((t) => t.id === task.id ? updated : t)
    };
    this.plan = nextPlan;
    await StorageService.getInstance().savePlan(nextPlan);
    await this.loadPlan();
  }

  build() {
    Column() {
      if (this.loading) {
        Column() {
          Text('加载中...')
            .fontSize(16)
            .fontColor('#666666')
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
      } else if (!this.plan) {
        Column() {
          Text('还没有计划')
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.ink)

          Text('点击下方"生成"创建你的第一个计划')
            .fontSize(14)
            .fontColor('#666666')
            .margin({ top: 8 })

          Button('去生成计划')
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.ink)
            .backgroundColor(Theme.sun)
            .borderRadius(12)
            .borderWidth(2)
            .borderColor(Theme.line)
            .margin({ top: 24 })
            .onClick(() => router.pushUrl({ url: 'pages/Generate' }))
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
        .padding(32)
      } else {
        Scroll() {
          Column() {
            // Stats Card
            Column() {
              Row() {
                this.StatItem(this.doneCount.toString(), '已完成')
                this.StatItem(this.todoCount.toString(), '待挑战')
                this.StatItem(this.streak.toString(), '连续天数')
                this.StatItem(`${this.progress}%`, '进度')
              }
              .width('100%')
              .justifyContent(FlexAlign.SpaceAround)

              // Progress Bar
              Row()
                .width('100%')
                .height(8)
                .backgroundColor(Theme.cream)
                .borderRadius(4)
                .margin({ top: 12 })
                .overlay(
                  Row()
                    .width(`${this.progress}%`)
                    .height(8)
                    .backgroundColor(Theme.berry)
                    .borderRadius(4),
                  AlignMode.Start
                )
            }
            .backgroundColor(Theme.paper)
            .borderRadius(12)
            .borderWidth(2)
            .borderColor(Theme.line)
            .padding(16)
            .margin({ bottom: 16 })

            // Today's Tasks
            Column() {
              Text(`今日任务 (${this.todayTasks.length})`)
                .fontSize(18)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)
                .margin({ bottom: 12 })

              if (this.todayTasks.length === 0) {
                Column() {
                  Text('今天没有任务，可以休息或查看计划总览。')
                    .fontSize(14)
                    .fontColor('#666666')
                    .textAlign(TextAlign.Center)
                }
                .width('100%')
                .padding(24)
                .backgroundColor(Theme.paper)
                .borderRadius(12)
                .borderWidth(2)
                .borderColor(Theme.line)
              } else {
                ForEach(this.todayTasks, (task: PlanTask) => {
                  TaskCardComponent({
                    task: task,
                    onToggleStatus: (t: PlanTask) => this.toggleTaskStatus(t),
                    onNavigate: (id: string) => router.pushUrl({
                      url: 'pages/TaskDetail',
                      params: { taskId: id }
                    })
                  })
                })
              }
            }
          }
          .width('100%')
          .padding(16)
        }
        .width('100%')
        .height('100%')
        .scrollBar(BarState.Off)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Theme.cream)
  }

  @Builder
  StatItem(value: string, label: string) {
    Column() {
      Text(value)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor(Theme.ink)

      Text(label)
        .fontSize(12)
        .fontColor('#666666')
        .margin({ top: 4 })
    }
    .alignItems(HorizontalAlign.Center)
  }
}
