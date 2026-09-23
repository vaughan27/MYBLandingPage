import { useContent } from "../hooks/useContent";
import { FALLBACK_FEATURE_TILES } from "../config/fallbackContent";
import Icon from "./Icon";

export default function FeatureTiles() {
  const { data: tiles } = useContent("feature_tiles_public", FALLBACK_FEATURE_TILES);

  return (
    <section className="feature-tiles">
      <div className="container">
        <h2 className="section-heading">Company systems</h2>
        <div className="feature-tiles__grid">
          {tiles.map((tile) => (
            <a key={tile.id} href={tile.href} className="feature-tiles__card">
              <Icon name={tile.icon} size={26} className="feature-tiles__icon" />
              <span>{tile.title}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
