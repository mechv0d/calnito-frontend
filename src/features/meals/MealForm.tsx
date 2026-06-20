import { type DragEvent, type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AddIcon } from '../../components/icons/AddIcon';
import { SendIcon } from '../../components/icons/SendIcon';
import { Loader2, X } from 'lucide-react';

interface MealFormProps {
  loading: boolean;
  onSubmit: (description: string, photos: File[]) => Promise<void>;
}

const maxPhotos = 3;
const supportedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getSupportedPhotos(files: FileList | File[] | null | undefined): File[] {
  if (!files) return [];
  return Array.from(files).filter((file) => supportedPhotoTypes.has(file.type));
}

export function MealForm({ loading, onSubmit }: MealFormProps) {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isPhotoDragActive, setIsPhotoDragActive] = useState(false);
  const dragDepth = useRef(0);

  const previewUrls = useMemo(() => photos.map((photo) => URL.createObjectURL(photo)), [photos]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, [previewUrls]);

  const selectPhotos = useCallback((files: FileList | File[] | null | undefined) => {
    const nextPhotos = getSupportedPhotos(files);
    if (!nextPhotos.length) return false;
    setPhotos((currentPhotos) => [...currentPhotos, ...nextPhotos].slice(0, maxPhotos));
    setActivePhotoIndex(null);
    return true;
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (photos.length >= maxPhotos || !selectPhotos(event.clipboardData?.files)) return;
      event.preventDefault();
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [photos.length, selectPhotos]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(description.trim(), photos);
    setDescription('');
    setPhotos([]);
    setActivePhotoIndex(null);
  };

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    dragDepth.current += 1;
    setIsPhotoDragActive(true);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsPhotoDragActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    dragDepth.current = 0;
    setIsPhotoDragActive(false);
    if (photos.length < maxPhotos) selectPhotos(event.dataTransfer.files);
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((currentPhotos) => currentPhotos.filter((_, index) => index !== indexToRemove));
    setActivePhotoIndex(null);
  };

  return (
    <section className="meal-composer-card" aria-label="Добавление приема пищи">
      <form
        className={`meal-composer${isPhotoDragActive ? ' meal-composer--drag-active' : ''}`}
        onSubmit={handleSubmit}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
              data-tooltip={photos.length >= maxPhotos ? 'Максимум 3 фото' : 'Приложить фото еды'}
              aria-label={photos.length >= maxPhotos ? 'Максимум 3 фото' : 'Приложить фото еды'}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={photos.length >= maxPhotos}
                onChange={(e) => {
                  selectPhotos(e.target.files);
                  e.currentTarget.value = '';
                }}
              />
              <span className="icon-button icon-button--photo" aria-disabled={photos.length >= maxPhotos}>
                <AddIcon />
              </span>
            </label>

            {previewUrls.map((previewUrl, index) => (
              <div
                className={`composer-photo-chip${activePhotoIndex === index ? ' composer-photo-chip--remove-visible' : ''}`}
                key={`${photos[index].name}-${photos[index].lastModified}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => setActivePhotoIndex(index)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  setActivePhotoIndex(index);
                }}
                aria-label={`Показать удаление фото ${photos[index].name}`}
              >
                <img className="composer-photo-chip__image" src={previewUrl} alt={photos[index].name} />
                <button
                  className="composer-photo-chip__remove"
                  type="button"
                  aria-label={`Удалить фото ${photos[index].name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemovePhoto(index);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          <button className="button button--primary meal-composer__submit" disabled={loading || !description.trim()}>
            {loading ? <Loader2 className="spinner-icon" /> : <SendIcon />}
          </button>
        </div>
      </form>
    </section>
  );
}
