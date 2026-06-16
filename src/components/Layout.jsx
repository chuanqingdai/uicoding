import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { footerGroups, navItems } from '../data.js';
import { Button } from './UI.jsx';
import { trackClick } from '../lib/analytics.js';

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
                onClick={() => trackClick('section_more', actionLabel, { link_url: actionHref })}
              >
                {actionLabel} →
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
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollTimer = useRef(null);
  const pathname = window.location.pathname;

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

  return (
    <>
      <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <Container className="header-inner">
          <a
            className="brand"
            href="/"
            aria-label="Uicoding.ai 首页"
            onClick={() => trackClick('header_brand', 'Uicoding.ai', { link_url: '/' })}
          >
            <img className="brand-icon" src="/site-icon.png" alt="" aria-hidden="true" />
            Uicoding.ai
          </a>
          <nav className="main-nav" aria-label="主导航">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <a
                  aria-current={isActive ? 'page' : undefined}
                  className={isActive ? 'is-active' : ''}
                  href={item.href}
                  key={item.href}
                  onClick={() => trackClick('header_nav', item.label, { link_url: item.href })}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="header-actions">
            <Button
              href="/submit"
              icon={Send}
              analyticsEvent={{
                name: 'cta_click',
                params: { area: 'header', label: '提交作品', link_url: '/submit' },
              }}
            >
              提交作品
            </Button>
          </div>
        </Container>
      </header>
      <span aria-hidden="true" className="page-scrollbar" />
    </>
  );
}

export function Footer() {
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
          <p>
            面向设计师、产品经理和独立开发者的 AI 编程学习站，整理真实作品、工具使用技巧和上线经验。
          </p>
        </div>
        <div className="footer-links">
          {footerGroups.map((group) => (
            <div className="footer-group" key={group.title}>
              <h3>{group.title}</h3>
              {group.links.map((link) => (
                <a
                  href={link.href}
                  key={link.label}
                  onClick={() =>
                    trackClick('footer_link', link.label, {
                      group: group.title,
                      link_url: link.href,
                    })
                  }
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </footer>
  );
}
