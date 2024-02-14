export function findMostRepeatedString(arr: string[]): string {
  const countMap: Record<string, number> = {};
  let mostRepeatedString = arr[0];
  let maxCount = 1;

  for (const str of arr) {
    if (countMap[str]) {
      countMap[str]++;
    } else {
      countMap[str] = 1;
    }

    if (countMap[str] > maxCount) {
      mostRepeatedString = str;
      maxCount = countMap[str];
    }
  }

  return mostRepeatedString;
}
