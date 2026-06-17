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
import { I18nProvider, useI18n } from './lib/i18n.jsx';
import { localizeCase, localizeLesson } from './lib/contentLocalization.js';
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

function buildStructuredData({ caseItem, isHome, language, lesson, pathname, seo }) {
  const base = {
    '@context': 'https://schema.org',
  };
  const displayCase = localizeCase(caseItem, language);
  const displayLesson = localizeLesson(lesson, language);

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

  if (displayCase) {
    return {
      ...base,
      '@type': 'CreativeWork',
      name: displayCase.title,
      description: displayCase.description,
      url: getCanonicalUrl(pathname),
      datePublished: displayCase.publishedAt,
      author: {
        '@type': 'Person',
        name: displayCase.submitter?.name || 'Uicoding.ai',
      },
      image: displayCase.screenshotUrl
        ? `${seoDefaults.siteUrl}${displayCase.screenshotUrl}`
        : `${seoDefaults.siteUrl}/site-icon.png`,
    };
  }

  if (displayLesson) {
    return {
      ...base,
      '@type': 'Article',
      headline: displayLesson.title,
      description: displayLesson.description,
      url: getCanonicalUrl(pathname),
      datePublished: displayLesson.publishedAt,
      author: {
        '@type': 'Person',
        name: displayLesson.author || displayLesson.sourceName || 'Uicoding.ai',
      },
      image: displayLesson.image
        ? `${seoDefaults.siteUrl}${displayLesson.image}`
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

function getRouteSeo({ caseItem, isNotFound, language, lesson, pathname, t }) {
  if (isNotFound) {
    return {
      title: language === 'en' ? 'Page not found' : '页面不存在',
      description:
        language === 'en'
          ? 'This page may have moved, or the link may be incorrect.'
          : '这个页面可能已经移动，或链接地址不正确。',
      noindex: true,
    };
  }

  if (caseItem) {
    const displayCase = localizeCase(caseItem, language);

    return {
      title: displayCase.title,
      description: displayCase.description,
      image: displayCase.screenshotUrl,
      type: 'article',
    };
  }

  if (lesson) {
    const displayLesson = localizeLesson(lesson, language);

    return {
      title: displayLesson.title,
      description: displayLesson.description,
      image: displayLesson.image,
      type: 'article',
    };
  }

  const pageSeo = {
    '/': {
      title: 'Uicoding.ai',
      description: t('seo.home.description'),
    },
    '/cases': {
      title: t('seo.cases.title'),
      description: t('seo.cases.description'),
    },
    '/learn': {
      title: t('seo.learn.title'),
      description: t('seo.learn.description'),
    },
    '/tools': {
      title: t('seo.tools.title'),
      description: t('seo.tools.description'),
    },
    '/about': {
      title: language === 'en' ? 'About Uicoding.ai' : '关于 Uicoding.ai',
      description:
        language === 'en'
          ? 'Learn about Uicoding.ai, its creator, and its AI coding learning community.'
          : '了解 Uicoding.ai 的创建背景、作者介绍和 AI 编程学习社区目标。',
    },
    '/privacy': {
      title: language === 'en' ? 'Privacy Policy' : '隐私协议',
      description:
        language === 'en'
          ? 'Privacy policy and basic data usage notes for Uicoding.ai.'
          : 'Uicoding.ai 的隐私协议和基础数据使用说明。',
    },
    '/submit': {
      title: t('seo.submit.title'),
      description: t('seo.submit.description'),
    },
    '/login': {
      title: language === 'en' ? 'Log in to Uicoding.ai' : '登录 Uicoding.ai',
      description: language === 'en' ? 'Uicoding.ai login page.' : 'Uicoding.ai 登录页面。',
      noindex: true,
    },
  };

  return pageSeo[pathname] ?? pageSeo['/'];
}

function AppContent() {
  const { language, t } = useI18n();
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
  const seo = getRouteSeo({ caseItem, isNotFound, language, lesson, pathname, t });
  const structuredData = buildStructuredData({
    caseItem,
    isHome,
    language,
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
        language={language}
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

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
