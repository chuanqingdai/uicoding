import { useState } from 'react';
import { Container } from '../components/Layout.jsx';
import { Button, Card } from '../components/UI.jsx';
import { trackEvent } from '../lib/analytics.js';
import { useI18n } from '../lib/i18n.jsx';

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
  const { language } = useI18n();
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialLoginState);
  const copy = language === 'en'
    ? {
        title: 'Log in to Uicoding.ai',
        description: 'Use Google to continue browsing cases and learning resources.',
        loggedIn: 'Mock login complete',
        login: 'Continue with Google',
        success: 'Logged in for the frontend demo.',
        note: 'This is a frontend demo. Real Google login is not connected yet.',
      }
    : {
        title: '登录 Uicoding.ai',
        description: '使用 Google 登录，继续浏览案例和学习资料。',
        loggedIn: '已模拟登录',
        login: '使用 Google 登录',
        success: '登录成功，已进入前端演示状态',
        note: '当前为前端演示，暂未接入真实 Google 登录。',
      };

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
              <h1 id="login-title">{copy.title}</h1>
              <p id="login-description">{copy.description}</p>
            </div>
            <Button
              className="google-login-button"
              onClick={handleGoogleLogin}
              type="button"
              variant="secondary"
            >
              <span className="google-mark" aria-hidden="true">G</span>
              {isLoggedIn ? copy.loggedIn : copy.login}
            </Button>
            {isLoggedIn && (
              <p className="login-success">{copy.success}</p>
            )}
            <p className="login-note">{copy.note}</p>
          </Card>
        </div>
      </Container>
    </div>
  );
}
