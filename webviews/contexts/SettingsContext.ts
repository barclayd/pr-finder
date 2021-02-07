import { SettingsService } from '../../src/services/SettingsService';
import { createStateContext } from './createStateContext';

export const defaultSettings = SettingsService.defaultSettings;
export const SettingsContext = createStateContext(defaultSettings);
