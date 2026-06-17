import { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Mail, UserPlus } from 'lucide-react';
import { cases } from '../data.js';
import { Container } from '../components/Layout.jsx';
import { Button, Badge, Card } from '../components/UI.jsx';
import { CaseCard } from '../components/Cards.jsx';
import Comments from '../components/Comments.jsx';
import { trackEvent } from '../lib/analytics.js';
import { formatDisplayUrl } from '../lib/urls.js';

function isRecentCase(item) {
  return Boolean(item.sourceType);
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
      trackEvent('contact_copy', {
        contact_type: 'wechat',
        submitter_name: submitter.name,
      });
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

function DetailCodeBlock({ prompt, caseItem, sectionTitle }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!prompt?.content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      trackEvent('code_copy', {
        label: prompt.label || '案例提示词',
        code_length: prompt.content.length,
        content_type: 'case',
        item_id: caseItem?.id,
        item_name: caseItem?.title,
        section_title: sectionTitle,
      });
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  if (!prompt?.content) {
    return null;
  }

  return (
    <div className="learn-code-block">
      <div className="learn-code-head">
        <span>{prompt.label || '可复制提示词'}</span>
        <button onClick={copyCode} type="button">
          {copied ? (
            <Check size={14} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Copy size={14} strokeWidth={1.8} aria-hidden="true" />
          )}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre>
        <code>{prompt.content}</code>
      </pre>
    </div>
  );
}

function DetailBlock({ section, caseItem }) {
  const hasImage = Boolean(section.image);

  return (
    <article className={`detail-block ${hasImage ? 'has-image' : 'is-text-only'}`}>
      {hasImage && (
        <div className="detail-image">
          <img src={section.image} alt={section.imageAlt} />
        </div>
      )}
      <div className="detail-copy">
        <h2>{section.title}</h2>
        <p>{section.description}</p>
        {section.points?.length > 0 && (
          <ul>
            {section.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}
        {section.prompts?.length > 0 && (
          <div className="detail-prompt-stack">
            {section.prompts.map((prompt) => (
              <DetailCodeBlock
                key={prompt.label || prompt.content}
                prompt={prompt}
                caseItem={caseItem}
                sectionTitle={section.title}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function RelatedCaseSection({ title, description, items }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="tool-detail-section case-related-section">
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

function CaseCover({ image, imageAlt }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = image && !imageFailed;

  if (!showImage) {
    return null;
  }

  return (
    <div className="case-detail-cover">
      <img
        src={image}
        alt={imageAlt}
        loading="eager"
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}

function ArticleSiteLink({ caseItem, url, label }) {
  if (!url || !label) {
    return null;
  }

  return (
    <Button
      className="article-site-button"
      href={url}
      icon={ExternalLink}
      variant="secondary"
      target="_blank"
      rel="noopener noreferrer"
      analyticsEvent={{
        name: 'outbound_link_click',
        params: {
          label: '标题下方网站链接',
          content_type: 'case',
          item_id: caseItem.id,
          item_name: caseItem.title,
          link_url: url,
        },
      }}
    >
      {label}
    </Button>
  );
}

function isEditorialOnlySection(section) {
  if (!section) {
    return false;
  }

  return (
    section.id === 'ai-generated-evidence' ||
    section.title === 'AI 生成证据' ||
    section.title === 'AI 生成证据待补充'
  );
}

export default function CaseDetailPage({ categorySlug, slug }) {
  const caseItem = useMemo(
    () => cases.find((item) => item.categorySlug === categorySlug && item.slug === slug),
    [categorySlug, slug],
  );
  const relatedCases = useMemo(() => {
    if (!caseItem) {
      return [];
    }

    return cases
      .filter((item) => item.id !== caseItem.id)
      .filter(isRecentCase)
      .filter((item) => {
        const sameCategory = item.category === caseItem.category;
        const sameTool = item.tools?.some((tool) => caseItem.tools?.includes(tool));
        const sameTag = item.tags?.some((tag) => caseItem.tags?.includes(tag));

        return sameCategory || sameTool || sameTag;
      })
      .slice(0, 4);
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
  ].filter(
    (item, index, list) =>
      item &&
      item !== 'AI 生成证据待补充' &&
      list.indexOf(item) === index,
  );
  const siteUrl = caseItem.websiteUrl || caseItem.sourceUrl;
  const siteLabel = formatDisplayUrl(siteUrl);
  const displaySections = caseItem.detailSections.filter(
    (section) => !isEditorialOnlySection(section),
  );
  const coverImage = caseItem.screenshotUrl || displaySections.find((section) => section.image)?.image || '';
  const coverImageAlt = caseItem.imageAlt || caseItem.screenshotAlt || `${caseItem.title} 网站截图`;

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
              <ArticleSiteLink
                caseItem={caseItem}
                url={siteUrl}
                label={siteLabel}
              />
              <div className="blog-article-meta">
                <span>{caseItem.publishedAt}</span>
              </div>
            </header>

            <CaseCover
              image={coverImage}
              imageAlt={coverImageAlt}
            />

            <div className="blog-prose">
              <p className="blog-lead">{caseItem.description}</p>
              <div className="case-detail-sections">
                {displaySections.map((section) => (
                  <DetailBlock
                    key={section.id}
                    section={section}
                    caseItem={caseItem}
                  />
                ))}
              </div>
            </div>

            <Comments
              targetId={caseItem.id}
              targetType="case"
              title="评论"
            />
          </article>
        </div>

        <RelatedCaseSection
          title="类似案例"
          description="继续查看更多值得拆解的 AI 编程作品。"
          items={relatedCases}
        />
      </Container>
    </div>
  );
}
