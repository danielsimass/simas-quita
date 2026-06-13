import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/auth-layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../hooks/use-auth';
import { useTranslation } from '../i18n/use-translation';
import { useToastContext } from '../providers/toast-provider';
import { ApiError } from '../lib/api-client';

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToastContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/app/dashboard';

  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const loggedInUser = await login({ email, password });
      const destination = loggedInUser.profileSetupCompleted ? from : '/app/profile';
      navigate(destination, { replace: true });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t('errors.loginFailed');
      toast({ title: t('auth.loginFailed'), description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.welcomeBack')}
      description={t('auth.signInDescription')}
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('common.email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('common.password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
      </form>
    </AuthLayout>
  );
}
