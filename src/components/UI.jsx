export function Button({
  children,
  href,
  variant = 'primary',
  icon: Icon,
  className = '',
  ...props
}) {
  const classes = `button button-${variant} ${className}`.trim();
  const content = (
    <>
      {Icon && <Icon size={16} strokeWidth={1.8} aria-hidden="true" />}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {content}
      </a>
    );
  }

  return <button className={classes} {...props}>{content}</button>;
}

export function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Card({ children, className = '', href }) {
  if (href) {
    return (
      <a className={`card ${className}`} href={href}>
        {children}
      </a>
    );
  }

  return <article className={`card ${className}`}>{children}</article>;
}
