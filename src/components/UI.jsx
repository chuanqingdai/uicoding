import { trackEvent } from '../lib/analytics.js';

export function Button({
  analyticsEvent,
  children,
  href,
  variant = 'primary',
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const classes = `button button-${variant} ${className}`.trim();
  const handleClick = (event) => {
    if (analyticsEvent) {
      trackEvent(analyticsEvent.name, analyticsEvent.params);
    }

    onClick?.(event);
  };
  const content = (
    <>
      {Icon && <Icon size={16} strokeWidth={1.8} aria-hidden="true" />}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <a className={classes} href={href} onClick={handleClick} {...props}>
        {content}
      </a>
    );
  }

  return <button className={classes} onClick={handleClick} {...props}>{content}</button>;
}

export function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Card({ analyticsEvent, children, className = '', href, onClick, ...props }) {
  const handleClick = (event) => {
    if (analyticsEvent) {
      trackEvent(analyticsEvent.name, analyticsEvent.params);
    }

    onClick?.(event);
  };

  if (href) {
    return (
      <a className={`card ${className}`} href={href} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  }

  return <article className={`card ${className}`} onClick={handleClick} {...props}>{children}</article>;
}
