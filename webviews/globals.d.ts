import { VSCodeData } from '../globals/types';

declare global {
  const tsVscode: {
    postMessage: (Data: VSCodeData) => void;
  };
}

export {};
