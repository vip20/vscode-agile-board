export function reorderList(
  list: string[],
  startIndex: number,
  endIndex: number
): string[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}
