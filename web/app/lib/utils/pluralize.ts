interface PluralizeProps {
  strings: string[];
  count: number;
}

// If count is greater than 1,
// the second string will be used,
// otherwise the first will be used
export const pluralize = (strings: string[], count: number) =>
  strings[count && count > 1 ? 1 : 0];
