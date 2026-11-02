export default function Header({
  theme,
  title,
  subtitle,
  ui,
  onToggleTheme,
  onToggleLang,
  onOpenHelp,
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-ball" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="30" height="30" role="img">
            <circle cx="32" cy="32" r="20" fill="currentColor" opacity=".16" />
            <path
              d="M32 15l7.6 5.5-2.9 8.9h-9.4L24.4 20.5 32 15zm0 34l-7.6-5.5 2.9-8.9h9.4l2.9 8.9L32 49z"
              fill="currentColor"
            />
          </svg>
        </span>
        <div className="brand-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="lang-btn"
          onClick={onToggleLang}
          aria-label={ui.langAria}
          title={ui.langAria}
        >
          {ui.langButton}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={onOpenHelp}
          aria-label={ui.helpAria}
          title={ui.helpAria}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M12 2a10 10 0 100 20 10 10 0 000-20zm.1 15.6a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM12 6.2c2.3 0 3.9 1.4 3.9 3.4 0 1.4-.7 2.2-1.8 3-.9.6-1.2 1-1.2 1.8v.4h-1.9v-.6c0-1.4.5-2.1 1.6-2.9.8-.6 1.2-1 1.2-1.7 0-.9-.7-1.5-1.8-1.5-1 0-1.8.5-2.1 1.4l-1.8-.8c.6-1.6 2-2.5 3.9-2.5z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? ui.themeToLight : ui.themeToDark}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M12 17a5 5 0 100-10 5 5 0 000 10zm0 3v2m0-22v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M2 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M21 13.2A9 9 0 1110.8 3a7 7 0 1010.2 10.2z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
