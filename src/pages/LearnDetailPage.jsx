import { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Heart } from 'lucide-react';
import { lessons } from '../data.js';
import { learningContent } from '../content/learningContent.js';
import { Container } from '../components/Layout.jsx';
import { Button, Badge } from '../components/UI.jsx';
import { LearningCard } from '../components/Cards.jsx';

const numberFormatter = new Intl.NumberFormat('zh-CN');

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
        <span>代码片段</span>
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

function LearnArticleSection({ section }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = section.image && !imageFailed;
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

export default function LearnDetailPage({ slug }) {
  const lesson = useMemo(() => lessons.find((item) => item.id === slug), [slug]);
  const content = useMemo(() => {
    if (!lesson) {
      return null;
    }

    return learningContent.find((item) => item.id === lesson.id) ?? buildFallbackContent(lesson);
  }, [lesson]);
  const [liked, setLiked] = useState(false);

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

  const likedCount = lesson.likeCount + (liked ? 1 : 0);
  const tags = [lesson.category, lesson.tools?.[0]].filter(Boolean);
  const contentCover = content.sections.find((section) => section.image);
  const coverImage = lesson.image || contentCover?.image;
  const coverImageAlt =
    lesson.imageAlt || contentCover?.imageAlt || `${lesson.title} 头图`;

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
              <div className="blog-article-meta">
                <span>{numberFormatter.format(lesson.viewCount)} 阅读</span>
                <span>{numberFormatter.format(likedCount)} 喜欢</span>
                <span>{lesson.duration}</span>
                {lesson.sourceUrl && (
                  <a
                    className="learn-source-link"
                    href={lesson.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    来源 <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
                  </a>
                )}
              </div>
            </header>

            <LearnCover
              image={coverImage}
              imageAlt={coverImageAlt}
            />

            <div className="blog-prose">
              {!content.hideLead && <p className="blog-lead">{lesson.description}</p>}
              {content.sections.map((section, index) => (
                <LearnArticleSection
                  key={`${section.heading || 'intro'}-${index}`}
                  section={section}
                />
              ))}
              <button
                className={`blog-like-button ${liked ? 'is-active' : ''}`}
                onClick={() => setLiked((current) => !current)}
                type="button"
              >
                <Heart size={16} strokeWidth={1.8} aria-hidden="true" />
                {numberFormatter.format(likedCount)}
              </button>
            </div>

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
