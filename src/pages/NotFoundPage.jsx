import { Container } from '../components/Layout.jsx';
import { Button } from '../components/UI.jsx';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <Container>
        <div className="not-found-copy">
          <p>404</p>
          <h1>页面不存在</h1>
          <span>
            这个页面可能已经移动，或链接地址不正确。你可以回到首页继续浏览案例和学习资料。
          </span>
          <div className="not-found-actions">
            <Button href="/">返回首页</Button>
            <Button href="/cases" variant="secondary">浏览案例</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
