import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { footerGroups, navItems } from '../data.js';
import { Button } from './UI.jsx';

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
              <a className="section-more" href={actionHref}>
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
  const pathname = window.location.pathname;

  useEffect(() => {
    const updateScrolled = () => {
      setIsScrolled(window.scrollY > 12);
    };

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });

    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  return (
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <Container className="header-inner">
        <a className="brand" href="/" aria-label="Uicoding.ai 首页">
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
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="header-actions">
          <Button href="/submit" icon={Send}>
            提交作品
          </Button>
        </div>
      </Container>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <Container className="footer-inner">
        <div className="footer-brand">
          <a className="brand" href="/">
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
                <a href={link.href} key={link.label}>
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
