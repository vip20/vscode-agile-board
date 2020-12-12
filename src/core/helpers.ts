export function reorderList(
  list: any[],
  startIndex: number,
  endIndex: number
): any[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}
