import { Container } from '../components/Layout.jsx';
import { Button } from '../components/UI.jsx';
import { useI18n } from '../lib/i18n.jsx';

export default function NotFoundPage() {
  const { language } = useI18n();
  const copy = language === 'en'
    ? {
        title: 'Page not found',
        description:
          'This page may have moved, or the link may be incorrect. You can return home or continue browsing cases.',
        home: 'Back home',
        cases: 'Browse cases',
      }
    : {
        title: '页面不存在',
        description: '这个页面可能已经移动，或链接地址不正确。你可以回到首页继续浏览案例和学习资料。',
        home: '返回首页',
        cases: '浏览案例',
      };

  return (
    <div className="not-found-page">
      <Container>
        <div className="not-found-copy">
          <p>404</p>
          <h1>{copy.title}</h1>
          <span>{copy.description}</span>
          <div className="not-found-actions">
            <Button href="/">{copy.home}</Button>
            <Button href="/cases" variant="secondary">{copy.cases}</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
