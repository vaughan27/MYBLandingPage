import { useEffect, useRef } from "react";

/**
 * Generic modal shell — not tied to What's New or Search specifically.
 * Handles the boring parts (overlay click, Escape key, focus on open) so
 * new modals just supply `title` and children.
 *
 * Usage:
 *   <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Something">
 *     ...your content...
 *   </Modal>
 */
export default function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    // move focus into the dialog so screen readers/keyboard users land here
    dialogRef.current?.focus();

    // prevent background scroll while a modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
