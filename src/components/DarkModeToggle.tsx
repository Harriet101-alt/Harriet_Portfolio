import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface DarkModeToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ checked, onChange }) => {
  const handleClick = () => {
    onChange(!checked);
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleClick}
      type="button"
      aria-label={`Switch to ${checked ? 'light' : 'dark'} mode`}
      aria-pressed={checked}
      title={`Switch to ${checked ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__horizon" />
        <span className="theme-toggle__celestial">
          <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={18} strokeWidth={2.2} />
          <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={18} strokeWidth={2.2} />
        </span>
      </span>
    </button>
  );
};

export default DarkModeToggle;