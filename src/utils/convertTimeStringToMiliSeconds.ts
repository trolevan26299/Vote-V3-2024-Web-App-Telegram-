export const convertToMilliseconds = (str: string) =>
  new Date(str.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2}:\d{2})/, '$3-$2-$1T$4')).getTime();
