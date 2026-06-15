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
import ToolsPage from './pages/ToolsPage.jsx';
import ToolDetailPage from './pages/ToolDetailPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';

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
  const isCaseDetail = parts[0] === 'cases' && parts.length === 3;
  const isToolDetail = pathname.startsWith('/tools/');
  const knownPaths = ['/cases', '/learn', '/tools', '/about', '/privacy'];

  return (
    <div className={`site-shell ${isHome ? 'site-shell-home' : ''}`}>
      <Header />
      <main>
        {pathname === '/cases' && <CasesPage />}
        {isCaseDetail && (
          <CaseDetailPage categorySlug={parts[1]} slug={parts[2]} />
        )}
        {pathname === '/learn' && <LearnPage />}
        {pathname === '/tools' && <ToolsPage />}
        {isToolDetail && <ToolDetailPage />}
        {pathname === '/about' && <AboutPage />}
        {pathname === '/privacy' && <PrivacyPage />}
        {!knownPaths.includes(pathname) && !isCaseDetail && !isToolDetail && <Home />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
