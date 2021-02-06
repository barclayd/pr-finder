import { createContext } from 'react';
import { State } from '../types';

export const createStateContext = <T>(defaultContext: T) =>
  createContext<State<T>>({
    ...defaultContext,
    setState: () => {},
  });
