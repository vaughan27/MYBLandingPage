import { useContent } from "../hooks/useContent";
import { FALLBACK_EVENTS } from "../config/fallbackContent";
import Icon from "./Icon";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Events() {
  const { data: events } = useContent("events_public", FALLBACK_EVENTS);

  return (
    <section className="events">
      <div className="container">
        <h2 className="section-heading">Upcoming events</h2>
        <ol className="events__list">
          {events.map((event) => (
            <li key={event.id} className="events__item">
              <span className="events__date">{formatDate(event.starts_at)}</span>
              <div>
                <h3 className="events__title">{event.title}</h3>
                {event.description && <p>{event.description}</p>}
                {event.location && (
                  <p className="events__location">
                    <Icon name="pin" size={14} /> {event.location}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
