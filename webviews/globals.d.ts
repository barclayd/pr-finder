declare global {
  const tsVscode: {
    postMessage: ({ type: string, value: string }) => void;
  };
}

export {};
