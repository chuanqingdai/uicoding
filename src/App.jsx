import { useEffect } from 'react';
import { Header, Footer } from './components/Layout.jsx';
import {
  CommonTools,
  FeaturedCases,
  HomeHero,
  LearningResources,
  SubmitInvite,
} from './components/HomeSections.jsx';
import CasesPage from './pages/CasesPage.jsx';
import CaseDetailPage from './pages/CaseDetailPage.jsx';
import LearnPage from './pages/LearnPage.jsx';
import LearnDetailPage from './pages/LearnDetailPage.jsx';
import ToolsPage from './pages/ToolsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SubmitPage from './pages/SubmitPage.jsx';
import { trackPageView } from './lib/analytics.js';

function Home() {
  return (
    <>
      <HomeHero />
      <FeaturedCases />
      <LearningResources />
      <CommonTools />
      <SubmitInvite />
    </>
  );
}

function App() {
  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  const isHome = pathname === '/';
  const isLogin = pathname === '/login';
  const isCaseDetail = parts[0] === 'cases' && parts.length === 3;
  const isLearnDetail = parts[0] === 'learn' && parts.length === 2;
  const isToolsPath = parts[0] === 'tools';
  const knownPaths = ['/cases', '/learn', '/tools', '/about', '/privacy', '/login', '/submit'];

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return (
    <div className={`site-shell ${isHome ? 'site-shell-home' : ''} ${isLogin ? 'site-shell-auth' : ''}`}>
      {!isLogin && <Header />}
      <main>
        {pathname === '/cases' && <CasesPage />}
        {isCaseDetail && (
          <CaseDetailPage categorySlug={parts[1]} slug={parts[2]} />
        )}
        {pathname === '/learn' && <LearnPage />}
        {isLearnDetail && <LearnDetailPage slug={parts[1]} />}
        {isToolsPath && <ToolsPage />}
        {pathname === '/about' && <AboutPage />}
        {pathname === '/privacy' && <PrivacyPage />}
        {pathname === '/login' && <LoginPage />}
        {pathname === '/submit' && <SubmitPage />}
        {!knownPaths.includes(pathname) && !isCaseDetail && !isLearnDetail && !isToolsPath && <Home />}
      </main>
      {!isLogin && <Footer />}
    </div>
  );
}

export default App;
