import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import './dialog.css';

export function Dialog({ open, onClose, title, description, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector('[data-autofocus]')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {open && (
        <div className="dialog__panel">
          <header className="dialog__header">
            <div className="dialog__heading">
              <h2 id={titleId} className="dialog__title">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="dialog__description">
                  {description}
                </p>
              )}
            </div>
            <button type="button" className="dialog__close" aria-label="Fermer" onClick={onClose}>
              <X aria-hidden="true" />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function DialogFooter({ children }) {
  return <div className="dialog__footer">{children}</div>;
}
