import { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { lessons } from '../data.js';
import { learningContent } from '../content/learningContent.js';
import { Container } from '../components/Layout.jsx';
import { Button, Badge } from '../components/UI.jsx';
import { LearningCard, isDefaultLearningCover } from '../components/Cards.jsx';
import Comments from '../components/Comments.jsx';
import { trackEvent } from '../lib/analytics.js';
import { formatDisplayUrl } from '../lib/urls.js';

function buildFallbackContent(lesson) {
  return {
    notice: '',
    sections: [
      {
        heading: '学习重点',
        content: lesson.description,
      },
      {
        heading: '可以怎么实践',
        content: lesson.keyTakeaways?.join('。') || '把文章观点应用到一个真实页面或小功能中，边修改边验证结果。',
      },
      {
        heading: 'UIcoding 解读',
        content: '建议把这篇资料当成一次可执行练习：先写清楚目标，再拆任务和约束，最后用构建结果、页面截图或人工检查来验证。',
      },
    ],
  };
}

function LearnCodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!code?.content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code.content);
      setCopied(true);
      trackEvent('code_copy', {
        label: code.label || '代码片段',
        code_length: code.content.length,
      });
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  if (!code) {
    return null;
  }

  return (
    <div className="learn-code-block">
      <div className="learn-code-head">
        <span>{code.label || '代码片段'}</span>
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
        <code>{code.content}</code>
      </pre>
    </div>
  );
}

function LearnLinkGroup({ block, lesson }) {
  if (!block?.items?.length) {
    return null;
  }

  return (
    <div className="learn-link-group">
      {block.items.map((item) => (
        <a
          key={`${item.label}-${item.url}`}
          className="learn-link-card"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent('outbound_link_click', {
              label: item.label,
              content_type: 'lesson',
              item_id: lesson?.id,
              item_name: lesson?.title,
              link_url: item.url,
            })
          }
        >
          <span>{item.label}</span>
          <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

function LearnArticleSection({ section, lesson }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = section.image && !isDefaultLearningCover(section.image) && !imageFailed;
  const paragraphs = section.paragraphs ?? [section.content].filter(Boolean);
  const blocks =
    section.blocks ??
    [
      ...paragraphs.map((paragraph) => ({
        type: 'paragraph',
        content: paragraph,
      })),
      ...(section.code
        ? [
            {
              type: 'code',
              ...section.code,
            },
          ]
        : []),
    ];

  return (
    <section className={`learn-article-section ${showImage ? 'has-visual' : ''}`}>
      {showImage && (
        <div className="learn-article-visual">
          <img
            src={section.image}
            alt={section.imageAlt ?? section.heading}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        </div>
      )}
      <div className="learn-article-copy">
        {section.heading && <h2>{section.heading}</h2>}
        {blocks.map((block, index) => (
          block.type === 'code' ? (
            <LearnCodeBlock
              code={block}
              key={`${block.label ?? 'code'}-${index}`}
            />
          ) : block.type === 'links' ? (
            <LearnLinkGroup
              block={block}
              key={`${block.label ?? 'links'}-${index}`}
              lesson={lesson}
            />
          ) : (
            <p key={`${block.content}-${index}`}>{block.content}</p>
          )
        ))}
      </div>
    </section>
  );
}

function LearnCover({ image, imageAlt }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = image && !imageFailed;

  return showImage ? (
    <div className={`learn-detail-cover ${showImage ? 'has-image' : ''}`}>
      <img
        src={image}
        alt={imageAlt}
        loading="eager"
        onError={() => setImageFailed(true)}
      />
    </div>
  ) : null;
}

function LearnSourceNotice({ content, lesson }) {
  const sourceUrl = content.sourceUrl || lesson.sourceUrl;
  const showSourceAddress = Boolean(sourceUrl && content.showSourceAddress);
  const showSourceLink = Boolean(sourceUrl && !content.hideSourceNoticeLink);

  if (!content.notice && !showSourceAddress && !showSourceLink) {
    return null;
  }

  return (
    <aside className="learn-source-notice">
      {content.notice && <p>{content.notice}</p>}
      {showSourceAddress && (
        <p className="learn-source-address">
          原文地址：
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent('outbound_link_click', {
                label: '原文地址',
                link_url: sourceUrl,
                content_type: 'lesson',
              })
            }
          >
            {sourceUrl}
            <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </p>
      )}
      {showSourceLink && !showSourceAddress && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent('outbound_link_click', {
              label: '查看英文原文',
              link_url: sourceUrl,
              content_type: 'lesson',
            })
          }
        >
          查看英文原文
          <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
        </a>
      )}
    </aside>
  );
}

function ArticleSiteLink({ url, label, lesson }) {
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
          content_type: 'lesson',
          item_id: lesson?.id,
          item_name: lesson?.title,
          link_url: url,
        },
      }}
    >
      {label}
    </Button>
  );
}

export default function LearnDetailPage({ slug }) {
  const lesson = useMemo(() => lessons.find((item) => item.id === slug), [slug]);
  const content = useMemo(() => {
    if (!lesson) {
      return null;
    }

    return learningContent.find((item) => item.id === lesson.id) ?? buildFallbackContent(lesson);
  }, [lesson]);

  const relatedLessons = useMemo(() => {
    if (!lesson) {
      return [];
    }

    return lessons
      .filter((item) => item.id !== lesson.id)
      .filter((item) => {
        const sameCategory = item.category === lesson.category;
        const sameTool = item.tools?.some((tool) => lesson.tools?.includes(tool));
        const sameAudience = item.audience === lesson.audience;

        return sameCategory || sameTool || sameAudience;
      })
      .slice(0, 4);
  }, [lesson]);

  if (!lesson || !content) {
    return (
      <div className="case-detail-empty">
        <Container>
          <h1>学习资料不存在</h1>
          <p>这篇资料可能已被移除，或链接地址不正确。</p>
          <Button href="/learn">返回学习资料</Button>
        </Container>
      </div>
    );
  }

  const tags = [lesson.category, lesson.tools?.[0]].filter(Boolean);
  const contentCover = content.sections.find(
    (section) => section.image && !isDefaultLearningCover(section.image),
  );
  const lessonCoverImage =
    lesson.image && !isDefaultLearningCover(lesson.image) ? lesson.image : '';
  const coverImage = lessonCoverImage || contentCover?.image;
  const coverImageAlt =
    (lessonCoverImage ? lesson.imageAlt : contentCover?.imageAlt) || `${lesson.title} 头图`;
  const lessonSiteUrl = content.hideArticleSiteLink ? '' : lesson.websiteUrl || lesson.sourceUrl;
  const lessonSiteLabel = formatDisplayUrl(lessonSiteUrl);

  return (
    <div className="learn-detail">
      <Container>
        <div className="blog-detail-layout learn-detail-layout">
          <article className="blog-article">
            <header className="blog-article-head">
              <div className="case-detail-meta">
                {tags.map((tag, index) => (
                  <Badge key={tag} tone={index === 0 ? 'accent' : 'default'}>
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1>{lesson.title}</h1>
              <ArticleSiteLink
                url={lessonSiteUrl}
                label={lessonSiteLabel}
                lesson={lesson}
              />
            </header>

            <LearnCover
              image={coverImage}
              imageAlt={coverImageAlt}
            />

            <div className="blog-prose">
              <LearnSourceNotice content={content} lesson={lesson} />
              {!content.hideLead && <p className="blog-lead">{lesson.description}</p>}
              {content.sections.map((section, index) => (
                <LearnArticleSection
                  key={`${section.heading || 'intro'}-${index}`}
                  section={section}
                  lesson={lesson}
                />
              ))}
            </div>

            <Comments
              targetId={lesson.id}
              targetType="lesson"
              title="评论"
            />

            {relatedLessons.length > 0 && (
              <section className="tool-detail-section learn-related-section">
                <div>
                  <h2>更多学习资料</h2>
                  <p>继续阅读与这个主题相关的 AI 编程学习内容。</p>
                </div>
                <div className="learning-grid related-learning-grid">
                  {relatedLessons.map((item) => (
                    <LearningCard item={item} key={item.id} />
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </Container>
    </div>
  );
}
