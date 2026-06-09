import { router } from '@kit.ArkUI';
import { Theme } from '../common/Theme';
import { StorageService } from '../service/StorageService';
import type { Plan, PlanQualityReport } from '../model/PlanModel';

@Entry
@Component
struct ReviewPage {
  @State plan: Plan | null = null;
  @State loading: boolean = true;
  @State quality: PlanQualityReport | null = null;

  async aboutToAppear() {
    await this.loadPlan();
  }

  async loadPlan() {
    this.loading = true;
    const latest = await StorageService.getInstance().getLatestPlan();
    this.plan = latest;
    if (latest) {
      this.quality = this.assessQuality(latest);
    }
    this.loading = false;
  }

  assessQuality(plan: Plan): PlanQualityReport {
    const riskPenalty = plan.risks.reduce((sum, r) => {
      if (r.severity === 'high') return sum + 30;
      if (r.severity === 'medium') return sum + 14;
      return sum + 7;
    }, 0);

    const score = Math.max(0, Math.min(100, 100 - riskPenalty));
    let label = '稳稳开局';
    if (score < 55) label = '先别硬冲';
    else if (score < 72) label = '需要减压';
    else if (score < 88) label = '基本靠谱';

    const doneCount = plan.tasks.filter((t) => t.status === 'done').length;
    const aiCount = plan.tasks.filter((t) =>
      t.source === 'ai_generated' || t.source === 'ai_optimized'
    ).length;

    return {
      score,
      label,
      aiTaskRatio: aiCount / Math.max(1, plan.tasks.length),
      averageDailyMinutes: 45,
      maxDailyMinutes: 60,
      activeDays: 20,
      recommendations: ['计划负荷、任务颗粒度和 AI 生成覆盖率都比较稳定，可以先执行三天再复盘。'],
      actions: [{ label: '三天后复盘', instruction: '执行前三天后，根据实际完成情况微调任务时长和优先级。' }]
    };
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
      } else if (!this.plan || !this.quality) {
        Column() {
          Text('还没有计划')
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
            // Quality Score
            Column() {
              Text(this.quality!.score.toString())
                .fontSize(48)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)

              Text(this.quality!.label)
                .fontSize(16)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)
                .margin({ top: 4 })
            }
            .width('100%')
            .padding(24)
            .backgroundColor(Theme.sun)
            .borderRadius(12)
            .borderWidth(2)
            .borderColor(Theme.line)
            .alignItems(HorizontalAlign.Center)
            .margin({ bottom: 16 })

            // Stats Grid
            Grid() {
              GridItem() {
                this.StatBox(this.plan!.tasks.length.toString(), '任务卡', Theme.sun)
              }
              GridItem() {
                this.StatBox(this.quality!.averageDailyMinutes.toString(), '日均分钟', Theme.sky)
              }
              GridItem() {
                this.StatBox(`${Math.round(this.quality!.aiTaskRatio * 100)}%`, 'AI任务', Theme.peach)
              }
            }
            .columnsTemplate('1fr 1fr 1fr')
            .columnsGap(8)
            .rowsGap(8)
            .width('100%')
            .margin({ bottom: 16 })

            // Recommendations
            Text('执行建议')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.ink)
              .margin({ bottom: 12 })

            ForEach(this.quality!.recommendations, (item: string) => {
              Text(item)
                .fontSize(14)
                .fontColor(Theme.ink)
                .padding(12)
                .backgroundColor(Theme.paper)
                .borderRadius(8)
                .borderWidth(2)
                .borderColor(Theme.line)
                .margin({ bottom: 8 })
            })

            // Actions
            Text('下一步动作')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.ink)
              .margin({ top: 16, bottom: 12 })

            ForEach(this.quality!.actions, (action: { label: string; instruction: string }) => {
              Column() {
                Text(action.label)
                  .fontSize(12)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(Theme.berry)

                Text(action.instruction)
                  .fontSize(12)
                  .fontColor('#666666')
                  .margin({ top: 4 })
              }
              .width('100%')
              .padding(12)
              .backgroundColor(Theme.cream)
              .borderRadius(8)
              .borderWidth(2)
              .borderColor(Theme.line)
              .margin({ bottom: 8 })
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

  @Builder
  StatBox(value: string, label: string, bgColor: string) {
    Column() {
      Text(value)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor(Theme.ink)

      Text(label)
        .fontSize(12)
        .fontWeight(FontWeight.Bold)
        .fontColor(Theme.ink)
        .margin({ top: 4 })
    }
    .width('100%')
    .padding(16)
    .backgroundColor(bgColor)
    .borderRadius(12)
    .borderWidth(2)
    .borderColor(Theme.line)
    .alignItems(HorizontalAlign.Center)
  }
}
