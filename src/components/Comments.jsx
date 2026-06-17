import { useMemo, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { trackEvent } from '../lib/analytics.js';

const cookieName = 'uicoding_comment_user';

const namePrefixes = ['松石', '青柠', '竹影', '星河', '云杉', '墨白', '暖橙', '海盐'];
const nameRoles = ['设计师', '产品人', '学习者', '独立开发者', '创作者', '观察员'];
const avatarColors = ['#9B3D2B', '#7B5C38', '#2F6F64', '#4E5F7A', '#6D4F7D', '#8A5B4A'];

function readCookie(name) {
  if (typeof document === 'undefined') {
    return '';
  }

  return document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=') ?? '';
}

function writeCookie(name, value) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function createCommentUser() {
  const seed = Math.floor(Math.random() * 10000);
  const name = `${namePrefixes[seed % namePrefixes.length]}${nameRoles[seed % nameRoles.length]}`;

  return {
    id: `guest-${Date.now()}-${seed}`,
    name,
    avatarText: name.slice(0, 1),
    avatarColor: avatarColors[seed % avatarColors.length],
  };
}

function getCommentUser() {
  try {
    const stored = readCookie(cookieName);

    if (stored) {
      return JSON.parse(decodeURIComponent(stored));
    }
  } catch {
    // Ignore malformed cookies and issue a new local identity.
  }

  const user = createCommentUser();
  writeCookie(cookieName, JSON.stringify(user));

  return user;
}

function getExistingCommentUser() {
  try {
    const stored = readCookie(cookieName);

    if (stored) {
      return JSON.parse(decodeURIComponent(stored));
    }
  } catch {
    return null;
  }

  return null;
}

function getStoredComments(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? [];
  } catch {
    return [];
  }
}

function formatTime(value) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function Comments({ targetId, targetType = 'page', title = '评论' }) {
  const storageKey = `uicoding_comments_${targetType}_${targetId}`;
  const [commentUser, setCommentUser] = useState(
    () =>
      getExistingCommentUser() ?? {
        name: '点击评论生成昵称',
        avatarText: '评',
        avatarColor: '#8A5B4A',
      },
  );
  const [comments, setComments] = useState(() => getStoredComments(storageKey));
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const commentCountLabel = useMemo(
    () => `${comments.length} 条讨论`,
    [comments.length],
  );

  const refreshUser = () => {
    const user = getCommentUser();
    setCommentUser(user);

    return user;
  };

  const submitComment = (event) => {
    event.preventDefault();
    const content = draft.trim();

    if (content.length < 2) {
      setError('写一点你的想法再发布。');
      return;
    }

    const user = refreshUser();
    const nextComment = {
      id: `comment-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      author: user,
    };
    const nextComments = [nextComment, ...comments];

    localStorage.setItem(storageKey, JSON.stringify(nextComments));
    setComments(nextComments);
    setDraft('');
    setError('');
    trackEvent('comment_submit', {
      target_id: targetId,
      target_type: targetType,
      comment_length: content.length,
    });
  };

  return (
    <section className="comments-section" aria-labelledby={`${targetType}-${targetId}-comments`}>
      <div className="comments-head">
        <div>
          <h2 id={`${targetType}-${targetId}-comments`}>{title}</h2>
          <p>{commentCountLabel}</p>
        </div>
        <div className="comment-user">
          <span
            className="comment-avatar"
            style={{ '--comment-avatar-color': commentUser.avatarColor }}
            aria-hidden="true"
          >
            {commentUser.avatarText}
          </span>
          <span>{commentUser.name}</span>
        </div>
      </div>

      <form className="comment-form" onSubmit={submitComment}>
        <textarea
          value={draft}
          onFocus={refreshUser}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="写下你的看法、问题或补充经验。"
          maxLength={300}
          rows={4}
        />
        <div className="comment-form-foot">
          <span>{error || '点击评论框后，会自动生成一个中文昵称和头像。'}</span>
          <button type="submit">
            <Send size={15} strokeWidth={1.9} aria-hidden="true" />
            发布评论
          </button>
        </div>
      </form>

      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="comment-empty">
            <MessageCircle size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>还没有评论，欢迎留下第一个想法。</span>
          </div>
        ) : (
          comments.map((comment) => (
            <article className="comment-item" key={comment.id}>
              <span
                className="comment-avatar"
                style={{ '--comment-avatar-color': comment.author.avatarColor }}
                aria-hidden="true"
              >
                {comment.author.avatarText}
              </span>
              <div>
                <div className="comment-meta">
                  <strong>{comment.author.name}</strong>
                  <time dateTime={comment.createdAt}>{formatTime(comment.createdAt)}</time>
                </div>
                <p>{comment.content}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
