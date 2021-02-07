import { useState } from 'react';

/*
 * A custom hook built on top of useState
 * @param initialState - The initial state to be set
 * @returns An array of [state, partialSetStateMethod]
 */
export const usePartialState = <T>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);

  const setPartialState = (partialState: Partial<T>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  return [state, setPartialState] as const;
};
