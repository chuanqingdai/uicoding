const editorialPickDate = '2026-06-17';

export function getPublishedTime(item) {
  return new Date(item.publishedAt || 0).getTime();
}

export function isEditorialPickToday(item) {
  return Boolean(item.featured && String(item.publishedAt || '').startsWith(editorialPickDate));
}

export function byTodayPickFirst(a, b) {
  return Number(isEditorialPickToday(b)) - Number(isEditorialPickToday(a));
}

export function byLatest(a, b) {
  return getPublishedTime(b) - getPublishedTime(a);
}

export function getRank(id, orderedIds = []) {
  const index = orderedIds.indexOf(id);
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

export function byRank(orderedIds = []) {
  return (a, b) => getRank(a.id, orderedIds) - getRank(b.id, orderedIds);
}
