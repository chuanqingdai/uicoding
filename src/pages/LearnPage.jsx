import { useEffect, useMemo, useRef, useState } from 'react';
import { lessons } from '../data.js';
import { Container } from '../components/Layout.jsx';
import { LearningCard } from '../components/Cards.jsx';
import MasonryGrid from '../components/MasonryGrid.jsx';
import { trackEvent } from '../lib/analytics.js';
import { byLatest, byRank, byTodayPickFirst } from '../lib/contentOrdering.js';

const pinnedLessonIds = [
  'ten-essential-codex-skills',
  'pallyy-74k-mrr-solo-founder-retrospective',
  'promptboard-codex-real-developer-case',
  'uicoding-skill-coding-process',
  'knowlens-codex-2b-token-tips',
];

function byPinnedThenLatest(a, b) {
  return byTodayPickFirst(a, b) || byRank(pinnedLessonIds)(a, b) || byLatest(a, b);
}

const initialVisibleCount = 6;
const loadMoreCount = 6;

export default function LearnPage() {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const loadMoreRef = useRef(null);
  const visibleLessons = useMemo(() => [...lessons].sort(byPinnedThenLatest), []);
  const displayedLessons = visibleLessons.slice(0, visibleCount);
  const hasMoreLessons = visibleCount < visibleLessons.length;

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
          <h1>学会 AI Coding</h1>
          <p>
            从真实案例、可复制提示词和产品拆解开始，尽快把想法做成能上线的网页和工具。
          </p>
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
          {hasMoreLessons ? '继续向下浏览' : '已显示全部资料'}
        </div>
      </Container>
    </div>
  );
}
