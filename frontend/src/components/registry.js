import Hero from "./Hero";
import QuickLinks from "./QuickLinks";
import FeatureTiles from "./FeatureTiles";
import Gallery from "./Gallery";
import Events from "./Events";
import Newsletter from "./Newsletter";
import LatestNews from "./LatestNews";

// Register any new section component here, then reference its key in
// sections.config.js. This indirection is what lets the config file stay
// plain data (serializable, could even come from an API later).
export const COMPONENT_REGISTRY = {
  Hero,
  QuickLinks,
  FeatureTiles,
  Gallery,
  Events,
  Newsletter,
  LatestNews,
};
