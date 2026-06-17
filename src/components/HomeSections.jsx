import { LayoutGrid, Send } from 'lucide-react';
import {
  cases,
  heroRecommendation,
  homeFeaturedIds,
  learningResources,
  tools,
} from '../data.js';
import { Container, Section } from './Layout.jsx';
import { CaseCard, LearningCard, ProductMockup, ToolPill } from './Cards.jsx';
import { Badge, Button, Card } from './UI.jsx';
import { byLatest, byRank, byTodayPickFirst } from '../lib/contentOrdering.js';
import { useI18n } from '../lib/i18n.jsx';
import { localizeCase } from '../lib/contentLocalization.js';

export function HomeHero() {
  const { t } = useI18n();

  return (
    <section className="hero">
      <Container className="hero-stage">
        <div className="hero-copy">
          <h1>{t('home.hero.title')}</h1>
          <p>{t('home.hero.description')}</p>
          <div className="hero-actions">
            <Button
              href="/cases"
              icon={LayoutGrid}
              analyticsEvent={{
                name: 'cta_click',
                params: { area: 'home_hero', label: t('home.hero.browse'), link_url: '/cases' },
              }}
            >
              {t('home.hero.browse')}
            </Button>
            <Button
              className="hero-submit-button"
              href="/submit"
              icon={Send}
              variant="secondary"
              analyticsEvent={{
                name: 'cta_click',
                params: { area: 'home_hero', label: t('home.hero.submit'), link_url: '/submit' },
              }}
            >
              {t('home.hero.submit')}
            </Button>
          </div>
        </div>
        <HeroRecommendation />
      </Container>
    </section>
  );
}

export function HeroRecommendation() {
  const { categoryLabel, language, t } = useI18n();
  const displayRecommendation = localizeCase(heroRecommendation, language);
  const visualImage = heroRecommendation.image ?? heroRecommendation.screenshotUrl;
  const primaryTool = heroRecommendation.tools?.find(
    (tool) => tool && tool !== 'AI 生成证据待补充',
  );

  return (
    <Card
      className="recommend-card"
      href={heroRecommendation.href}
      analyticsEvent={{
        name: 'hero_recommendation_click',
        params: {
          item_id: heroRecommendation.id,
          item_name: displayRecommendation.title,
          link_url: heroRecommendation.href,
        },
      }}
    >
      <div className="recommend-stamp" aria-label={t('home.recommend.today')}>
        <span>{t('home.recommend.today')}</span>
      </div>
      <div className="recommend-visual">
        {visualImage ? (
          <img
            src={visualImage}
            alt={heroRecommendation.imageAlt ?? `${displayRecommendation.title} screenshot`}
            loading="eager"
          />
        ) : (
          <ProductMockup featured type={heroRecommendation.visualType} />
        )}
        <div className="recommend-overlay">
          <div className="recommend-overlay-tags">
            <Badge>{categoryLabel(heroRecommendation.category)}</Badge>
            {primaryTool && <Badge>{primaryTool}</Badge>}
          </div>
          <div className="recommend-overlay-copy">
            <h2>{displayRecommendation.title}</h2>
            <p>{displayRecommendation.description}</p>
          </div>
          <span className="button button-primary">{t('common.view')}</span>
        </div>
      </div>
    </Card>
  );
}

export function FeaturedCases() {
  const { t } = useI18n();
  const homeCases = [...cases]
    .sort((a, b) => byTodayPickFirst(a, b) || byRank(homeFeaturedIds)(a, b) || byLatest(a, b))
    .slice(0, 12);

  return (
    <Section
      actionHref="/cases"
      title={t('home.cases.title')}
      description={t('home.cases.description')}
    >
      <div className="case-grid">
        {homeCases.map((item) => (
          <CaseCard item={item} key={item.id} />
        ))}
      </div>
    </Section>
  );
}

export function LearningResources() {
  const { t } = useI18n();
  const homeLearningResources = [...learningResources]
    .sort((a, b) => byTodayPickFirst(a, b) || byLatest(a, b))
    .slice(0, 6);

  return (
    <Section
      actionHref="/learn"
      className="learning-section"
      title={t('home.learn.title')}
      description={t('home.learn.description')}
    >
      <div className="learning-grid">
        {homeLearningResources.map((item) => (
          <LearningCard item={item} key={item.title} showImage={false} showStats={false} />
        ))}
      </div>
    </Section>
  );
}

export function CommonTools() {
  const { t } = useI18n();
  const homeTools = tools.slice(0, 4);

  return (
    <Section
      actionHref="/tools"
      className="tools-section"
      title={t('home.tools.title')}
      description={t('home.tools.description')}
    >
      <div className="tools-panel">
        <div className="tool-list">
          {homeTools.map((tool) => (
            <ToolPill {...tool} key={tool.name} />
          ))}
        </div>
      </div>
    </Section>
  );
}

export function SubmitInvite() {
  const { t } = useI18n();

  return (
    <section className="submit-invite">
      <Container>
        <div className="submit-invite-inner">
          <div className="submit-invite-copy">
            <h2>{t('home.submit.title')}</h2>
            <p>{t('home.submit.description')}</p>
          </div>
          <Button
            className="submit-invite-button"
            href="/submit"
            icon={Send}
            analyticsEvent={{
              name: 'cta_click',
              params: { area: 'submit_invite', label: t('common.submit'), link_url: '/submit' },
            }}
          >
            {t('common.submit')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
