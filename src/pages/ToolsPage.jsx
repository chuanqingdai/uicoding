import { useEffect, useMemo, useRef, useState } from 'react';
import { tools } from '../data.js';
import { Container, Section } from '../components/Layout.jsx';
import { ToolPill } from '../components/Cards.jsx';

const initialVisibleCount = 8;
const loadMoreCount = 4;

export default function ToolsPage() {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const loadMoreRef = useRef(null);

  const visibleTools = useMemo(
    () => tools.slice(0, visibleCount),
    [visibleCount],
  );
  const hasMoreTools = visibleCount < tools.length;

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMoreTools) {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setVisibleCount(tools.length);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + loadMoreCount, tools.length),
          );
        }
      },
      { rootMargin: '360px 0px 360px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMoreTools]);

  return (
    <div className="tools-page">
      <section className="tools-hero">
        <Container>
          <h1>工具</h1>
          <p>
            了解常用 AI Coding 工具的定位、适合场景和使用方式，快速找到适合自己的开发工作流。
          </p>
        </Container>
      </section>

      <Section>
        <div className="tools-grid">
          {visibleTools.map((tool) => (
            <ToolPill {...tool} key={tool.id} />
          ))}
        </div>
        <div
          aria-hidden={!hasMoreTools}
          className="auto-load-sentinel"
          ref={loadMoreRef}
        >
          {hasMoreTools ? '继续向下浏览' : '已显示全部工具'}
        </div>
      </Section>
    </div>
  );
}
