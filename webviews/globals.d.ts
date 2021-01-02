import { vsCodeData } from './types';

declare global {
  const tsVscode: {
    postMessage: (Data: vsCodeData) => void;
  };
}

export {};
