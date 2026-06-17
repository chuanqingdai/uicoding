import { useEffect, useMemo, useState } from 'react';

const breakpoints = [
  { media: '(max-width: 640px)', columns: 1 },
  { media: '(max-width: 980px)', columns: 2 },
];

function getColumnCount(maxColumns) {
  if (typeof window === 'undefined') {
    return maxColumns;
  }

  const matched = breakpoints.find((item) => window.matchMedia(item.media).matches);
  return matched?.columns ?? maxColumns;
}

export default function MasonryGrid({
  className = '',
  getKey = (item) => item.id,
  items,
  maxColumns = 3,
  renderItem,
}) {
  const [columnCount, setColumnCount] = useState(() => getColumnCount(maxColumns));

  useEffect(() => {
    const updateColumns = () => {
      setColumnCount(getColumnCount(maxColumns));
    };
    const mediaQueries = breakpoints.map((item) => window.matchMedia(item.media));

    updateColumns();
    mediaQueries.forEach((query) => query.addEventListener('change', updateColumns));

    return () => {
      mediaQueries.forEach((query) => query.removeEventListener('change', updateColumns));
    };
  }, [maxColumns]);

  const columns = useMemo(() => {
    const count = Math.max(1, Math.min(columnCount, Math.max(items.length, 1)));
    const nextColumns = Array.from({ length: count }, () => []);

    items.forEach((item, index) => {
      nextColumns[index % count].push(item);
    });

    return nextColumns;
  }, [columnCount, items]);

  return (
    <div
      className={`stable-masonry-grid ${className}`.trim()}
      style={{ '--masonry-columns': columns.length }}
    >
      {columns.map((column, columnIndex) => (
        <div className="stable-masonry-column" key={columnIndex}>
          {column.map((item) => (
            <div className="stable-masonry-item" key={getKey(item)}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
