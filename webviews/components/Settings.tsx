import '../styles/settings.css';
import { ChangeEvent, FC, useEffect } from 'react';
import { Message } from '../../globals/types';
import { Settings as SettingsType } from '../../globals/types';
import { useAuthContext } from '../hooks/useAuthContext';
import { usePrevious } from '../hooks/usePrevious';
import { useSettingsContext } from '../hooks/useSettingsContext';
import { VSCodeService } from '../services/VSCodeService';
import { Switch } from './Switch';

const minutesToMilliseconds = (minutes: number) => minutes * 60 * 1000;

export const Settings: FC = () => {
  const { setState: setAuthState } = useAuthContext();
  const settingsContext = useSettingsContext();
  const previousSettings = usePrevious(settingsContext);
  const {
    refreshTime,
    showDrafts,
    showNotifications,
    setState: setSettingsState,
  } = settingsContext;

  const refreshTimeInMinutes = refreshTime / 1000 / 60;

  useEffect(() => {
    if (previousSettings !== settingsContext) {
      VSCodeService.sendMessage(Message.setSettings, {
        refreshTime,
        showDrafts,
        showNotifications,
      } as SettingsType);
    }
  }, [settingsContext]);

  const onLogoutClick = () => {
    VSCodeService.sendMessage(Message.onLogout);
    setAuthState({
      accessToken: undefined,
      githubUsername: undefined,
      userOnServerStatus: 'notFound',
    });
  };

  const onChangeRefreshTime = (event: ChangeEvent<HTMLInputElement>) => {
    const refreshInput = parseFloat(event.target.value);
    if (Number.isNaN(refreshInput)) {
      return;
    }
    if (refreshInput < 0.5) {
      return;
    }
    if (Number.isInteger(refreshInput)) {
      setSettingsState({
        refreshTime: minutesToMilliseconds(refreshInput),
      });
      return;
    }
    const roundedRefreshInput = (Math.round(refreshInput * 2) / 2).toFixed(1);
    if (Number.isNaN(roundedRefreshInput)) {
      return;
    }
    setSettingsState({
      refreshTime: minutesToMilliseconds(parseFloat(roundedRefreshInput)),
    });
  };

  const onShowDraftsChange = (showDrafts: SettingsType['showDrafts']) => {
    setSettingsState({
      showDrafts,
    });
  };

  const onShowNotificationsChange = (
    showNotifications: SettingsType['showNotifications'],
  ) => {
    setSettingsState({
      showNotifications,
    });
  };

  const minutesSuffix = refreshTimeInMinutes === 1 ? '' : 's';
  const minutesLabel = `PR refresh interval (minute${minutesSuffix})`;

  return (
    <div className="settings-container">
      <div className="settings-row">
        <label htmlFor="refresh-time">{minutesLabel}</label>
        <input
          id="refresh-time"
          type="number"
          value={refreshTimeInMinutes}
          onChange={onChangeRefreshTime}
          step={0.5}
        />
      </div>
      <div className="settings-row">
        <label htmlFor="show-notifications">Show notifications</label>
        <Switch
          id="show-notifications"
          isChecked={showNotifications}
          onToggle={onShowNotificationsChange}
        />
      </div>
      <div className="settings-row">
        <label htmlFor="show-drafts">Show draft PRs</label>
        <Switch
          id="show-drafts"
          isChecked={showDrafts}
          onToggle={onShowDraftsChange}
        />
      </div>
      <div className="settings-row">
        <button onClick={onLogoutClick}>Logout</button>
      </div>
    </div>
  );
};
