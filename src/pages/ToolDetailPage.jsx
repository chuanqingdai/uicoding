import { Badge, Button, Card } from '../components/UI.jsx';
import { Container } from '../components/Layout.jsx';
import { ToolPill } from '../components/Cards.jsx';
import { tools } from '../data.js';

function getToolFromPath() {
  const slug = window.location.pathname.split('/').filter(Boolean)[1];
  return tools.find((tool) => tool.slug === slug || tool.id === slug);
}

function getRelatedTools(currentTool) {
  const currentTags = new Set(currentTool.tags ?? []);

  return tools
    .filter((tool) => tool.id !== currentTool.id)
    .filter((tool) => {
      const sameCategory = tool.category === currentTool.category;
      const hasSharedTag = tool.tags?.some((tag) => currentTags.has(tag));

      return sameCategory || hasSharedTag;
    })
    .slice(0, 4);
}

function SimpleList({ items }) {
  return (
    <ul className="tool-detail-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function BenchmarkList({ items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="tool-detail-section">
      <h2>第三方评分与 benchmark</h2>
      <div className="tool-benchmark-list">
        {items.map((item) => (
          <Card key={`${item.sourceName}-${item.title}`}>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <div className="tool-detail-meta">
              {item.score && <Badge tone="accent">{item.score}</Badge>}
              <a href={item.url} rel="noreferrer" target="_blank">
                {item.sourceName}
              </a>
              {item.date && <span>{item.date}</span>}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ReviewList({ items }) {
  return (
    <section className="tool-detail-section">
      <h2>网上用户怎么评价</h2>
      {items?.length ? (
        <div className="tool-review-list">
          {items.slice(0, 5).map((item) => (
            <Card key={`${item.sourceName}-${item.summary}`}>
              <Badge>{item.sentiment}</Badge>
              <p>{item.summary}</p>
              <a href={item.url} rel="noreferrer" target="_blank">
                {item.sourceName}
              </a>
            </Card>
          ))}
        </div>
      ) : (
        <p>暂无足够公开用户反馈</p>
      )}
    </section>
  );
}

function SourceList({ items }) {
  return (
    <section className="tool-detail-section">
      <h2>资料来源</h2>
      <div className="tool-source-list">
        {items.map((item) => (
          <a href={item.url} key={`${item.sourceName}-${item.url}`} rel="noreferrer" target="_blank">
            {item.sourceName}
          </a>
        ))}
      </div>
    </section>
  );
}

export default function ToolDetailPage() {
  const tool = getToolFromPath();

  if (!tool) {
    return (
      <div className="tool-detail-empty">
        <Container>
          <h1>工具不存在</h1>
          <Button href="/tools">返回工具库</Button>
        </Container>
      </div>
    );
  }

  const relatedTools = getRelatedTools(tool);

  return (
    <div className="tool-detail">
      <Container>
        <Card className="tool-detail-hero">
          <div>
            <div className="tool-detail-meta">
              <Badge tone="accent">{tool.category}</Badge>
              {tool.pricing && <Badge>{tool.pricing}</Badge>}
            </div>
            <h1>{tool.name}</h1>
            <p>{tool.company}</p>
            <p>{tool.description}</p>
            <div className="tool-detail-meta">
              {tool.tags?.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="tool-detail-actions">
            <Button href={tool.officialUrl} rel="noreferrer" target="_blank">
              访问官网
            </Button>
            <Button href="/tools" variant="secondary">
              返回工具库
            </Button>
          </div>
        </Card>

        <section className="tool-detail-section">
          <h2>核心优势</h2>
          <SimpleList items={tool.coreAdvantages ?? []} />
        </section>

        <section className="tool-detail-section">
          <h2>适合什么场景</h2>
          <SimpleList items={tool.bestFor ?? []} />
        </section>

        <BenchmarkList items={tool.benchmarks} />
        <ReviewList items={tool.userReviews} />

        <section className="tool-detail-section">
          <h2>需要注意</h2>
          <SimpleList items={tool.limitations ?? []} />
        </section>

        {tool.sources?.length > 0 && <SourceList items={tool.sources} />}

        {relatedTools.length > 0 && (
          <section className="tool-detail-section">
            <h2>类似工具</h2>
            <div className="related-tools-grid">
              {relatedTools.map((item) => (
                <ToolPill {...item} key={item.id} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
