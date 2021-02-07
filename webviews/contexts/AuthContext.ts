import { Auth } from '../types';
import { createStateContext } from './createStateContext';

export const defaultAuth: Auth = {
  accessToken: undefined,
  githubUsername: undefined,
  userOnServerStatus: 'fetching',
};
export const AuthContext = createStateContext(defaultAuth);
