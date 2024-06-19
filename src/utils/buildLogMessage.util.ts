export const buildLogMessage = (
  message: string,
  reqBody?: string,
  response?: string,
  stask?: string,
): string => {
  const args = [
    { lable: 'RequestBody', value: reqBody },
    { lable: 'Response', value: response },
    { lable: 'Stack', value: stask },
  ];

  return args.reduce((previousValue: string, currentValue) => {
    if (currentValue.value) {
      return `${previousValue}-[${currentValue.lable}: ${currentValue.value}]`;
    } else {
      return previousValue;
    }
  }, `[Message: ${message}]`);
};
