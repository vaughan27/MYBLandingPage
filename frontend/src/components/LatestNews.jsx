import { useContent } from "../hooks/useContent";
import { FALLBACK_NEWS } from "../config/fallbackContent";

export default function LatestNews() {
  const { data: news } = useContent("news_items_public", FALLBACK_NEWS);

  return (
    <section className="latest-news">
      <div className="container">
        <h2 className="section-heading">Latest news</h2>
        <ul className="latest-news__list">
          {news.map((item) => (
            <li key={item.id}>
              <a href={item.url || "#"}>{item.title}</a>
              {item.summary && <p>{item.summary}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
