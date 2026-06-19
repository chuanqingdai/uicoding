import { useEffect, useMemo, useRef, useState } from 'react';
import { lessons } from '../data.js';
import { Container } from '../components/Layout.jsx';
import { LearningCard } from '../components/Cards.jsx';
import MasonryGrid from '../components/MasonryGrid.jsx';
import { trackEvent } from '../lib/analytics.js';
import { byCuratedShuffle, byTodayPickFirst } from '../lib/contentOrdering.js';
import { useI18n } from '../lib/i18n.jsx';

const pinnedLessonIds = [
  'ten-essential-codex-skills',
  'pallyy-74k-mrr-solo-founder-retrospective',
  'promptboard-codex-real-developer-case',
  'uicoding-skill-coding-process',
  'knowlens-codex-2b-token-tips',
];

function byPinnedThenLatest(a, b) {
  return (
    byTodayPickFirst(a, b) ||
    byCuratedShuffle({
      orderedIds: pinnedLessonIds,
      freshnessBias: 1,
      popularityBias: 0.75,
      featuredBias: 1.2,
      jitter: 12,
      scope: 'learn-page',
    })(a, b)
  );
}

const initialVisibleCount = 6;
const loadMoreCount = 6;

const topicFilters = [
  {
    id: 'all',
    label: '全部',
    matches: () => true,
  },
  {
    id: 'codex',
    label: 'Codex',
    matches: (lesson) =>
      lesson.tools?.some((tool) => tool.toLowerCase().includes('codex')) ||
      lesson.tags?.some((tag) => tag.toLowerCase().includes('codex')) ||
      lesson.title.toLowerCase().includes('codex'),
  },
  {
    id: 'claude',
    label: 'Claude',
    matches: (lesson) =>
      lesson.tools?.some((tool) => tool.toLowerCase().includes('claude')) ||
      lesson.tags?.some((tag) => tag.toLowerCase().includes('claude')) ||
      lesson.title.toLowerCase().includes('claude'),
  },
  {
    id: 'monetization',
    label: '商业变现',
    matches: (lesson) =>
      lesson.category === '商业变现' ||
      lesson.audience === '一人公司' ||
      lesson.tags?.some((tag) =>
        ['一人公司', '真实收入', 'SaaS 盈利', '月经常性收入'].includes(tag),
      ),
  },
  {
    id: 'prompts',
    label: '提示词',
    matches: (lesson) =>
      lesson.category === '提示词' ||
      lesson.tags?.some((tag) => tag.includes('提示词')) ||
      lesson.title.includes('Prompt') ||
      lesson.title.includes('提示词'),
  },
  {
    id: 'workflow',
    label: '工作流',
    matches: (lesson) =>
      lesson.category === '工作流' || lesson.tags?.includes('工作流'),
  },
  {
    id: 'team',
    label: '团队落地',
    matches: (lesson) =>
      lesson.category === '团队实践' ||
      lesson.audience === '团队负责人' ||
      lesson.tags?.some((tag) => tag.includes('团队') || tag.includes('协作')),
  },
];

export default function LearnPage() {
  const { t } = useI18n();
  const [activeTopicId, setActiveTopicId] = useState('all');
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const loadMoreRef = useRef(null);
  const activeTopic = topicFilters.find((filter) => filter.id === activeTopicId) ?? topicFilters[0];
  const visibleLessons = useMemo(
    () => [...lessons].filter(activeTopic.matches).sort(byPinnedThenLatest),
    [activeTopic],
  );
  const displayedLessons = visibleLessons.slice(0, visibleCount);
  const hasMoreLessons = visibleCount < visibleLessons.length;
  const topicCounts = useMemo(
    () =>
      Object.fromEntries(
        topicFilters.map((filter) => [
          filter.id,
          lessons.filter(filter.matches).length,
        ]),
      ),
    [],
  );

  const changeTopic = (topicId) => {
    setActiveTopicId(topicId);
    setVisibleCount(initialVisibleCount);
    trackEvent('learn_topic_filter_click', {
      page: 'learn',
      topic: topicId,
    });
  };

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMoreLessons) {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setVisibleCount(visibleLessons.length);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackEvent('content_autoload', {
            page: 'learn',
            visible_count: visibleCount,
            total_count: visibleLessons.length,
          });
          setVisibleCount((count) =>
            Math.min(count + loadMoreCount, visibleLessons.length),
          );
        }
      },
      { rootMargin: '360px 0px 360px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMoreLessons, visibleCount, visibleLessons.length]);

  return (
    <div className="learn-page">
      <section className="learn-hero">
        <Container>
          <h1>{t('learn.title')}</h1>
          <p>{t('learn.description')}</p>
          <div className="learn-topic-tabs" aria-label={t('learn.categoryLabel')}>
            {topicFilters.map((filter) => (
              <button
                aria-pressed={activeTopicId === filter.id}
                className="learn-topic-tab"
                key={filter.id}
                onClick={() => changeTopic(filter.id)}
                type="button"
              >
                <span>{t(`learn.topics.${filter.id}`) || filter.label}</span>
                <span>{topicCounts[filter.id]}</span>
              </button>
            ))}
          </div>
        </Container>
      </section>

      <Container>
        <MasonryGrid
          className="learn-grid waterfall-grid"
          items={displayedLessons}
          renderItem={(item) => <LearningCard item={item} />}
        />
        <div
          aria-hidden={!hasMoreLessons}
          className="auto-load-sentinel"
          ref={loadMoreRef}
        >
          {hasMoreLessons ? t('common.keepBrowsing') : t('common.allLessonsShown')}
        </div>
      </Container>
    </div>
  );
}
