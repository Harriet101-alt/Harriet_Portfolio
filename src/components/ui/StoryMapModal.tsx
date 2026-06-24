import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { colors } from '../../styles/colors';

interface StoryMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function StoryMapModal({
  isOpen,
  onClose,
  url,
  title,
}: StoryMapModalProps): ReactElement | null {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      previousActiveElement?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(10, 15, 27, 0.86)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: '85vh',
          background: colors.white,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        className="sm:rounded-xl rounded-none sm:mx-0"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close StoryMap"
          type="button"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: colors.dark[900],
            color: colors.white,
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
        <iframe
          src={url}
          title={title}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="geolocation"
          loading="lazy"
        />
      </div>
    </div>
  );
}
