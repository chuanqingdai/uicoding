import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Send } from 'lucide-react';
import { footerGroups, navItems } from '../data.js';
import { Button } from './UI.jsx';
import { trackClick } from '../lib/analytics.js';
import { languages, useI18n } from '../lib/i18n.jsx';

export function Container({ children, className = '' }) {
  return <div className={`container ${className}`}>{children}</div>;
}

export function Section({
  actionHref,
  actionLabel = '更多',
  children,
  className = '',
  eyebrow,
  title,
  description,
}) {
  const { t } = useI18n();
  const finalActionLabel = actionLabel === '更多' ? t('common.more') : actionLabel;

  return (
    <section className={`section ${className}`}>
      <Container>
        {(eyebrow || title || description || actionHref) && (
          <div className="section-heading">
            <div className="section-heading-main">
              {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
              {title && <h2>{title}</h2>}
              {description && <p>{description}</p>}
            </div>
            {actionHref && (
              <a
                className="section-more"
                href={actionHref}
                onClick={() => trackClick('section_more', finalActionLabel, { link_url: actionHref })}
              >
                {finalActionLabel} →
              </a>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

export function Header() {
  const { language, setLanguage, t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageMenuRef = useRef(null);
  const scrollTimer = useRef(null);
  const pathname = window.location.pathname;

  const handleLanguageSelect = (nextLanguage) => {
    setLanguage(nextLanguage);
    setIsLanguageOpen(false);
    trackClick('language_switch', nextLanguage, { language: nextLanguage });
  };

  useEffect(() => {
    const root = document.documentElement;

    const updateScrollIndicator = () => {
      const viewportHeight = window.innerHeight;
      const pageHeight = Math.max(root.scrollHeight, document.body.scrollHeight);
      const scrollable = Math.max(0, pageHeight - viewportHeight);
      const thumbHeight = scrollable
        ? Math.max(42, Math.round((viewportHeight / pageHeight) * viewportHeight))
        : 0;
      const maxTop = Math.max(4, viewportHeight - thumbHeight - 4);
      const top = scrollable ? Math.round((window.scrollY / scrollable) * maxTop) + 4 : 4;

      root.style.setProperty('--scrollbar-height', `${thumbHeight}px`);
      root.style.setProperty('--scrollbar-top', `${top}px`);
    };

    const updateScrolled = () => {
      setIsScrolled(window.scrollY > 12);
    };

    updateScrolled();
    updateScrollIndicator();

    const handleScroll = () => {
      updateScrolled();
      updateScrollIndicator();
      root.classList.add('is-page-scrolling');

      if (scrollTimer.current) {
        window.clearTimeout(scrollTimer.current);
      }

      scrollTimer.current = window.setTimeout(() => {
        root.classList.remove('is-page-scrolling');
      }, 520);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollIndicator);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollIndicator);
      if (scrollTimer.current) {
        window.clearTimeout(scrollTimer.current);
      }
      root.classList.remove('is-page-scrolling');
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!languageMenuRef.current?.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <Container className="header-inner">
          <a
            className="brand"
            href="/"
            aria-label={language === 'en' ? 'Uicoding.ai home' : 'Uicoding.ai 首页'}
            onClick={() => trackClick('header_brand', 'Uicoding.ai', { link_url: '/' })}
          >
            <img className="brand-icon" src="/site-icon.png" alt="" aria-hidden="true" />
            Uicoding.ai
          </a>
          <nav className="main-nav" aria-label={language === 'en' ? 'Main navigation' : '主导航'}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const labelMap = {
                '/cases': t('nav.cases'),
                '/learn': t('nav.learn'),
                '/tools': t('nav.tools'),
              };
              const label = labelMap[item.href] ?? item.label;

              return (
                <a
                  aria-current={isActive ? 'page' : undefined}
                  className={isActive ? 'is-active' : ''}
                  href={item.href}
                  key={item.href}
                  onClick={() => trackClick('header_nav', label, { link_url: item.href })}
                >
                  {label}
                </a>
              );
            })}
          </nav>
          <div className="header-actions">
            <div
              className={`language-menu ${isLanguageOpen ? 'is-open' : ''}`}
              ref={languageMenuRef}
            >
              <button
                aria-expanded={isLanguageOpen}
                aria-haspopup="listbox"
                aria-label={language === 'en' ? 'Select language' : '选择语言'}
                className="language-trigger"
                onClick={() => setIsLanguageOpen((value) => !value)}
                type="button"
              >
                <span>{languages[language]}</span>
                <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
              </button>
              {isLanguageOpen && (
                <div
                  aria-label={language === 'en' ? 'Language options' : '语言选项'}
                  className="language-options"
                  role="listbox"
                >
                  {Object.entries(languages).map(([value, label]) => {
                    const isSelected = value === language;

                    return (
                      <button
                        aria-selected={isSelected}
                        className={`language-option ${isSelected ? 'is-selected' : ''}`}
                        key={value}
                        onClick={() => handleLanguageSelect(value)}
                        role="option"
                        type="button"
                      >
                        <span>{label}</span>
                        {isSelected && <Check size={14} strokeWidth={2} aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <Button
              href="/submit"
              icon={Send}
              analyticsEvent={{
                name: 'cta_click',
                params: { area: 'header', label: t('common.submit'), link_url: '/submit' },
              }}
            >
              {t('common.submit')}
            </Button>
          </div>
        </Container>
      </header>
      <span aria-hidden="true" className="page-scrollbar" />
    </>
  );
}

export function Footer() {
  const { t } = useI18n();
  const footerTitleMap = {
    探索: t('footer.explore'),
    站点: t('footer.site'),
  };
  const footerLinkMap = {
    案例: t('footer.cases'),
    学习资料: t('footer.learn'),
    提交作品: t('footer.submit'),
    关于: t('footer.about'),
    隐私协议: t('footer.privacy'),
  };

  return (
    <footer className="site-footer">
      <Container className="footer-inner">
        <div className="footer-brand">
          <a
            className="brand"
            href="/"
            onClick={() => trackClick('footer_brand', 'Uicoding.ai', { link_url: '/' })}
          >
            <img className="brand-icon" src="/site-icon.png" alt="" aria-hidden="true" />
            Uicoding.ai
          </a>
          <p>{t('footer.description')}</p>
        </div>
        <div className="footer-links">
          {footerGroups.map((group) => (
            <div className="footer-group" key={group.title}>
              <h3>{footerTitleMap[group.title] ?? group.title}</h3>
              {group.links.map((link) => (
                <a
                  href={link.href}
                  key={link.label}
                  onClick={() =>
                    trackClick('footer_link', footerLinkMap[link.label] ?? link.label, {
                      group: footerTitleMap[group.title] ?? group.title,
                      link_url: link.href,
                    })
                  }
                >
                  {footerLinkMap[link.label] ?? link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </footer>
  );
}
