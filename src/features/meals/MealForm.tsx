import { FormEvent, useEffect, useMemo, useState } from 'react';

import { AddIcon } from '../../components/icons/AddIcon';
import { SendIcon } from '../../components/icons/SendIcon';

interface MealFormProps {
  loading: boolean;
  onSubmit: (description: string, photo: File | null) => Promise<void>;
}


export function MealForm({ loading, onSubmit }: MealFormProps) {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(description.trim(), photo);
    setDescription('');
    setPhoto(null);
  };

  return (
    <section className="meal-composer-card" aria-label="Добавление приема пищи">
      <form className="meal-composer" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="meal-description">Что съел</label>
        <textarea
          id="meal-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Что сегодня было на тарелке?"
          minLength={1}
          maxLength={2000}
          rows={3}
          required
        />

        <div className="meal-composer__footer">
          <div className="meal-composer__tools">
            <label
              className="file-input file-input--compact tooltip-host"
              data-tooltip={photo ? 'Выбрать другое фото' : 'Приложить фото еды'}
              aria-label={photo ? 'Выбрать другое фото' : 'Приложить фото еды'}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
              <span className="icon-button icon-button--photo">
                <AddIcon />
              </span>
            </label>
            {photo ? <button className="tool-button" type="button" onClick={() => setPhoto(null)}>убрать</button> : null}
          </div>

          <button className="button button--primary meal-composer__submit" disabled={loading || !description.trim()}>
            {loading ? 'Сохраняем...' : <SendIcon />}
          </button>
        </div>

        {previewUrl ? (
          <div className="composer-preview">
            <img className="photo-preview" src={previewUrl} alt="Предпросмотр еды" />
            <span>{photo?.name}</span>
          </div>
        ) : null}
      </form>
    </section>
  );
}
