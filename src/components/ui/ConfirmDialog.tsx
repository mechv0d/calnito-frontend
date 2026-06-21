interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div className="modal modal--confirm" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="confirm-dialog">
          <div>
            <p className="eyebrow">Подтверждение</p>
            <h2>{title}</h2>
            {description ? <p className="muted">{description}</p> : null}
          </div>
          <div className="modal-actions">
            <button className="button button--ghost" type="button" onClick={onCancel} disabled={loading}>{cancelText}</button>
            <button className={danger ? 'button button--danger' : 'button button--primary'} type="button" onClick={onConfirm} disabled={loading}>
              {loading ? 'Подождите...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
