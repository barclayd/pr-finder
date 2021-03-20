import { Settings } from '../../globals/types';
import { GlobalStateService } from './GlobalStateService';

const ONE_MINUTE = 1000 * 60;
const THREE_MINUTES = ONE_MINUTE * 3;

export class SettingsService {
  static SETTINGS = 'SETTINGS';

  static defaultSettings: Settings = {
    showDrafts: true,
    showNotifications: true,
    refreshTime: THREE_MINUTES,
  };

  constructor(private globalStateService: GlobalStateService) {}

  public async init() {
    if (this.getSettings() === undefined) {
      await this.setSettings(SettingsService.defaultSettings);
    }
  }

  public getSettings() {
    return this.globalStateService.get<Settings>(SettingsService.SETTINGS);
  }

  public async setSettings(settings: Settings) {
    await this.globalStateService.update(SettingsService.SETTINGS, settings);
  }

  public async resetSettings() {
    await this.setSettings(SettingsService.defaultSettings);
  }
}
