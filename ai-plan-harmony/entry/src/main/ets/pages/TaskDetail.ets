import { router } from '@kit.ArkUI';
import { Theme, categoryLabel, statusLabel } from '../common/Theme';
import { ApiService } from '../service/ApiService';
import { StorageService } from '../service/StorageService';
import type { Plan, PlanTask } from '../model/PlanModel';

@Entry
@Component
struct TaskDetailPage {
  @State plan: Plan | null = null;
  @State task: PlanTask | null = null;
  @State instruction: string = '把这张任务卡改得更具体一点';
  @State isOptimizing: boolean = false;
  @State loading: boolean = true;

  async aboutToAppear() {
    await this.loadTask();
  }

  async loadTask() {
    this.loading = true;
    const params = router.getParams() as Record<string, string>;
    const taskId = params?.['taskId'];
    const latest = await StorageService.getInstance().getLatestPlan();
    if (latest) {
      this.plan = latest;
      this.task = latest.tasks.find((t) => t.id === taskId) ?? null;
    }
    this.loading = false;
  }

  async saveTask(updated: PlanTask) {
    if (!this.plan) return;
    const nextPlan: Plan = {
      ...this.plan,
      tasks: this.plan.tasks.map((t) => t.id === updated.id ? updated : t)
    };
    this.plan = nextPlan;
    this.task = updated;
    await StorageService.getInstance().savePlan(nextPlan);
  }

  async handleOptimize() {
    if (!this.plan || !this.task || !this.instruction.trim()) return;
    this.isOptimizing = true;
    try {
      const optimized = await ApiService.optimizePlan(
        this.plan,
        [this.task.id],
        this.instruction
      );
      this.plan = optimized;
      this.task = optimized.tasks.find((t) => t.id === this.task?.id) ?? null;
      await StorageService.getInstance().savePlan(optimized);
    } catch (err) {
      console.error('Optimize failed:', err);
    } finally {
      this.isOptimizing = false;
    }
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
      } else if (!this.task) {
        Column() {
          Text('任务不存在')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.ink)
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
      } else {
        Scroll() {
          Column() {
            // Task info card
            Column() {
              Text('关卡名称')
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)
                .margin({ bottom: 6 })

              TextInput({ text: this.task!.title })
                .width('100%')
                .backgroundColor(Theme.cream)
                .borderRadius(8)
                .borderWidth(2)
                .borderColor(Theme.line)
                .fontSize(16)
                .fontColor(Theme.ink)
                .onChange((value: string) => this.saveTask({ ...this.task!, title: value, source: 'user_edited' }))

              Text('任务说明')
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)
                .margin({ top: 12, bottom: 6 })

              TextArea({ text: this.task!.description ?? '' })
                .width('100%')
                .height(80)
                .backgroundColor(Theme.cream)
                .borderRadius(8)
                .borderWidth(2)
                .borderColor(Theme.line)
                .fontSize(16)
                .fontColor(Theme.ink)
                .onChange((value: string) => this.saveTask({ ...this.task!, description: value || undefined, source: 'user_edited' }))

              Row() {
                Column() {
                  Text('挑战日期')
                    .fontSize(14)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(Theme.ink)
                    .margin({ bottom: 6 })

                  TextInput({ text: this.task!.date })
                    .width('100%')
                    .backgroundColor(Theme.cream)
                    .borderRadius(8)
                    .borderWidth(2)
                    .borderColor(Theme.line)
                    .fontSize(16)
                    .fontColor(Theme.ink)
                    .onChange((value: string) => this.saveTask({ ...this.task!, date: value, source: 'user_edited' }))
                }
                .layoutWeight(1)

                Column() {
                  Text('预计用时')
                    .fontSize(14)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(Theme.ink)
                    .margin({ bottom: 6 })

                  TextInput({ text: this.task!.durationMinutes.toString() })
                    .width('100%')
                    .backgroundColor(Theme.cream)
                    .borderRadius(8)
                    .borderWidth(2)
                    .borderColor(Theme.line)
                    .fontSize(16)
                    .fontColor(Theme.ink)
                    .type(InputType.Number)
                    .onChange((value: string) => this.saveTask({ ...this.task!, durationMinutes: Number(value) || 0, source: 'user_edited' }))
                }
                .layoutWeight(1)
                .margin({ left: 12 })
              }
              .width('100%')
              .margin({ top: 12 })

              Row() {
                Column() {
                  Text('任务类型')
                    .fontSize(14)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(Theme.ink)
                    .margin({ bottom: 6 })

                  Text(categoryLabel[this.task!.category] ?? this.task!.category)
                    .fontSize(12)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(Theme.ink)
                    .backgroundColor(Theme.mint)
                    .borderRadius(12)
                    .borderWidth(2)
                    .borderColor(Theme.line)
                    .padding({ left: 12, right: 12, top: 6, bottom: 6 })
                }
                .layoutWeight(1)

                Column() {
                  Text('当前状态')
                    .fontSize(14)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(Theme.ink)
                    .margin({ bottom: 6 })

                  Row() {
                    ForEach(['todo', 'done', 'skipped', 'delayed'], (s: string) => {
                      Text(statusLabel[s] ?? s)
                        .fontSize(11)
                        .fontWeight(FontWeight.Bold)
                        .fontColor(this.task!.status === s ? Theme.ink : '#666666')
                        .backgroundColor(this.task!.status === s ? Theme.sky : Theme.cream)
                        .borderRadius(12)
                        .borderWidth(2)
                        .borderColor(Theme.line)
                        .padding({ left: 10, right: 10, top: 6, bottom: 6 })
                        .margin({ right: 6 })
                        .onClick(() => this.saveTask({ ...this.task!, status: s, source: 'user_edited' }))
                    })
                  }
                }
                .layoutWeight(1)
              }
              .width('100%')
              .margin({ top: 12 })
            }
            .width('100%')
            .padding(16)
            .backgroundColor(Theme.paper)
            .borderRadius(12)
            .borderWidth(2)
            .borderColor(Theme.line)
            .margin({ bottom: 16 })

            // AI Optimization card
            Column() {
              Text('AI 优化')
                .fontSize(18)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)

              Text('告诉 AI 你想怎么改这张任务卡。')
                .fontSize(12)
                .fontColor('#666666')
                .margin({ top: 4, bottom: 12 })

              TextArea({ text: this.instruction })
                .width('100%')
                .height(80)
                .backgroundColor(Theme.cream)
                .borderRadius(8)
                .borderWidth(2)
                .borderColor(Theme.line)
                .fontSize(16)
                .fontColor(Theme.ink)
                .onChange((value: string) => this.instruction = value)

              Button(this.isOptimizing ? '正在优化...' : '预览修改')
                .width('100%')
                .fontSize(16)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)
                .backgroundColor(Theme.peach)
                .borderRadius(12)
                .borderWidth(2)
                .borderColor(Theme.line)
                .margin({ top: 12 })
                .enabled(!this.isOptimizing && !!this.instruction.trim())
                .opacity(this.isOptimizing || !this.instruction.trim() ? 0.5 : 1)
                .onClick(() => this.handleOptimize())
            }
            .width('100%')
            .padding(16)
            .backgroundColor(Theme.paper)
            .borderRadius(12)
            .borderWidth(2)
            .borderColor(Theme.line)
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
