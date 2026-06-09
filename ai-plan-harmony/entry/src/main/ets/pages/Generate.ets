import { router } from '@kit.ArkUI';
import { Theme } from '../common/Theme';
import { ApiService } from '../service/ApiService';
import { StorageService } from '../service/StorageService';

@Entry
@Component
struct GeneratePage {
  @State goal: string = '';
  @State startDate: string = new Date().toISOString().split('T')[0];
  @State durationDays: string = '30';
  @State dailyHours: string = '1';
  @State currentLevel: string = '';
  @State targetLevel: string = '';
  @State isDurationUncertain: boolean = false;
  @State isGenerating: boolean = false;
  @State error: string | null = null;

  async handleGenerate() {
    if (this.goal.trim().length < 2) return;

    this.isGenerating = true;
    this.error = null;

    try {
      const parts: string[] = [];
      if (this.startDate.trim()) parts.push(`${this.startDate.trim()}开始`);
      parts.push(
        this.isDurationUncertain
          ? `${this.goal.trim()}，计划时长暂不确定，先生成30天滚动计划`
          : `${this.durationDays.trim()}天${this.goal.trim()}`
      );
      if (this.currentLevel.trim() || this.targetLevel.trim()) {
        parts.push(`从${this.currentLevel.trim() || '未说明'}到${this.targetLevel.trim() || '未说明'}`);
      }
      if (this.dailyHours.trim()) parts.push(`每天投入${this.dailyHours.trim()}小时`);
      const input = parts.join('，');

      const plan = await ApiService.generatePlan(input);
      await StorageService.getInstance().savePlan(plan);
      router.back();
    } catch (err) {
      this.error = err instanceof Error ? err.message : '生成失败，请稍后再试';
    } finally {
      this.isGenerating = false;
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

      Scroll() {
        Column() {
          Text('创建新计划')
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.ink)

          Text('告诉 AI 你的目标，它会帮你拆解成每日任务。')
            .fontSize(14)
            .fontColor('#666666')
            .margin({ top: 4, bottom: 20 })

          // Goal input
          Text('大目标')
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.ink)
            .margin({ bottom: 6 })

          TextArea({ text: this.goal, placeholder: '例如：30天养成晨跑习惯' })
            .height(100)
            .backgroundColor(Theme.cream)
            .borderRadius(8)
            .borderWidth(2)
            .borderColor(Theme.line)
            .fontSize(16)
            .fontColor(Theme.ink)
            .onChange((value: string) => this.goal = value)

          // Date and duration
          Row() {
            Column() {
              Text('开始日期')
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)
                .margin({ bottom: 6 })

              TextInput({ text: this.startDate, placeholder: '2026-06-02' })
                .backgroundColor(Theme.cream)
                .borderRadius(8)
                .borderWidth(2)
                .borderColor(Theme.line)
                .fontSize(16)
                .fontColor(Theme.ink)
                .onChange((value: string) => this.startDate = value)
            }
            .layoutWeight(1)

            Column() {
              Text('计划天数')
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)
                .margin({ bottom: 6 })

              TextInput({
                text: this.isDurationUncertain ? '' : this.durationDays,
                placeholder: '30'
              })
                .backgroundColor(Theme.cream)
                .borderRadius(8)
                .borderWidth(2)
                .borderColor(Theme.line)
                .fontSize(16)
                .fontColor(Theme.ink)
                .enabled(!this.isDurationUncertain)
                .type(InputType.Number)
                .onChange((value: string) => this.durationDays = value)
            }
            .layoutWeight(1)
            .margin({ left: 12 })
          }
          .width('100%')

          // Daily hours
          Text('每天投入（小时）')
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.ink)
            .margin({ top: 12, bottom: 6 })

          TextInput({ text: this.dailyHours, placeholder: '1' })
            .backgroundColor(Theme.cream)
            .borderRadius(8)
            .borderWidth(2)
            .borderColor(Theme.line)
            .fontSize(16)
            .fontColor(Theme.ink)
            .type(InputType.Decimal)
            .onChange((value: string) => this.dailyHours = value)

          // Uncertain duration toggle
          Row() {
            Text('时间不确定，先做 30 天滚动计划')
              .fontSize(14)
              .fontWeight(FontWeight.Bold)
              .fontColor(Theme.ink)

            Toggle({ type: ToggleType.Switch, isOn: this.isDurationUncertain })
              .onChange((isOn: boolean) => this.isDurationUncertain = isOn)
          }
          .width('100%')
          .justifyContent(FlexAlign.SpaceBetween)
          .margin({ top: 12 })

          // Levels
          Row() {
            Column() {
              Text('当前水平')
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)
                .margin({ bottom: 6 })

              TextInput({ text: this.currentLevel, placeholder: '例如：零基础' })
                .backgroundColor(Theme.cream)
                .borderRadius(8)
                .borderWidth(2)
                .borderColor(Theme.line)
                .fontSize(16)
                .fontColor(Theme.ink)
                .onChange((value: string) => this.currentLevel = value)
            }
            .layoutWeight(1)

            Column() {
              Text('目标水平')
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor(Theme.ink)
                .margin({ bottom: 6 })

              TextInput({ text: this.targetLevel, placeholder: '例如：能独立做项目' })
                .backgroundColor(Theme.cream)
                .borderRadius(8)
                .borderWidth(2)
                .borderColor(Theme.line)
                .fontSize(16)
                .fontColor(Theme.ink)
                .onChange((value: string) => this.targetLevel = value)
            }
            .layoutWeight(1)
            .margin({ left: 12 })
          }
          .width('100%')
          .margin({ top: 12 })

          // Error message
          if (this.error) {
            Text(this.error!)
              .fontSize(14)
              .fontColor('red')
              .margin({ top: 12 })
          }

          // Generate button
          Button(this.isGenerating ? '正在生成...' : '生成我的闯关计划')
            .width('100%')
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.ink)
            .backgroundColor(Theme.sun)
            .borderRadius(12)
            .borderWidth(2)
            .borderColor(Theme.line)
            .margin({ top: 20 })
            .enabled(!this.isGenerating && this.goal.trim().length >= 2)
            .opacity(this.isGenerating || this.goal.trim().length < 2 ? 0.5 : 1)
            .onClick(() => this.handleGenerate())
        }
        .width('100%')
        .padding(16)
      }
      .width('100%')
      .height('100%')
      .scrollBar(BarState.Off)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Theme.cream)
  }
}
