import Header from "./components/Header";
import Footer from "./components/Footer";
import { SECTIONS } from "./config/sections.config";
import { COMPONENT_REGISTRY } from "./components/registry";
import { useAnalytics } from "./hooks/useAnalytics";
import { DASHBOARD_PATH } from "./config/dashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

export default function App() {
  useAnalytics();

  // No router library — this is a single-page landing site plus one hidden
  // path. A simple pathname check is enough and avoids pulling in a router
  // for what is otherwise a static page. Swap in react-router if the site
  // grows more routes later.
  if (window.location.pathname === DASHBOARD_PATH) {
    return <AnalyticsDashboard />;
  }

  return (
    <>
      <Header />
      <main>
        {SECTIONS.filter((s) => s.enabled).map((section) => {
          const Component = COMPONENT_REGISTRY[section.component];
          if (!Component) return null;
          return <Component key={section.id} />;
        })}
      </main>
      <Footer />
    </>
  );
}
