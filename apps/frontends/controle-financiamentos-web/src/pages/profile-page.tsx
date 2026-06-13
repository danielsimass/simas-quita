import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../hooks/use-auth';
import { useTranslation } from '../i18n/use-translation';
import { ApiError } from '../lib/api-client';
import { useToastContext } from '../providers/toast-provider';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToastContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isFirstSetup = !user?.profileSetupCompleted;

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await updateProfile({
        name,
        email,
        ...(password ? { password } : {}),
      });

      toast({
        title: t('profile.saved'),
        description: isFirstSetup ? t('profile.setupComplete') : undefined,
        variant: 'success',
      });

      if (isFirstSetup) {
        navigate('/app/dashboard', { replace: true });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t('profile.saveFailed');
      toast({ title: t('common.error'), description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{isFirstSetup ? t('profile.setupTitle') : t('profile.editTitle')}</CardTitle>
          <CardDescription>
            {isFirstSetup ? t('profile.setupDescription') : t('profile.editDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">{t('common.name')}</Label>
              <Input
                id="profile-name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">{t('common.email')}</Label>
              <Input
                id="profile-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-password">
                {isFirstSetup ? t('common.password') : t('profile.newPassword')}
              </Label>
              <Input
                id="profile-password"
                type="password"
                autoComplete={isFirstSetup ? 'new-password' : 'new-password'}
                minLength={isFirstSetup ? 8 : undefined}
                required={isFirstSetup}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isFirstSetup ? undefined : t('profile.passwordPlaceholder')}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t('profile.saving') : t('common.save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
