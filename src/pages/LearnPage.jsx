import { useEffect, useMemo, useRef, useState } from 'react';
import { lessons } from '../data.js';
import { Container } from '../components/Layout.jsx';
import { LearningCard } from '../components/Cards.jsx';

const pinnedLessonIds = [
  'uicoding-skill-coding-process',
  'knowlens-codex-2b-token-tips',
];

function byLatest(a, b) {
  return new Date(b.publishedAt) - new Date(a.publishedAt);
}

function byPinnedThenLatest(a, b) {
  const pinnedA = pinnedLessonIds.indexOf(a.id);
  const pinnedB = pinnedLessonIds.indexOf(b.id);
  const rankA = pinnedA === -1 ? Number.POSITIVE_INFINITY : pinnedA;
  const rankB = pinnedB === -1 ? Number.POSITIVE_INFINITY : pinnedB;

  return rankA - rankB || byLatest(a, b);
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
          setVisibleCount((count) =>
            Math.min(count + loadMoreCount, visibleLessons.length),
          );
        }
      },
      { rootMargin: '360px 0px 360px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMoreLessons, visibleLessons.length]);

  return (
    <div className="learn-page">
      <section className="learn-hero">
        <Container>
          <h1>学习资料</h1>
          <p>
            为设计师、产品经理和独立开发者整理 AI Coding 学习路径，帮助你从提示词、界面设计、工具选择到产品上线逐步掌握完整流程。
          </p>
        </Container>
      </section>

      <Container>
        <div className="learn-grid waterfall-grid">
          {displayedLessons.map((item) => (
            <LearningCard item={item} key={item.id} />
          ))}
        </div>
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
