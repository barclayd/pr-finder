import { vsCodeData } from '../globals/types';

declare global {
  const tsVscode: {
    postMessage: (Data: vsCodeData) => void;
  };
}

export {};
