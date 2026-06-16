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

export function HomeHero() {
  return (
    <section className="hero">
      <Container className="hero-stage">
        <div className="hero-copy">
          <h1>从真实作品学习 AI 编程</h1>
          <p>
            面向设计师和产品经理等代码零基础人群的交流社区，一起学习工具使用技巧、界面设计和上线经验。
          </p>
          <div className="hero-actions">
            <Button href="/cases" icon={LayoutGrid}>浏览案例</Button>
            <Button
              className="hero-submit-button"
              href="/submit"
              icon={Send}
              variant="secondary"
            >
              提交作品
            </Button>
          </div>
        </div>
        <HeroRecommendation />
      </Container>
    </section>
  );
}

export function HeroRecommendation() {
  const visualImage = heroRecommendation.image ?? heroRecommendation.screenshotUrl;

  return (
    <Card className="recommend-card" href={heroRecommendation.href}>
      <div className="recommend-stamp" aria-label="今日推荐">
        <span>今日推荐</span>
      </div>
      <div className="recommend-visual">
        {visualImage ? (
          <img
            src={visualImage}
            alt={heroRecommendation.imageAlt ?? `${heroRecommendation.title} 截图`}
            loading="eager"
          />
        ) : (
          <ProductMockup featured type={heroRecommendation.visualType} />
        )}
        <div className="recommend-overlay">
          <div className="recommend-overlay-tags">
            <Badge>{heroRecommendation.category}</Badge>
            {heroRecommendation.tools?.[0] && <Badge>{heroRecommendation.tools[0]}</Badge>}
          </div>
          <div className="recommend-overlay-copy">
            <h2>{heroRecommendation.title}</h2>
            <p>{heroRecommendation.description}</p>
          </div>
          <span className="button button-primary">查看</span>
        </div>
      </div>
    </Card>
  );
}

export function FeaturedCases() {
  const homeCases = homeFeaturedIds
    .map((id) => cases.find((item) => item.id === id))
    .filter(Boolean);

  return (
    <Section
      actionHref="/cases"
      title="案例"
      description="拆解真实作品的构建思路、提示词和界面设计方法。"
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
  return (
    <Section
      actionHref="/learn"
      className="learning-section"
      title="学习"
      description="为设计师、产品经理和独立开发者准备的学习资料。"
    >
      <div className="learning-grid">
        {learningResources.map((item) => (
          <LearningCard item={item} key={item.title} showImage={false} showStats={false} />
        ))}
      </div>
    </Section>
  );
}

export function CommonTools() {
  const homeTools = tools.slice(0, 4);

  return (
    <Section
      actionHref="/tools"
      className="tools-section"
      title="工具"
      description="了解不同工具适合什么场景。"
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
  return (
    <section className="submit-invite">
      <Container>
        <div className="submit-invite-inner">
          <div className="submit-invite-copy">
            <h2>分享你的AI编程作品</h2>
            <p>
              如果你用 AI 做出了一个真实项目，欢迎提交给更多人学习和拆解。
            </p>
          </div>
          <Button className="submit-invite-button" href="/submit" icon={Send}>
            提交作品
          </Button>
        </div>
      </Container>
    </section>
  );
}
