import MoonIcon from './MoonIcon';
import SunIcon from './SunIcon';
import './styles.module.css';

interface ThemeToggleProps {
  theme: boolean;
  onClick: () => void;
  size?: number;
  shouldScaleOnHover?: boolean;
  className?: string;
}

function ThemeToggle({ theme, onClick, size, shouldScaleOnHover, className }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus:outline-none transition duration-300 ease-in-out ${
        shouldScaleOnHover ? 'transform hover:scale-110' : ''
      } ${className || ''}`}
    >
      {theme ? <MoonIcon size={size} /> : <SunIcon size={size} />}
    </button>
  );
}

export default ThemeToggle;
