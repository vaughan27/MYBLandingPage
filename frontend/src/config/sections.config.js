// The whole landing page is driven from this array. To add/remove/reorder a
// section, edit this file only — no other file needs to change.
//
// `component` must match a key registered in `../components/registry.js`.

export const SECTIONS = [
  { id: "hero", enabled: true, component: "Hero" },
  { id: "quickLinks", enabled: true, component: "QuickLinks" },
  { id: "featureTiles", enabled: true, component: "FeatureTiles" },
  { id: "gallery", enabled: true, component: "Gallery" },
  { id: "events", enabled: true, component: "Events" },
  { id: "newsletter", enabled: true, component: "Newsletter" },
  { id: "latestNews", enabled: true, component: "LatestNews" },
];
