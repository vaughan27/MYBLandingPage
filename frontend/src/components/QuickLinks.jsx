import { useContent } from "../hooks/useContent";
import { FALLBACK_QUICK_LINKS } from "../config/fallbackContent";
import Icon from "./Icon";

export default function QuickLinks() {
  const { data: links } = useContent(
    "quick-links",
    FALLBACK_QUICK_LINKS
  );

  return (
    <section className="quick-links">
      <div className="container">
        <span className="eyebrow">
          MYB SYSTEMS
        </span>
        <h2 className="section-heading">Company systems</h2>
        <p className="title-description">
          Software to achieve maximum productivity in your work.
        </p>
        
        <div className="feature-tiles__grid">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="feature-tiles__card quick-links__card"
            >
              <Icon
                name={link.icon}
                size={32}
                className="quick-links__icon"
              />

              <span className="quick-links__label">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
