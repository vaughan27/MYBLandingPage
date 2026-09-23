import { useContent } from "../hooks/useContent";
import { FALLBACK_QUICK_LINKS } from "../config/fallbackContent";
import Icon from "./Icon";

export default function QuickLinks() {
  const { data: links } = useContent("quick_links_public", FALLBACK_QUICK_LINKS);

  return (
    <section className="quick-links">
      <div className="container quick-links__row">
        {links.map((link) => (
          <a key={link.id} href={link.href} className="quick-links__item">
            <Icon name={link.icon} size={18} />
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
