import Modal from "./Modal";
import { useContent } from "../hooks/useContent";
import { FALLBACK_WHATS_NEW } from "../config/fallbackContent";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WhatsNewModal({ onClose }) {
  const { data: items } = useContent("whats-new", FALLBACK_WHATS_NEW);

  return (
    <Modal open onClose={onClose} title="What's New">
      {items.length === 0 ? (
        <p>Nothing new right now.</p>
      ) : (
        <ul className="whats-new-modal__list">
          {items.map((item) => (
            <li key={item.id}>
              <div className="whats-new-modal__item-head">
                <h3>{item.title}</h3>
                {item.published_at && (
                  <span className="whats-new-modal__date">
                    {formatDate(item.published_at)}
                  </span>
                )}
              </div>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
