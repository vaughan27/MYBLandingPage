import { useContent } from "../hooks/useContent";
import { FALLBACK_FEATURE_TILES } from "../config/fallbackContent";
import Icon from "./Icon";

export default function FeatureTiles() {
  const { data: tiles } = useContent(
    "feature-tiles",
    FALLBACK_FEATURE_TILES
  );

  return (
    <section className="feature-tiles manuals-section">
      <div className="container">
        <div className="manuals-header">
          <div>
            <span className="eyebrow">
              MYB KNOWLEDGE CENTRE
            </span>

            <h2 className="section-heading">
              Manuals & Resources
            </h2>

            <p className="title-description">
              Guides, procedures and reference documents for your work.
            </p>
          </div>

          <div className="manuals-count">
            <span>{tiles.length} resources</span>
          </div>
        </div>

        <div className="feature-tiles__grid manuals-grid">
          {tiles.map((tile) => {
            const href = tile.href || "";
            const isPdf = /\.pdf(?:$|[?#])/i.test(href);

            return (
              <a
                key={tile.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="feature-tiles__card manual-card"
              >
                <div className="manual-card__top">
                  <div
                    className={`manual-card__file-icon`}
                  >
                    <Icon
                      name={tile.icon || "file"}
                      size={27}
                    />

                    {isPdf && (
                      <span className="manual-card__pdf-tag">
                        PDF
                      </span>
                    )}
                  </div>
                </div>

                <div className="manual-card__content">
                  <span className="manual-card__title">
                    {tile.title}
                  </span>

                  <span className="manual-card__meta">
                    {isPdf ? "PDF DOCUMENT" : "DOCUMENT & RESOURCE"}
                  </span>
                </div>

              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
