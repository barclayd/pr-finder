import { createStateContext } from './createStateContext';

const ONE_MINUTE = 1000 * 60;
const THREE_MINUTES = ONE_MINUTE * 3;

export const defaultSettings = {
  showDrafts: true,
  showNotifications: true,
  refreshTime: THREE_MINUTES,
};
export const SettingsContext = createStateContext(defaultSettings);
