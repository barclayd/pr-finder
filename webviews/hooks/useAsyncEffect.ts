import { DependencyList, useEffect } from 'react';

export const useAsyncEffect = <T>(
  effect: () => T | Promise<T>,
  deps?: DependencyList,
) => {
  useEffect(() => {
    (async () => {
      await effect();
    })();
  }, deps);
};
