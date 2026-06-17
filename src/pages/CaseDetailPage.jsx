import { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Mail, UserPlus } from 'lucide-react';
import { cases } from '../data.js';
import { Container } from '../components/Layout.jsx';
import { Button, Badge, Card } from '../components/UI.jsx';
import { CaseCard } from '../components/Cards.jsx';
import Comments from '../components/Comments.jsx';
import { trackEvent } from '../lib/analytics.js';
import { formatDisplayUrl } from '../lib/urls.js';
import { useI18n } from '../lib/i18n.jsx';
import { localizeCase, localizeCaseSections } from '../lib/contentLocalization.js';

function isRecentCase(item) {
  return Boolean(item.sourceType);
}

function SubmitterCard({ submitter, isFollowing, onFollowToggle }) {
  const { language, t } = useI18n();
  const [copied, setCopied] = useState(false);
  const showWechat = language === 'zh';

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
          <p>{submitter.bio || submitter.role || t('detail.defaultSubmitterBio')}</p>
        </div>
      </div>

      <div className="submitter-links">
        {submitter.email && (
          <a href={`mailto:${submitter.email}`}>
            <Mail size={14} strokeWidth={1.8} aria-hidden="true" />
            {t('detail.email')}
          </a>
        )}
        {showWechat && submitter.wechat && (
          <button type="button" onClick={copyWechat}>
            <Copy size={14} strokeWidth={1.8} aria-hidden="true" />
            {t('detail.wechat')}：{submitter.wechat} · {copied ? t('detail.copied') : t('detail.copyWechat')}
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
            {t('detail.website')}
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
        {isFollowing ? t('detail.following') : t('detail.follow')}
      </Button>
    </Card>
  );
}

function DetailCodeBlock({ prompt, caseItem, sectionTitle }) {
  const { t } = useI18n();
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
        <span>{prompt.label || t('detail.copyablePrompt')}</span>
        <button onClick={copyCode} type="button">
          {copied ? (
            <Check size={14} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Copy size={14} strokeWidth={1.8} aria-hidden="true" />
          )}
          {copied ? t('detail.copied') : t('detail.copy')}
        </button>
      </div>
      <pre>
        <code>{prompt.content}</code>
      </pre>
    </div>
  );
}

function DetailBlock({ section, caseItem, visitLabel }) {
  const hasImage = Boolean(section.image);
  const imageUrl = caseItem.websiteUrl || caseItem.sourceUrl;

  return (
    <article className={`detail-block ${hasImage ? 'has-image' : 'is-text-only'}`}>
      {hasImage && (
        <div className="detail-image">
          {imageUrl ? (
            <a
              className="detail-image-link"
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${caseItem.title} ${visitLabel}`}
              onClick={() =>
                trackEvent('outbound_link_click', {
                  label: '案例正文图片',
                  content_type: 'case',
                  item_id: caseItem.id,
                  item_name: caseItem.title,
                  link_url: imageUrl,
                })
              }
            >
              <img src={section.image} alt={section.imageAlt} />
            </a>
          ) : (
            <img src={section.image} alt={section.imageAlt} />
          )}
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

function CaseCover({ image, imageAlt, caseItem, url, visitLabel }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = image && !imageFailed;

  if (!showImage) {
    return null;
  }

  const imageNode = (
    <img
      src={image}
      alt={imageAlt}
      loading="eager"
      onError={() => setImageFailed(true)}
    />
  );

  return (
    <div className="case-detail-cover">
      {url ? (
        <a
          className="case-detail-cover-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${caseItem.title} ${visitLabel}`}
          onClick={() =>
            trackEvent('outbound_link_click', {
              label: '案例主图',
              content_type: 'case',
              item_id: caseItem.id,
              item_name: caseItem.title,
              link_url: url,
            })
          }
        >
          {imageNode}
        </a>
      ) : (
        imageNode
      )}
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
      variant="primary"
      target="_blank"
      rel="noopener noreferrer"
      title={label}
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
  const { categoryLabel, language, t } = useI18n();
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
          <h1>{t('detail.caseNotFound')}</h1>
          <p>{t('detail.caseNotFoundDescription')}</p>
          <Button href="/cases">{t('detail.backToCases')}</Button>
        </Container>
      </div>
    );
  }

  const displayCase = localizeCase(caseItem, language);
  const metaTags = [
    categoryLabel(caseItem.category),
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
  const displaySections = localizeCaseSections(caseItem.detailSections, language).filter(
    (section) => !isEditorialOnlySection(section),
  );
  const coverImage = caseItem.screenshotUrl || displaySections.find((section) => section.image)?.image || '';
  const coverImageAlt = caseItem.imageAlt || caseItem.screenshotAlt || `${displayCase.title} screenshot`;

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
              <h1>{displayCase.title}</h1>
              <ArticleSiteLink
                caseItem={caseItem}
                url={siteUrl}
                label={t('detail.visitWebsite')}
              />
              <div className="blog-article-meta">
                <span>{caseItem.publishedAt}</span>
              </div>
            </header>

            <CaseCover
              image={coverImage}
              imageAlt={coverImageAlt}
              caseItem={caseItem}
              url={siteUrl}
              visitLabel={t('detail.visitWebsite')}
            />

            <div className="blog-prose">
              <p className="blog-lead">{displayCase.description}</p>
              <div className="case-detail-sections">
                {displaySections.map((section) => (
                  <DetailBlock
                    key={section.id}
                    section={section}
                    caseItem={caseItem}
                    visitLabel={t('detail.visitWebsite')}
                  />
                ))}
              </div>
            </div>

            <Comments
              targetId={caseItem.id}
              targetType="case"
              title={t('detail.comments')}
            />
          </article>
        </div>

        <RelatedCaseSection
          title={t('detail.relatedCases')}
          description={t('detail.relatedCasesDescription')}
          items={relatedCases}
        />
      </Container>
    </div>
  );
}
