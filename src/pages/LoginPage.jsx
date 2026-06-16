import { useState } from 'react';
import { Container } from '../components/Layout.jsx';
import { Button, Card } from '../components/UI.jsx';
import { trackEvent } from '../lib/analytics.js';

const mockUser = {
  name: 'Google 用户',
  provider: 'google',
  loggedIn: true,
};

function getInitialLoginState() {
  try {
    const storedUser = JSON.parse(localStorage.getItem('uicoding_mock_user'));

    return Boolean(storedUser?.loggedIn);
  } catch {
    return false;
  }
}

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialLoginState);

  const handleGoogleLogin = () => {
    localStorage.setItem('uicoding_mock_user', JSON.stringify(mockUser));
    setIsLoggedIn(true);
    trackEvent('login_mock_success', { provider: 'google' });
  };

  return (
    <div className="login-page">
      <Container>
        <div className="login-shell">
          <Card
            aria-modal="true"
            aria-describedby="login-description"
            aria-labelledby="login-title"
            className="login-card"
            role="dialog"
          >
            <div className="login-copy">
              <h1 id="login-title">登录 Uicoding.ai</h1>
              <p id="login-description">
                使用 Google 登录，继续收藏案例和学习资料。
              </p>
            </div>
            <Button
              className="google-login-button"
              onClick={handleGoogleLogin}
              type="button"
              variant="secondary"
            >
              <span className="google-mark" aria-hidden="true">G</span>
              {isLoggedIn ? '已模拟登录' : '使用 Google 登录'}
            </Button>
            {isLoggedIn && (
              <p className="login-success">
                登录成功，已进入前端演示状态
              </p>
            )}
            <p className="login-note">
              当前为前端演示，暂未接入真实 Google 登录。
            </p>
          </Card>
        </div>
      </Container>
    </div>
  );
}
