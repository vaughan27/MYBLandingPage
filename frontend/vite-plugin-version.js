// Stamps every production build with a unique version, in two places:
//   1. baked into the JS bundle as __APP_VERSION__ (what the open tab is running)
//   2. written to dist/version.json (what the server currently has)
// useVersionCheck.js compares the two; a mismatch means a new build was deployed.
export default function versionPlugin() {
  const version = `${Date.now()}`;

  return {
    name: "app-version",
    config() {
      return { define: { __APP_VERSION__: JSON.stringify(version) } };
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ version }),
      });
    },
  };
}
