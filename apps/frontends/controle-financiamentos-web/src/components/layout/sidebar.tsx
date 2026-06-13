import {
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { appNavItems } from '../../config/nav-items';
import { useAuth } from '../../hooks/use-auth';
import { useTranslation } from '../../i18n/use-translation';
import { cn } from '../../lib/utils';
import { ThemeToggle } from './theme-toggle';
import { Button } from '../ui/button';
import { FinancingSelector } from '../financing/financing-selector';

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        'hidden h-screen flex-col border-r bg-card transition-all duration-300 md:flex',
        collapsed ? 'w-20' : 'w-72',
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        {!collapsed ? (
          <div>
            <p className="text-sm font-semibold">Controle Financiamentos</p>
            <p className="truncate text-xs text-muted-foreground">{user?.name}</p>
          </div>
        ) : null}
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} aria-label={t('nav.toggleSidebar')}>
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {!collapsed ? (
        <div className="border-b p-4">
          <FinancingSelector />
        </div>
      ) : null}

      <nav className="flex-1 space-y-1 p-2">
        {appNavItems.map(({ to, labelKey, icon: Icon }) => {
          const label = t(labelKey);

          return (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center px-0',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed ? <span>{label}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      <div className={cn('flex items-center gap-2 border-t p-4', collapsed && 'flex-col')}>
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label={t('nav.logout')}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  );
}
