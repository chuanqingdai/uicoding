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
import NotFoundPage from './pages/NotFoundPage.jsx';
import SEO, { getCanonicalUrl, seoDefaults } from './components/SEO.jsx';
import { trackPageView } from './lib/analytics.js';
import { cases, lessons } from './data.js';

const learnRedirects = {
  'forged-in-silence-codex-3d-website-case': '/cases/landing-page/forged-in-silence-codex',
};

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

function buildStructuredData({ caseItem, isHome, lesson, pathname, seo }) {
  const base = {
    '@context': 'https://schema.org',
  };

  if (isHome) {
    return [
      {
        ...base,
        '@type': 'WebSite',
        name: seoDefaults.siteName,
        url: seoDefaults.siteUrl,
        description: seo.description,
      },
      {
        ...base,
        '@type': 'Organization',
        name: seoDefaults.siteName,
        url: seoDefaults.siteUrl,
        logo: `${seoDefaults.siteUrl}/site-icon.png`,
      },
    ];
  }

  if (caseItem) {
    return {
      ...base,
      '@type': 'CreativeWork',
      name: caseItem.title,
      description: caseItem.description,
      url: getCanonicalUrl(pathname),
      datePublished: caseItem.publishedAt,
      author: {
        '@type': 'Person',
        name: caseItem.submitter?.name || 'Uicoding.ai',
      },
      image: caseItem.screenshotUrl
        ? `${seoDefaults.siteUrl}${caseItem.screenshotUrl}`
        : `${seoDefaults.siteUrl}/site-icon.png`,
    };
  }

  if (lesson) {
    return {
      ...base,
      '@type': 'Article',
      headline: lesson.title,
      description: lesson.description,
      url: getCanonicalUrl(pathname),
      datePublished: lesson.publishedAt,
      author: {
        '@type': 'Person',
        name: lesson.author || lesson.sourceName || 'Uicoding.ai',
      },
      image: lesson.image
        ? `${seoDefaults.siteUrl}${lesson.image}`
        : `${seoDefaults.siteUrl}/site-icon.png`,
    };
  }

  return {
    ...base,
    '@type': 'WebPage',
    name: seo.title,
    description: seo.description,
    url: getCanonicalUrl(pathname),
  };
}

function getRouteSeo({ caseItem, isNotFound, lesson, pathname }) {
  if (isNotFound) {
    return {
      title: '页面不存在',
      description: '这个页面可能已经移动，或链接地址不正确。',
      noindex: true,
    };
  }

  if (caseItem) {
    return {
      title: caseItem.title,
      description: caseItem.description,
      image: caseItem.screenshotUrl,
      type: 'article',
    };
  }

  if (lesson) {
    return {
      title: lesson.title,
      description: lesson.description,
      image: lesson.image,
      type: 'article',
    };
  }

  const pageSeo = {
    '/': {
      title: 'Uicoding.ai',
      description: seoDefaults.defaultDescription,
    },
    '/cases': {
      title: 'AI 编程案例',
      description: '浏览真实 AI 编程作品，学习构建思路、提示词、工具组合、界面设计和上线过程。',
    },
    '/learn': {
      title: 'AI 编程学习资料',
      description: '面向零基础用户的 AI 编程教程、工具使用方法、提示词经验和真实项目复盘。',
    },
    '/tools': {
      title: 'AI 编程工具',
      description: '了解常用 AI Coding 工具的定位、适合场景和使用方式。',
    },
    '/about': {
      title: '关于 Uicoding.ai',
      description: '了解 Uicoding.ai 的创建背景、作者介绍和 AI 编程学习社区目标。',
    },
    '/privacy': {
      title: '隐私协议',
      description: 'Uicoding.ai 的隐私协议和基础数据使用说明。',
    },
    '/submit': {
      title: '提交 AI 编程作品',
      description: '把你的 AI 编程作品链接发给 Uicoding.ai，一起交流 AI Coding 和一人公司的经验。',
    },
    '/login': {
      title: '登录 Uicoding.ai',
      description: 'Uicoding.ai 登录页面。',
      noindex: true,
    },
  };

  return pageSeo[pathname] ?? pageSeo['/'];
}

function App() {
  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  const isHome = pathname === '/';
  const isLogin = pathname === '/login';
  const isCaseDetail = parts[0] === 'cases' && parts.length === 3;
  const isLearnDetail = parts[0] === 'learn' && parts.length === 2;
  const learnRedirectTarget = isLearnDetail ? learnRedirects[parts[1]] : '';
  const isToolsPath = pathname === '/tools';
  const knownPaths = ['/cases', '/learn', '/tools', '/about', '/privacy', '/login', '/submit'];
  const caseItem = isCaseDetail
    ? cases.find((item) => item.categorySlug === parts[1] && item.slug === parts[2])
    : null;
  const lesson = isLearnDetail
    ? lessons.find((item) => item.id === parts[1])
    : null;
  const isStaticPath = knownPaths.includes(pathname) || isHome;
  const isNotFound =
    pathname === '/404' ||
    (!isStaticPath && !isCaseDetail && !isLearnDetail && !isToolsPath) ||
    (isCaseDetail && !caseItem) ||
    (isLearnDetail && !lesson && !learnRedirectTarget);
  const seo = getRouteSeo({ caseItem, isNotFound, lesson, pathname });
  const structuredData = buildStructuredData({
    caseItem,
    isHome,
    lesson,
    pathname,
    seo,
  });

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  useEffect(() => {
    if (learnRedirectTarget && pathname !== learnRedirectTarget) {
      window.location.replace(learnRedirectTarget);
    }
  }, [learnRedirectTarget, pathname]);

  return (
    <div className={`site-shell ${isHome ? 'site-shell-home' : ''} ${isLogin ? 'site-shell-auth' : ''}`}>
      <SEO
        canonicalPath={isNotFound ? '/404' : pathname}
        description={seo.description}
        image={seo.image}
        noindex={seo.noindex}
        structuredData={isNotFound ? null : structuredData}
        title={seo.title}
        type={seo.type}
      />
      {!isLogin && <Header />}
      <main>
        {pathname === '/cases' && <CasesPage />}
        {isCaseDetail && !isNotFound && (
          <CaseDetailPage categorySlug={parts[1]} slug={parts[2]} />
        )}
        {pathname === '/learn' && <LearnPage />}
        {isLearnDetail && !learnRedirectTarget && !isNotFound && <LearnDetailPage slug={parts[1]} />}
        {isToolsPath && <ToolsPage />}
        {pathname === '/about' && <AboutPage />}
        {pathname === '/privacy' && <PrivacyPage />}
        {pathname === '/login' && <LoginPage />}
        {pathname === '/submit' && <SubmitPage />}
        {isHome && <Home />}
        {isNotFound && <NotFoundPage />}
      </main>
      {!isLogin && <Footer />}
    </div>
  );
}

export default App;
