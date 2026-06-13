import { Moon, Sun } from 'lucide-react';
import { useTranslation } from '../../i18n/use-translation';
import { useTheme } from '../../providers/theme-provider';
import { Button } from '../ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}
