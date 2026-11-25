import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  /** Style du bouton de confirmation : "danger" pour une action irréversible */
  tone?: 'danger' | 'default';
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Boîte de confirmation (même style que la modale de connexion). */
export function ConfirmDialog({ title, children, confirmLabel, tone = 'default', pending, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="login-modal glass confirm-modal"
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) onCancel();
      }}
    >
      <h2 id="confirm-title">{title}</h2>
      <div className="confirm-body">{children}</div>
      <div className="login-actions">
        <button type="button" className="btn ghost" onClick={onCancel} disabled={pending} autoFocus>
          Annuler
        </button>
        <button type="button" className={`btn ${tone === 'danger' ? 'danger' : ''}`} onClick={onConfirm} disabled={pending}>
          {pending ? 'Un instant…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
