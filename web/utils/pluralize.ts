export const pluralize = (strings: string[], count: number) =>
  strings[count && count === 1 ? 0 : 1];
