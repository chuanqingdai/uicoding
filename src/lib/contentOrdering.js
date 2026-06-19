const editorialPickDate = '2026-06-17';
const pageLoadSeed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

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

function hashString(input = '') {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function getRank(id, orderedIds = []) {
  const index = orderedIds.indexOf(id);
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

export function byRank(orderedIds = []) {
  return (a, b) => getRank(a.id, orderedIds) - getRank(b.id, orderedIds);
}

export function getRefreshJitter(id, scope = 'default') {
  const hash = hashString(`${pageLoadSeed}:${scope}:${id}`);
  return (hash % 1000) / 1000;
}

function getPriorityBoost(item, orderedIds = []) {
  const rank = getRank(item.id, orderedIds);

  if (!Number.isFinite(rank)) {
    return 0;
  }

  return Math.max(orderedIds.length - rank, 1) * 18;
}

function getRecencyBoost(item) {
  const publishedTime = getPublishedTime(item);

  if (!publishedTime) {
    return 0;
  }

  const ageDays = Math.max(0, (Date.now() - publishedTime) / 86400000);
  return Math.max(0, 45 - ageDays);
}

function getPopularityBoost(item) {
  const views = Math.max(0, item.viewCount ?? 0);
  const likes = Math.max(0, item.likeCount ?? 0);

  return Math.log10(views + 10) * 14 + Math.log10(likes + 1) * 10;
}

export function getCuratedQualityScore(
  item,
  {
    orderedIds = [],
    freshnessBias = 1,
    popularityBias = 1,
    featuredBias = 1,
  } = {},
) {
  return (
    getPriorityBoost(item, orderedIds) +
    getRecencyBoost(item) * freshnessBias +
    getPopularityBoost(item) * popularityBias +
    (item.featured ? 28 * featuredBias : 0)
  );
}

export function byCuratedShuffle({
  orderedIds = [],
  freshnessBias = 1,
  popularityBias = 1,
  featuredBias = 1,
  jitter = 8,
  scope = 'default',
} = {}) {
  return (a, b) => {
    const scoreA =
      getCuratedQualityScore(a, {
        orderedIds,
        freshnessBias,
        popularityBias,
        featuredBias,
      }) +
      getRefreshJitter(a.id, scope) * jitter;
    const scoreB =
      getCuratedQualityScore(b, {
        orderedIds,
        freshnessBias,
        popularityBias,
        featuredBias,
      }) +
      getRefreshJitter(b.id, scope) * jitter;

    return scoreB - scoreA;
  };
}
