import '../styles/settings.css';
import { ChangeEvent, FC } from 'react';
import { Message } from '../../globals/types';
import { useAuthContext } from '../hooks/useAuthContext';
import { useSettingsContext } from '../hooks/useSettingsContext';
import { VSCodeService } from '../services/VSCodeService';

const minutesToMilliseconds = (minutes: number) => minutes * 60 * 1000;

export const Settings: FC = () => {
  const { setState: setAuthState } = useAuthContext();
  const { refreshTime, setState: setSettingsState } = useSettingsContext();

  const refreshTimeInMinutes = refreshTime / 1000 / 60;

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
    }
    const roundedRefreshInput = (Math.round(refreshInput * 2) / 2).toFixed(1);
    if (Number.isNaN(roundedRefreshInput)) {
      return;
    }
    setSettingsState({
      refreshTime: minutesToMilliseconds(parseFloat(roundedRefreshInput)),
    });
  };

  const minutesLabel = refreshTimeInMinutes > 1 ? 'Minutes' : 'Minute';

  return (
    <>
      <button onClick={onLogoutClick}>Logout</button>
      <div className="refresh-time-container">
        <input
          id="refresh-time"
          type="number"
          value={refreshTimeInMinutes}
          onChange={onChangeRefreshTime}
          step={0.5}
        />
        <label htmlFor="refresh-time">{minutesLabel}</label>
      </div>
    </>
  );
};
