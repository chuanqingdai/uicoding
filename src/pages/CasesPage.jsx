import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { caseTypeFilters, cases } from '../data.js';
import { Container } from '../components/Layout.jsx';
import { Button } from '../components/UI.jsx';
import { CaseCard } from '../components/Cards.jsx';
import MasonryGrid from '../components/MasonryGrid.jsx';
import { trackEvent } from '../lib/analytics.js';
import { byLatest as byPublishedLatest, byTodayPickFirst } from '../lib/contentOrdering.js';
import { useI18n } from '../lib/i18n.jsx';

const pinnedCaseOrder = [
  'forged-in-silence-codex',
  'knowlens-ai-infographic-generator',
  'crossbeam-claude-permit-review',
  'pulse-dashboard-codex',
  'sense-enterprise-affective-platform',
];

const pinnedCaseRanks = new Map(
  pinnedCaseOrder.map((id, index) => [id, index]),
);

function byPinnedFirst(a, b) {
  const aRank = pinnedCaseRanks.get(a.id);
  const bRank = pinnedCaseRanks.get(b.id);

  if (aRank === undefined && bRank === undefined) {
    return 0;
  }

  if (aRank === undefined) {
    return 1;
  }

  if (bRank === undefined) {
    return -1;
  }

  return aRank - bRank;
}

function byLatest(a, b) {
  return byPinnedFirst(a, b) || byTodayPickFirst(a, b) || byPublishedLatest(a, b);
}

function byHot(a, b) {
  return byPinnedFirst(a, b) || byTodayPickFirst(a, b) || b.viewCount - a.viewCount;
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
  getOptionLabel = (option) => option,
}) {
  const displayValue = getOptionLabel(value);

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
        <span>{displayValue}</span>
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
                trackEvent('filter_select', {
                  filter_name: id,
                  filter_value: option,
                  page: 'cases',
                });
                onChange(option);
                onClose();
              }}
              role="option"
              type="button"
            >
              <span>{getOptionLabel(option)}</span>
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
  const { categoryLabel, t } = useI18n();
  const [sortMode, setSortMode] = useState('latest');
  const [activeType, setActiveType] = useState('全部类型');
  const [openFilter, setOpenFilter] = useState(null);
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const loadMoreRef = useRef(null);

  const visibleCases = useMemo(() => {
    return [...cases]
      .filter(isRecentCase)
      .filter((item) => activeType === '全部类型' || item.category === activeType)
      .sort(sortMode === 'latest' ? byLatest : byHot);
  }, [activeType, sortMode]);

  useEffect(() => {
    setVisibleCount(initialVisibleCount);
  }, [activeType, sortMode]);

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
          trackEvent('content_autoload', {
            page: 'cases',
            visible_count: visibleCount,
            total_count: visibleCases.length,
          });
          setVisibleCount((count) =>
            Math.min(count + loadMoreCount, visibleCases.length),
          );
        }
      },
      { rootMargin: '360px 0px 360px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMoreCases, visibleCount, visibleCases.length]);

  const resetFilters = () => {
    trackEvent('filter_reset', { page: 'cases' });
    setActiveType('全部类型');
    setSortMode('latest');
  };

  return (
    <div className="cases-page">
      <section className="cases-hero">
        <Container>
          <h1>{t('cases.title')}</h1>
          <p>{t('cases.description')}</p>
        </Container>
      </section>

      <Container>
        <div className="cases-toolbar">
          <div className="cases-tabs" aria-label={t('cases.sortLabel')}>
            <Button
              type="button"
              variant={sortMode === 'latest' ? 'primary' : 'secondary'}
              onClick={() => {
                trackEvent('sort_select', { page: 'cases', sort_mode: 'latest' });
                setSortMode('latest');
              }}
              aria-pressed={sortMode === 'latest'}
            >
              {t('cases.latest')}
            </Button>
            <Button
              type="button"
              variant={sortMode === 'hot' ? 'primary' : 'secondary'}
              onClick={() => {
                trackEvent('sort_select', { page: 'cases', sort_mode: 'hot' });
                setSortMode('hot');
              }}
              aria-pressed={sortMode === 'hot'}
            >
              {t('cases.hot')}
            </Button>
          </div>

          <FilterSelect
            id="case-type-filter"
            label={t('cases.type')}
            value={activeType}
            options={caseTypeFilters}
            isOpen={openFilter === 'type'}
            onChange={setActiveType}
            onClose={() => setOpenFilter(null)}
            onToggle={() => setOpenFilter(openFilter === 'type' ? null : 'type')}
            getOptionLabel={categoryLabel}
          />
        </div>

        {visibleCases.length > 0 ? (
          <>
            <MasonryGrid
              className="cases-grid waterfall-grid"
              items={displayedCases}
              renderItem={(item) => <CaseCard item={item} />}
            />
            <div
              aria-hidden={!hasMoreCases}
              className="auto-load-sentinel"
              ref={loadMoreRef}
            >
              {hasMoreCases ? t('common.keepBrowsing') : t('common.allCasesShown')}
            </div>
          </>
        ) : (
          <div className="cases-empty">
            <h2>{t('cases.emptyTitle')}</h2>
            <p>{t('cases.emptyDescription')}</p>
            <Button type="button" onClick={resetFilters}>
              {t('cases.viewAll')}
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}
