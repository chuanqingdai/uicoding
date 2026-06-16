import { useMemo, useState } from 'react';
import { lessons } from '../data.js';
import { Container } from '../components/Layout.jsx';
import { Button } from '../components/UI.jsx';
import { LearningCard } from '../components/Cards.jsx';

function byLatest(a, b) {
  return new Date(b.publishedAt) - new Date(a.publishedAt);
}

const initialVisibleCount = 6;
const loadMoreCount = 6;

export default function LearnPage() {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const visibleLessons = useMemo(() => [...lessons].sort(byLatest), []);
  const displayedLessons = visibleLessons.slice(0, visibleCount);
  const hasMoreLessons = visibleCount < visibleLessons.length;

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
        {hasMoreLessons && (
          <div className="waterfall-more">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setVisibleCount((count) => count + loadMoreCount)}
            >
              加载更多资料
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}
