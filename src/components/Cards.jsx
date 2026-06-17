import {
  Eye,
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
import { useI18n } from '../lib/i18n.jsx';
import { localizeCase, localizeLesson, localizeTool } from '../lib/contentLocalization.js';

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

export function CaseCard({ item }) {
  const { categoryLabel, language, t } = useI18n();
  const displayItem = localizeCase(item, language);
  const accent = item.accent ?? visualAccent[item.visualType] ?? 'slate';
  const visualImage = item.image ?? item.screenshotUrl;
  const primaryTool = item.tools?.find((tool) => tool && tool !== 'AI 生成证据待补充');

  return (
    <Card
      className="case-card"
      href={item.href ?? '/cases'}
      analyticsEvent={{
        name: 'content_card_click',
        params: {
          content_type: 'case',
          item_id: item.id,
          item_name: displayItem.title,
          category: item.category,
          link_url: item.href ?? '/cases',
        },
      }}
    >
      <div className="case-card-visual">
        {visualImage ? (
          <img src={visualImage} alt={item.imageAlt ?? `${displayItem.title} screenshot`} loading="lazy" />
        ) : (
          <ProductMockup accent={accent} compact type={item.visualType} />
        )}
      </div>
      <div className="case-card-body">
        <h3>{displayItem.title}</h3>
        <p>{displayItem.description}</p>
        <div className="tag-row">
          <Badge>{categoryLabel(item.category)}</Badge>
          {primaryTool && <Badge>{primaryTool}</Badge>}
        </div>
        <div className="card-footer-row case-card-footer is-link-only">
          <span className="card-link">
            {t('common.viewCase')} →
          </span>
        </div>
      </div>
    </Card>
  );
}

export function LearningCard({ item, showStats = false, showImage = true }) {
  const { language, t } = useI18n();
  const displayItem = localizeLesson(item, language);
  const hasStats =
    showStats && item.viewCount !== undefined;
  const hasImage = Boolean(showImage && item.image && !isDefaultLearningCover(item.image));

  return (
    <Card
      className={`learning-card ${hasImage ? 'has-image' : 'is-text-only'}`}
      href={item.href ?? '/learn'}
      analyticsEvent={{
        name: 'content_card_click',
        params: {
          content_type: 'lesson',
          item_id: item.id,
          item_name: displayItem.title,
          category: item.category,
          link_url: item.href ?? '/learn',
        },
      }}
    >
      {hasImage && (
        <div className="learning-card-image">
          <img src={item.image} alt={item.imageAlt ?? displayItem.title} loading="lazy" />
        </div>
      )}
      <h3>{displayItem.title}</h3>
      <p>{displayItem.description}</p>
      {hasStats && (
        <div className="card-footer-row">
          <div className="case-stats">
            <span>
              <Eye size={14} strokeWidth={1.8} aria-hidden="true" />
              {numberFormatter.format(item.viewCount)}
            </span>
          </div>
          <span className="card-link">
            {t('common.viewLesson')} →
          </span>
        </div>
      )}
      {!hasStats && <span className="card-link">{t('common.viewLesson')} →</span>}
    </Card>
  );
}

export function ToolPill({ id, name, description, officialUrl }) {
  const { language, t } = useI18n();
  const displayTool = localizeTool({ id, name, description, officialUrl }, language);
  const label = toolIconLabels[id] ?? name.slice(0, 2);
  const Icon = toolIcons[id];
  const iconImage = toolIconImages[id];

  return (
    <Card
      className="tool-card"
      href={officialUrl ?? '/tools'}
      rel={officialUrl ? 'noreferrer' : undefined}
      target={officialUrl ? '_blank' : undefined}
      analyticsEvent={{
        name: officialUrl ? 'outbound_link_click' : 'content_card_click',
        params: {
          content_type: 'tool',
          item_id: id,
          item_name: displayTool.name,
          label: displayTool.name,
          link_url: officialUrl ?? '/tools',
        },
      }}
    >
      <div className="tool-icon" aria-hidden="true">
        {Icon ? <Icon size={28} /> : null}
        {!Icon && iconImage ? <img src={iconImage} alt="" loading="lazy" /> : null}
        {!Icon && !iconImage ? <span>{label}</span> : null}
      </div>
      <div className="tool-card-copy">
        <h3>{displayTool.name}</h3>
        <p>{displayTool.description}</p>
      </div>
      <span className="card-link">
        {t('common.visitWebsite')} →
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
