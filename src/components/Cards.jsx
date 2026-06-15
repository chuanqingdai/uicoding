import {
  Eye,
  Heart,
} from 'lucide-react';
import ClaudeCodeIcon from '@lobehub/icons/es/ClaudeCode/components/Color';
import ClineIcon from '@lobehub/icons/es/Cline/components/Mono';
import CodexIcon from '@lobehub/icons/es/Codex/components/Color';
import CursorIcon from '@lobehub/icons/es/Cursor/components/Mono';
import DeepSeekIcon from '@lobehub/icons/es/DeepSeek/components/Color';
import DoubaoIcon from '@lobehub/icons/es/Doubao/components/Color';
import GithubCopilotIcon from '@lobehub/icons/es/GithubCopilot/components/Mono';
import KimiIcon from '@lobehub/icons/es/Kimi/components/Color';
import LovableIcon from '@lobehub/icons/es/Lovable/components/Color';
import QwenIcon from '@lobehub/icons/es/Qwen/components/Color';
import ReplitIcon from '@lobehub/icons/es/Replit/components/Color';
import TraeIcon from '@lobehub/icons/es/Trae/components/Color';
import V0Icon from '@lobehub/icons/es/V0/components/Mono';
import WenxinIcon from '@lobehub/icons/es/Wenxin/components/Color';
import WindsurfIcon from '@lobehub/icons/es/Windsurf/components/Mono';
import ZhipuIcon from '@lobehub/icons/es/Zhipu/components/Color';
import { Badge, Card } from './UI.jsx';

const visualAccent = {
  dashboard: 'slate',
  prompt: 'green',
  crm: 'blue',
  landing: 'amber',
};

const numberFormatter = new Intl.NumberFormat('zh-CN');

const toolLogos = {
  'claude-code': ClaudeCodeIcon,
  cline: ClineIcon,
  codex: CodexIcon,
  cursor: CursorIcon,
  deepseek: DeepSeekIcon,
  doubao: DoubaoIcon,
  'github-copilot': GithubCopilotIcon,
  kimi: KimiIcon,
  lovable: LovableIcon,
  qwen: QwenIcon,
  replit: ReplitIcon,
  trae: TraeIcon,
  v0: V0Icon,
  wenxin: WenxinIcon,
  windsurf: WindsurfIcon,
  zhipu: ZhipuIcon,
};

export function CaseCard({ item, showStats = true }) {
  const accent = item.accent ?? visualAccent[item.visualType] ?? 'slate';
  const hasStats =
    showStats && item.viewCount !== undefined && item.likeCount !== undefined;

  return (
    <Card className="case-card" href={item.href ?? '/cases'}>
      <div className="case-card-visual">
        <ProductMockup accent={accent} compact type={item.visualType} />
        {hasStats && (
          <div className="case-stats case-stats-overlay">
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
      </div>
      <div className="case-card-body">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="tag-row">
          <Badge>{item.category}</Badge>
          {item.tools?.[0] && <Badge>{item.tools[0]}</Badge>}
        </div>
        <div className="card-footer-row">
          <span className="card-link">
            查看案例 →
          </span>
        </div>
      </div>
    </Card>
  );
}

export function LearningCard({ item, showStats = true }) {
  const duration = item.duration ?? item.readingTime;
  const hasStats =
    showStats && item.viewCount !== undefined && item.likeCount !== undefined;

  return (
    <Card className="learning-card" href={item.href ?? '/learn'}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {(item.category || duration) && (
        <div className="learning-meta">
          {item.category && <Badge>{item.category}</Badge>}
          {duration && <Badge>{duration}</Badge>}
        </div>
      )}
      {hasStats && (
        <div className="card-footer-row">
          <div className="case-stats">
            <span>
              <Eye size={14} strokeWidth={1.8} aria-hidden="true" />
              {numberFormatter.format(item.viewCount)} 浏览
            </span>
            <span>
              <Heart size={14} strokeWidth={1.8} aria-hidden="true" />
              {numberFormatter.format(item.likeCount)} 点赞
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

export function ToolPill({ id, name, description, href }) {
  const Logo = toolLogos[id];

  return (
    <Card className="tool-card" href={href ?? '/tools'}>
      <div className="tool-icon" aria-hidden="true">
        {id === 'bolt' && <img src="/brand-icons/bolt.svg" alt="" />}
        {Logo && <Logo size={28} aria-hidden="true" />}
        {!Logo && id !== 'bolt' && <span>{name.slice(0, 2)}</span>}
      </div>
      <div className="tool-card-copy">
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
      <span className="card-link">
        了解工具 →
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
