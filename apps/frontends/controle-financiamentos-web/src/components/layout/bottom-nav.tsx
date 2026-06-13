import { NavLink } from 'react-router-dom';
import { appNavItems } from '../../config/nav-items';
import { useTranslation } from '../../i18n/use-translation';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {appNavItems.map(({ to, labelKey, icon: Icon }) => {
          const labelKeyForMobile = labelKey === 'nav.newFinancing' ? 'nav.newFinancingShort' : labelKey;

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-16 flex-col items-center justify-center gap-1 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{t(labelKeyForMobile)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
