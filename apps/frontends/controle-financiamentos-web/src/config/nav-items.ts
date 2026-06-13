import {
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  PlusCircle,
  User,
  type LucideIcon,
} from 'lucide-react';

export type AppNavItem = {
  to: string;
  labelKey:
    | 'nav.dashboard'
    | 'nav.installments'
    | 'nav.prepayments'
    | 'nav.newFinancing'
    | 'nav.newFinancingShort'
    | 'nav.profile';
  icon: LucideIcon;
};

export const appNavItems: AppNavItem[] = [
  { to: '/app/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/app/installments', labelKey: 'nav.installments', icon: CreditCard },
  { to: '/app/prepayments', labelKey: 'nav.prepayments', icon: PiggyBank },
  { to: '/app/financings/new', labelKey: 'nav.newFinancing', icon: PlusCircle },
  { to: '/app/profile', labelKey: 'nav.profile', icon: User },
];
