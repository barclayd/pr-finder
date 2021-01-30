import { FC } from 'react';
import { VSCodeService } from '../services/VSCodeService';
import { Message } from '../../globals/types';

const onLogoutClick = () => {
  VSCodeService.sendMessage(Message.onLogin);
};

export const Settings: FC = () => {
  return (
    <>
      <button onClick={onLogoutClick}>Logout</button>
    </>
  );
};
