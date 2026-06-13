import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useTranslation } from '../i18n/use-translation';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold">{t('notFound.title')}</h1>
      <p className="text-muted-foreground">{t('notFound.description')}</p>
      <Button asChild>
        <Link to="/app/dashboard">{t('notFound.goToDashboard')}</Link>
      </Button>
    </div>
  );
}
