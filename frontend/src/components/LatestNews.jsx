import { useContent } from "../hooks/useContent";
import { FALLBACK_NEWS } from "../config/fallbackContent";

export default function LatestNews() {
  const { data: news } = useContent("news", FALLBACK_NEWS);

  return (
    <section className="latest-news">
      <div className="container">
        <span className="eyebrow">
          MYB UPDATES
        </span>
        <h2 className="section-heading">Latest news</h2>
        <p className="title-description">
          Get a scoop of the latest and most exciting happenings of the company.
        </p>
        <ul className="latest-news__list">
          {news.slice().reverse().map((item) => (
            <li key={item.id}>
              <a href={item.url || "#"} target="_blank">{item.title}</a>
              {item.summary && <p>{item.summary}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
