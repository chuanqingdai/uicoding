import {
  Eye,
  Heart,
} from 'lucide-react';
import ClaudeCode from '@lobehub/icons/es/ClaudeCode/components/Mono';
import Cline from '@lobehub/icons/es/Cline/components/Mono';
import Codex from '@lobehub/icons/es/Codex/components/Color';
import Cursor from '@lobehub/icons/es/Cursor/components/Mono';
import DeepSeek from '@lobehub/icons/es/DeepSeek/components/Color';
import Doubao from '@lobehub/icons/es/Doubao/components/Color';
import GithubCopilot from '@lobehub/icons/es/GithubCopilot/components/Mono';
import Kimi from '@lobehub/icons/es/Kimi/components/Color';
import Lovable from '@lobehub/icons/es/Lovable/components/Color';
import Qwen from '@lobehub/icons/es/Qwen/components/Color';
import Replit from '@lobehub/icons/es/Replit/components/Color';
import Trae from '@lobehub/icons/es/Trae/components/Color';
import V0 from '@lobehub/icons/es/V0/components/Mono';
import Wenxin from '@lobehub/icons/es/Wenxin/components/Color';
import Windsurf from '@lobehub/icons/es/Windsurf/components/Mono';
import Zhipu from '@lobehub/icons/es/Zhipu/components/Color';
import { Badge, Card } from './UI.jsx';

const visualAccent = {
  dashboard: 'slate',
  prompt: 'green',
  crm: 'blue',
  landing: 'amber',
};

const numberFormatter = new Intl.NumberFormat('zh-CN');

const toolIconLabels = {
  bolt: 'B',
  'claude-code': 'CC',
  cline: 'Cl',
  codex: 'Cx',
  cursor: 'Cu',
  deepseek: 'Ds',
  doubao: '豆',
  'github-copilot': 'Co',
  kimi: 'Ki',
  lovable: 'Lv',
  qwen: 'Qw',
  replit: 'Re',
  trae: 'Tr',
  v0: 'v0',
  wenxin: '文',
  windsurf: 'Ws',
  zhipu: 'GLM',
};

const toolIcons = {
  'claude-code': ClaudeCode,
  cline: Cline,
  codex: Codex,
  cursor: Cursor,
  deepseek: DeepSeek,
  doubao: Doubao,
  'github-copilot': GithubCopilot,
  kimi: Kimi,
  lovable: Lovable,
  qwen: Qwen,
  replit: Replit,
  trae: Trae,
  v0: V0,
  wenxin: Wenxin,
  windsurf: Windsurf,
  zhipu: Zhipu,
};

const toolIconImages = {
  bolt: '/tool-icons/bolt.svg',
  continue: '/tool-icons/continue.png',
};

export function isDefaultLearningCover(image = '') {
  return image.startsWith('/learn-covers/');
}

export function CaseCard({ item, showStats = true }) {
  const accent = item.accent ?? visualAccent[item.visualType] ?? 'slate';
  const visualImage = item.image ?? item.screenshotUrl;
  const hasStats = false;

  return (
    <Card className="case-card" href={item.href ?? '/cases'}>
      <div className="case-card-visual">
        {visualImage ? (
          <img src={visualImage} alt={item.imageAlt ?? `${item.title} 截图`} loading="lazy" />
        ) : (
          <ProductMockup accent={accent} compact type={item.visualType} />
        )}
      </div>
      <div className="case-card-body">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="tag-row">
          <Badge>{item.category}</Badge>
          {item.tools?.[0] && <Badge>{item.tools[0]}</Badge>}
        </div>
        <div
          className={`card-footer-row case-card-footer ${
            hasStats ? '' : 'is-link-only'
          }`}
        >
          {hasStats && (
            <div className="case-stats">
              <span>
                <Eye size={14} strokeWidth={1.8} aria-hidden="true" />
                {numberFormatter.format(item.viewCount)}
              </span>
              <span>
                <Heart size={14} strokeWidth={1.8} aria-hidden="true" />
                {numberFormatter.format(item.likeCount)}
              </span>
            </div>
          )}
          <span className="card-link">
            查看案例 →
          </span>
        </div>
      </div>
    </Card>
  );
}

export function LearningCard({ item, showStats = false, showImage = true }) {
  const hasStats =
    showStats && item.viewCount !== undefined && item.likeCount !== undefined;
  const hasImage = Boolean(showImage && item.image && !isDefaultLearningCover(item.image));

  return (
    <Card
      className={`learning-card ${hasImage ? 'has-image' : 'is-text-only'}`}
      href={item.href ?? '/learn'}
    >
      {hasImage && (
        <div className="learning-card-image">
          <img src={item.image} alt={item.imageAlt ?? item.title} loading="lazy" />
        </div>
      )}
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {hasStats && (
        <div className="card-footer-row">
          <div className="case-stats">
            <span>
              <Eye size={14} strokeWidth={1.8} aria-hidden="true" />
              {numberFormatter.format(item.viewCount)}
            </span>
            <span>
              <Heart size={14} strokeWidth={1.8} aria-hidden="true" />
              {numberFormatter.format(item.likeCount)}
            </span>
          </div>
          <span className="card-link">
            查看资料 →
          </span>
        </div>
      )}
      {!hasStats && <span className="card-link">查看资料 →</span>}
    </Card>
  );
}

export function ToolPill({ id, name, description, officialUrl }) {
  const label = toolIconLabels[id] ?? name.slice(0, 2);
  const Icon = toolIcons[id];
  const iconImage = toolIconImages[id];

  return (
    <Card
      className="tool-card"
      href={officialUrl ?? '/tools'}
      rel={officialUrl ? 'noreferrer' : undefined}
      target={officialUrl ? '_blank' : undefined}
    >
      <div className="tool-icon" aria-hidden="true">
        {Icon ? <Icon size={28} /> : null}
        {!Icon && iconImage ? <img src={iconImage} alt="" loading="lazy" /> : null}
        {!Icon && !iconImage ? <span>{label}</span> : null}
      </div>
      <div className="tool-card-copy">
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
      <span className="card-link">
        访问官网 →
      </span>
    </Card>
  );
}

export function ProductMockup({
  accent = 'slate',
  compact = false,
  featured = false,
  type = 'dashboard',
}) {
  return (
    <div
      className={`product-mockup mockup-${accent} ${compact ? 'is-compact' : ''} ${
        featured ? 'is-hero-preview' : ''
      } mockup-type-${type}`}
    >
      <div className="mockup-image" />
    </div>
  );
}
