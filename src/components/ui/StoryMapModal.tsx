import { useEffect } from 'react';
import type { ReactElement } from 'react';

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
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
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
        background: 'rgba(10, 10, 20, 0.85)',
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
          background: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        className="sm:rounded-xl rounded-none sm:mx-0"
      >
        <button
          onClick={onClose}
          aria-label="Close StoryMap"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
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
