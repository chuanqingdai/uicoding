import { useMemo, useState } from 'react';
import { Copy, ExternalLink, Eye, Heart, Mail, UserPlus } from 'lucide-react';
import { cases } from '../data.js';
import { Container } from '../components/Layout.jsx';
import { Button, Badge, Card } from '../components/UI.jsx';
import { CaseCard, ProductMockup } from '../components/Cards.jsx';

const numberFormatter = new Intl.NumberFormat('zh-CN');

function CaseStats({ viewCount, likeCount }) {
  return (
    <div className="case-stats">
      <span>
        <Eye size={14} strokeWidth={1.8} aria-hidden="true" />
        {numberFormatter.format(viewCount)}
      </span>
      <span>
        <Heart size={14} strokeWidth={1.8} aria-hidden="true" />
        {numberFormatter.format(likeCount)}
      </span>
    </div>
  );
}

function SubmitterCard({ submitter, isFollowing, onFollowToggle }) {
  const [copied, setCopied] = useState(false);

  if (!submitter) {
    return null;
  }

  const copyWechat = async () => {
    try {
      await navigator.clipboard?.writeText(submitter.wechat);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card className="blog-author-card">
      <div className="submitter-main">
        <div className="submitter-avatar" aria-hidden="true">
          {submitter.avatar ? (
            <img src={submitter.avatar} alt="" />
          ) : (
            <span>{submitter.name?.slice(0, 1) ?? 'U'}</span>
          )}
        </div>
        <div>
          <h2>{submitter.name}</h2>
          <p>{submitter.bio || submitter.role || '分享 AI 编程作品和实践经验。'}</p>
        </div>
      </div>

      <div className="submitter-links">
        {submitter.email && (
          <a href={`mailto:${submitter.email}`}>
            <Mail size={14} strokeWidth={1.8} aria-hidden="true" />
            邮箱
          </a>
        )}
        {submitter.wechat && (
          <button type="button" onClick={copyWechat}>
            <Copy size={14} strokeWidth={1.8} aria-hidden="true" />
            微信：{submitter.wechat} · {copied ? '已复制' : '复制微信'}
          </button>
        )}
        {submitter.douyinUrl && (
          <a href={submitter.douyinUrl} target="_blank" rel="noopener noreferrer">
            抖音：{submitter.douyin || '主页'}
          </a>
        )}
        {!submitter.douyinUrl && submitter.douyin && <span>抖音：{submitter.douyin}</span>}
        {submitter.xiaohongshuUrl && (
          <a href={submitter.xiaohongshuUrl} target="_blank" rel="noopener noreferrer">
            小红书：{submitter.xiaohongshu || '主页'}
          </a>
        )}
        {!submitter.xiaohongshuUrl && submitter.xiaohongshu && (
          <span>小红书：{submitter.xiaohongshu}</span>
        )}
        {submitter.website && (
          <a href={submitter.website} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
            个人网站
          </a>
        )}
      </div>

      <Button
        className="author-follow-button"
        icon={UserPlus}
        onClick={onFollowToggle}
        type="button"
        variant={isFollowing ? 'secondary' : 'primary'}
      >
        {isFollowing ? '已关注' : '关注提交者'}
      </Button>
    </Card>
  );
}

function DetailBlock({ section, visualType }) {
  const paragraph = [
    section.description,
    ...(section.points ?? []),
  ].filter(Boolean).join(' ');

  return (
    <article className="detail-block">
      <div className="detail-image">
        {section.image ? (
          <img src={section.image} alt={section.imageAlt} />
        ) : (
          <ProductMockup featured type={visualType} />
        )}
      </div>
      <div className="detail-copy">
        <p>{paragraph}</p>
      </div>
    </article>
  );
}

function RelatedCaseSection({ title, description, items }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="tool-detail-section">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="related-case-grid">
        {items.map((item) => (
          <CaseCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

export default function CaseDetailPage({ categorySlug, slug }) {
  const caseItem = useMemo(
    () => cases.find((item) => item.categorySlug === categorySlug && item.slug === slug),
    [categorySlug, slug],
  );
  const [liked, setLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const likedCount = caseItem ? caseItem.likeCount + (liked ? 1 : 0) : 0;

  const relatedCases = useMemo(() => {
    if (!caseItem) {
      return [];
    }

    return cases
      .filter((item) => item.id !== caseItem.id)
      .filter((item) => {
        const sameCategory = item.category === caseItem.category;
        const sameTool = item.tools?.some((tool) => caseItem.tools?.includes(tool));
        const sameTag = item.tags?.some((tag) => caseItem.tags?.includes(tag));

        return sameCategory || sameTool || sameTag;
      })
      .slice(0, 3);
  }, [caseItem]);

  if (!caseItem) {
    return (
      <div className="case-detail-empty">
        <Container>
          <h1>案例不存在</h1>
          <p>这个案例可能已被移除，或链接地址不正确。</p>
          <Button href="/cases">返回案例列表</Button>
        </Container>
      </div>
    );
  }

  const metaTags = [
    caseItem.category,
    ...(caseItem.tools ?? []),
    ...(caseItem.tags ?? []),
  ].filter((item, index, list) => item && list.indexOf(item) === index);

  const toggleLike = () => {
    setLiked((current) => !current);
  };

  const toggleFollow = () => {
    setIsFollowing((current) => !current);
  };

  return (
    <div className="case-detail">
      <Container>
        <div className="blog-detail-layout">
          <article className="blog-article">
            <header className="blog-article-head">
              <div className="case-detail-meta">
                {metaTags.slice(0, 2).map((tag, index) => (
                  <Badge key={tag} tone={index === 0 ? 'accent' : 'default'}>
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1>{caseItem.title}</h1>
              <div className="blog-article-meta">
                <CaseStats viewCount={caseItem.viewCount} likeCount={likedCount} />
                <span>{caseItem.publishedAt}</span>
              </div>
              <div className="case-detail-actions">
                {caseItem.websiteUrl && (
                  <Button
                    href={caseItem.websiteUrl}
                    icon={ExternalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    访问网站
                  </Button>
                )}
                <Button
                  icon={Heart}
                  onClick={toggleLike}
                  type="button"
                  variant={liked ? 'primary' : 'secondary'}
                >
                  {numberFormatter.format(likedCount)}
                </Button>
              </div>
            </header>

            <div className="blog-prose">
              <p className="blog-lead">{caseItem.description}</p>
              <div className="case-detail-sections">
                {caseItem.detailSections.map((section) => (
                  <DetailBlock
                    key={section.id}
                    section={section}
                    visualType={caseItem.visualType}
                  />
                ))}
              </div>
            </div>

            <RelatedCaseSection
              title="类似案例"
              description="继续查看更多值得拆解的 AI 编程作品。"
              items={relatedCases}
            />
          </article>

          <aside className="blog-sidebar">
            <SubmitterCard
              submitter={caseItem.submitter}
              isFollowing={isFollowing}
              onFollowToggle={toggleFollow}
            />
          </aside>
        </div>

      </Container>
    </div>
  );
}
