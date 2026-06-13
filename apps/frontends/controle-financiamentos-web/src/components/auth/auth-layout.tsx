import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../layout/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footerText?: string;
  footerLink?: string;
  footerLinkLabel?: string;
};

export function AuthLayout({
  title,
  description,
  children,
  footerText,
  footerLink,
  footerLinkLabel,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
        {footerText && footerLink && footerLinkLabel ? (
          <p className="pb-6 text-center text-sm text-muted-foreground">
            {footerText}{' '}
            <Link to={footerLink} className="font-medium text-primary hover:underline">
              {footerLinkLabel}
            </Link>
          </p>
        ) : null}
      </Card>
    </div>
  );
}
