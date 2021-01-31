import { createContext } from 'react';
import { Auth, AuthState } from '../types';

export const defaultAuth: Auth = {
  accessToken: undefined,
  githubUsername: undefined,
  userOnServerStatus: 'fetching',
};

export const AuthContext = createContext<AuthState>({
  ...defaultAuth,
  setAuthState: () => {},
});
