import './button.css';

export function Button({
  variant = 'primary',
  block = false,
  icon: Icon,
  loading = false,
  loadingText,
  as: Component = 'button',
  type,
  disabled,
  className = '',
  children,
  ...props
}) {
  const isButton = Component === 'button';
  const classes = ['btn', `btn--${variant}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      className={classes}
      {...(isButton && { type: type ?? 'button', disabled: disabled || loading })}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="btn__spinner" aria-hidden="true" />
      ) : (
        Icon && <Icon aria-hidden="true" />
      )}
      {loading && loadingText ? loadingText : children}
    </Component>
  );
}
