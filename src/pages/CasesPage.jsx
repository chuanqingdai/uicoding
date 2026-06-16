import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { caseToolFilters, caseTypeFilters, cases } from '../data.js';
import { Container } from '../components/Layout.jsx';
import { Button } from '../components/UI.jsx';
import { CaseCard } from '../components/Cards.jsx';

const pinnedCaseIds = new Set(['freemake-ai-image-maker']);

function byPinnedFirst(a, b) {
  return Number(pinnedCaseIds.has(b.id)) - Number(pinnedCaseIds.has(a.id));
}

function byLatest(a, b) {
  return byPinnedFirst(a, b) || new Date(b.publishedAt) - new Date(a.publishedAt);
}

function byHot(a, b) {
  return byPinnedFirst(a, b) || b.likeCount - a.likeCount || b.viewCount - a.viewCount;
}

const initialVisibleCount = 9;
const loadMoreCount = 6;

function isRecentCase(item) {
  return Boolean(item.sourceType);
}

function FilterSelect({
  id,
  label,
  value,
  options,
  isOpen,
  onChange,
  onClose,
  onToggle,
}) {
  return (
    <div
      className="cases-filter-group cases-select"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onClose();
        }
      }}
    >
      <span className="cases-filter-label" id={`${id}-label`}>
        {label}
      </span>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-trigger`}
        className="cases-select-trigger"
        id={`${id}-trigger`}
        onClick={onToggle}
        type="button"
      >
        <span>{value}</span>
        <ChevronDown size={15} strokeWidth={1.9} aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          aria-labelledby={`${id}-label`}
          className="cases-select-menu"
          role="listbox"
        >
          {options.map((option) => (
            <button
              aria-selected={value === option}
              className={`cases-select-option ${value === option ? 'is-active' : ''}`}
              key={option}
              onClick={() => {
                onChange(option);
                onClose();
              }}
              role="option"
              type="button"
            >
              <span>{option}</span>
              {value === option && (
                <Check size={14} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CasesPage() {
  const [sortMode, setSortMode] = useState('latest');
  const [activeTool, setActiveTool] = useState('全部工具');
  const [activeType, setActiveType] = useState('全部类型');
  const [openFilter, setOpenFilter] = useState(null);
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const loadMoreRef = useRef(null);

  const visibleCases = useMemo(() => {
    return [...cases]
      .filter(isRecentCase)
      .filter((item) => activeTool === '全部工具' || item.tools.includes(activeTool))
      .filter((item) => activeType === '全部类型' || item.category === activeType)
      .sort(sortMode === 'latest' ? byLatest : byHot);
  }, [activeTool, activeType, sortMode]);

  useEffect(() => {
    setVisibleCount(initialVisibleCount);
  }, [activeTool, activeType, sortMode]);

  const displayedCases = visibleCases.slice(0, visibleCount);
  const hasMoreCases = visibleCount < visibleCases.length;

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMoreCases) {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setVisibleCount(visibleCases.length);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + loadMoreCount, visibleCases.length),
          );
        }
      },
      { rootMargin: '360px 0px 360px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMoreCases, visibleCases.length]);

  const resetFilters = () => {
    setActiveTool('全部工具');
    setActiveType('全部类型');
    setSortMode('latest');
  };

  return (
    <div className="cases-page">
      <section className="cases-hero">
        <Container>
          <h1>案例</h1>
          <p>
            浏览真实 AI 编程作品，学习它们的构建思路、提示词、工具组合、界面设计和上线过程。
          </p>
        </Container>
      </section>

      <Container>
        <div className="cases-toolbar">
          <div className="cases-tabs" aria-label="排序方式">
            <Button
              type="button"
              variant={sortMode === 'latest' ? 'primary' : 'secondary'}
              onClick={() => setSortMode('latest')}
              aria-pressed={sortMode === 'latest'}
            >
              最新
            </Button>
            <Button
              type="button"
              variant={sortMode === 'hot' ? 'primary' : 'secondary'}
              onClick={() => setSortMode('hot')}
              aria-pressed={sortMode === 'hot'}
            >
              最热
            </Button>
          </div>

          <FilterSelect
            id="case-tool-filter"
            label="工具"
            value={activeTool}
            options={caseToolFilters}
            isOpen={openFilter === 'tool'}
            onChange={setActiveTool}
            onClose={() => setOpenFilter(null)}
            onToggle={() => setOpenFilter(openFilter === 'tool' ? null : 'tool')}
          />

          <FilterSelect
            id="case-type-filter"
            label="类型"
            value={activeType}
            options={caseTypeFilters}
            isOpen={openFilter === 'type'}
            onChange={setActiveType}
            onClose={() => setOpenFilter(null)}
            onToggle={() => setOpenFilter(openFilter === 'type' ? null : 'type')}
          />
        </div>

        {visibleCases.length > 0 ? (
          <>
            <div className="cases-grid waterfall-grid">
              {displayedCases.map((item) => (
                <CaseCard item={item} key={item.id} />
              ))}
            </div>
            <div
              aria-hidden={!hasMoreCases}
              className="auto-load-sentinel"
              ref={loadMoreRef}
            >
              {hasMoreCases ? '继续向下浏览' : '已显示全部案例'}
            </div>
          </>
        ) : (
          <div className="cases-empty">
            <h2>暂时没有匹配的案例</h2>
            <p>试试切换工具或类型，回到全部案例继续浏览。</p>
            <Button type="button" onClick={resetFilters}>
              查看全部
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}
