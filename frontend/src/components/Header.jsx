function TwinPeakMark() {
  return (
    <img
      src={"/assets/new-logo.svg"}
      alt="Morad Yousuf Behbehani"
      className="site-header__logo"
    />
  );
}

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__row">
        <a href="/" className="site-header__brand">
          <TwinPeakMark />
          <div className="site-header__brand-text">
            <strong>Morad Yousuf Behbehani</strong>
            <span>Since 1935</span>
          </div>
        </a>

        <nav className="site-header__utility" aria-label="Utility links">
          <a href="/search" aria-label="Search">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path
                d="m20 20-3.5-3.5"
                strokeLinecap="round"
              />
            </svg>
          </a>

          <a href="/whats-new" className="site-header__whats-new">
            <span className="site-header__whats-new-star">✦</span>            
            What's New
          </a>
        </nav>
      </div>
    </header>
  );
}
