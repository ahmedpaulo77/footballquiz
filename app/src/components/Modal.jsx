import { useEffect } from 'react';

export default function Modal({
  open,
  title,
  onClose,
  children,
  className = '',
  closeLabel = 'Close',
  hideClose = false,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose?.();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className={`modal ${className}`}>
        {hideClose ? null : (
          <button type="button" className="modal-close" onClick={onClose} aria-label={closeLabel}>
            ✕
          </button>
        )}
        {title ? <h2 className="modal-title">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
