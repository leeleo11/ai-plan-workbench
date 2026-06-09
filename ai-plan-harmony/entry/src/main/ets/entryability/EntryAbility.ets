import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';
import { StorageService } from '../service/StorageService';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    hilog.info(0x0000, 'EntryAbility', 'onCreate');
    StorageService.getInstance().init(this.context);
  }

  onDestroy(): void {
    hilog.info(0x0000, 'EntryAbility', 'onDestroy');
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    hilog.info(0x0000, 'EntryAbility', 'onWindowStageCreate');
    windowStage.loadContent('pages/Index', (err) => {
      if (err.code) {
        hilog.error(0x0000, 'EntryAbility', 'Failed to load content: %{public}s', JSON.stringify(err));
        return;
      }
      hilog.info(0x0000, 'EntryAbility', 'Content loaded successfully');
    });
  }

  onWindowStageDestroy(): void {
    hilog.info(0x0000, 'EntryAbility', 'onWindowStageDestroy');
  }

  onForeground(): void {
    hilog.info(0x0000, 'EntryAbility', 'onForeground');
  }

  onBackground(): void {
    hilog.info(0x0000, 'EntryAbility', 'onBackground');
  }
}
