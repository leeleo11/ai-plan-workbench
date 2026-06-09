import { Theme, categoryLabel, priorityLabel } from '../common/Theme';
import type { PlanTask } from '../model/PlanModel';

@Component
export struct TaskCardComponent {
  @Prop task: PlanTask;
  onToggleStatus: (task: PlanTask) => void = () => {};
  onNavigate: (taskId: string) => void = () => {};

  build() {
    Column() {
      // Task content
      Column() {
        Text(this.task.title)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.ink)

        if (this.task.description) {
          Text(this.task.description!)
            .fontSize(12)
            .fontColor('#666666')
            .maxLines(2)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .margin({ top: 4 })
        }

        Row() {
          Text(`${this.task.durationMinutes} 分钟 · ${categoryLabel[this.task.category] ?? this.task.category}`)
            .fontSize(12)
            .fontColor('#666666')

          Text(this.task.status === 'done' ? '已打卡' : priorityLabel[this.task.priority] ?? this.task.priority)
            .fontSize(10)
            .fontWeight(FontWeight.Bold)
            .fontColor(Theme.ink)
            .backgroundColor(this.task.status === 'done' ? Theme.sun : Theme.sky)
            .borderRadius(12)
            .padding({ left: 8, right: 8, top: 2, bottom: 2 })
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ top: 8 })
      }
      .padding(16)
      .onClick(() => this.onNavigate(this.task.id))

      // Action button
      Row() {
        Text(this.task.status === 'done' ? '撤销打卡' : '打卡通关')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor(Theme.ink)
      }
      .width('100%')
      .height(44)
      .justifyContent(FlexAlign.Center)
      .backgroundColor(this.task.status === 'done' ? Theme.peach : Theme.sun)
      .borderWidth({ top: 2 })
      .borderColor(Theme.line)
      .onClick(() => this.onToggleStatus(this.task))
    }
    .backgroundColor(this.task.status === 'done' ? Theme.mint : Theme.paper)
    .borderRadius(12)
    .borderWidth(2)
    .borderColor(Theme.line)
    .margin({ bottom: 12 })
  }
}
