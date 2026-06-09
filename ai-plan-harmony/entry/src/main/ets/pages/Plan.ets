import { router } from '@kit.ArkUI';
import { Theme, categoryLabel, statusLabel } from '../common/Theme';
import { StorageService } from '../service/StorageService';
import type { Plan, PlanTask } from '../model/PlanModel';

@Entry
@Component
struct PlanPage {
  @State plan: Plan | null = null;
  @State loading: boolean = true;
  @State filter: string = 'all';
  @State filteredTasks: PlanTask[] = [];

  async aboutToAppear() {
    await this.loadPlan();
  }

  async loadPlan() {
    this.loading = true;
    const latest = await StorageService.getInstance().getLatestPlan();
    this.plan = latest;
    this.applyFilter();
    this.loading = false;
  }

  applyFilter() {
    if (!this.plan) {
      this.filteredTasks = [];
      return;
    }
    this.filteredTasks = this.plan.tasks.filter((t) =>
      this.filter === 'all' || t.status === this.filter
    );
  }

  build() {
    Column() {
      // Header
      Row() {
        Text('返回')
          .fontSize(14)
          .fontColor(Theme.berry)
          .fontWeight(FontWeight.Bold)
          .onClick(() => router.back())
      }
      .width('100%')
      .padding(16)

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
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.ink)

          Text('去生成')
            .fontSize(16)
            .fontColor(Theme.berry)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 12 })
            .onClick(() => router.pushUrl({ url: 'pages/Generate' }))
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
      } else {
        Scroll() {
          Column() {
            // Filter tabs
            Row() {
              ForEach(['all', 'todo', 'done', 'delayed'], (f: string) => {
                Text(f === 'all' ? '全部' : statusLabel[f] ?? f)
                  .fontSize(12)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(this.filter === f ? Theme.ink : '#666666')
                  .backgroundColor(this.filter === f ? Theme.sky : Theme.paper)
                  .borderRadius(16)
                  .borderWidth(2)
                  .borderColor(Theme.line)
                  .padding({ left: 12, right: 12, top: 6, bottom: 6 })
                  .margin({ right: 8 })
                  .onClick(() => {
                    this.filter = f;
                    this.applyFilter();
                  })
              })
            }
            .width('100%')
            .margin({ bottom: 16 })

            // Phases
            Text('路线关卡')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.ink)
              .margin({ bottom: 12 })

            ForEach(this.plan!.phases, (phase: Phase, index: number) => {
              Row() {
                Column() {
                  Text((index + 1).toString())
                    .fontSize(14)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(Theme.ink)
                }
                .width(28)
                .height(28)
                .borderRadius(14)
                .backgroundColor(Theme.sun)
                .borderWidth(2)
                .borderColor(Theme.line)
                .justifyContent(FlexAlign.Center)
                .alignItems(HorizontalAlign.Center)
                .margin({ right: 12 })

                Column() {
                  Text(phase.title)
                    .fontSize(14)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(Theme.ink)

                  Text(`${phase.startDate} 到 ${phase.endDate}`)
                    .fontSize(11)
                    .fontColor('#666666')
                    .margin({ top: 2 })

                  Text(phase.objective)
                    .fontSize(12)
                    .fontColor('#666666')
                    .margin({ top: 4 })
                }
                .layoutWeight(1)
              }
              .width('100%')
              .padding(12)
              .backgroundColor(Theme.paper)
              .borderRadius(12)
              .borderWidth(2)
              .borderColor(Theme.line)
              .margin({ bottom: 8 })
            })

            // Tasks
            Text(`任务时间线 (${this.filteredTasks.length})`)
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.ink)
              .margin({ top: 16, bottom: 12 })

            ForEach(this.filteredTasks, (task: PlanTask) => {
              Column() {
                Text(task.title)
                  .fontSize(14)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.ink)

                Text(`${task.durationMinutes} 分钟 · ${categoryLabel[task.category] ?? task.category}`)
                  .fontSize(11)
                  .fontColor('#666666')
                  .margin({ top: 4 })
              }
              .width('100%')
              .padding(12)
              .backgroundColor(task.status === 'done' ? Theme.mint : Theme.paper)
              .borderRadius(8)
              .borderWidth(1)
              .borderColor(Theme.line)
              .margin({ bottom: 6 })
              .onClick(() => router.pushUrl({
                url: 'pages/TaskDetail',
                params: { taskId: task.id }
              }))
            })
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
}
