import { FC } from 'react';
import { Message } from '../../globals/types';
import { useAuthContext } from '../hooks/useAuthContext';
import { VSCodeService } from '../services/VSCodeService';

export const Settings: FC = () => {
  const { setAuthState } = useAuthContext();

  const onLogoutClick = () => {
    VSCodeService.sendMessage(Message.onLogout);
    setAuthState({
      accessToken: undefined,
      githubUsername: undefined,
      userOnServerStatus: 'notFound',
    });
  };

  return (
    <>
      <button onClick={onLogoutClick}>Logout</button>
    </>
  );
};
