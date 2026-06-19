interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <strong>Ошибка</strong>
      <p>{message}</p>
      {onRetry ? <button className="button button--secondary" onClick={onRetry}>Повторить</button> : null}
    </div>
  );
}
