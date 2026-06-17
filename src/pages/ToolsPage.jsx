import { useEffect, useMemo, useRef, useState } from 'react';
import { tools } from '../data.js';
import { Container, Section } from '../components/Layout.jsx';
import { ToolPill } from '../components/Cards.jsx';
import { trackEvent } from '../lib/analytics.js';
import { useI18n } from '../lib/i18n.jsx';

const initialVisibleCount = 8;
const loadMoreCount = 4;

export default function ToolsPage() {
  const { t } = useI18n();
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
          trackEvent('content_autoload', {
            page: 'tools',
            visible_count: visibleCount,
            total_count: tools.length,
          });
          setVisibleCount((count) =>
            Math.min(count + loadMoreCount, tools.length),
          );
        }
      },
      { rootMargin: '360px 0px 360px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMoreTools, visibleCount]);

  return (
    <div className="tools-page">
      <section className="tools-hero">
        <Container>
          <h1>{t('tools.title')}</h1>
          <p>{t('tools.description')}</p>
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
          {hasMoreTools ? t('common.keepBrowsing') : t('common.allToolsShown')}
        </div>
      </Section>
    </div>
  );
}
