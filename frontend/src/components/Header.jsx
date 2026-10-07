import { useEffect, useState } from "react";
import SearchModal from "./SearchModal";
import WhatsNewModal from "./WhatsNewModal";
import { useWhatsNewUnread } from "../hooks/useWhatsNewUnread";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const { hasUnread, markSeen } = useWhatsNewUnread();

  useEffect(() => {
    if (hasUnread) {
      setWhatsNewOpen(true);
      markSeen();
    }
  }, [hasUnread, markSeen]);

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
          <button
            type="button"
            className="site-header__icon-btn"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
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
          </button>

          <button
            type="button"
            className="site-header__whats-new"
            onClick={() => {
              setWhatsNewOpen(true);
              // markSeen(); // clears the badge the moment it's opened, not on close
            }}
          >
            <span className="site-header__whats-new-star">✦</span>
            What's New
            {/* {hasUnread && (
              <span className="site-header__whats-new-badge" aria-hidden="true" />
            )} */}
          </button>
        </nav>
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      {whatsNewOpen && <WhatsNewModal onClose={() => setWhatsNewOpen(false)} />}
    </header>
  );
}
