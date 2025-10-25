import type { Metadata } from 'next';
import { SupabaseAdminService } from '@/services/supabaseAdminService';
import { getCurrentDomain } from '@/lib/env';
import { renderTemplate } from '@/utils/templateUtils';
import LoginPage from '@/components/pages/LoginPage';

async function getLoginData() {
  const settings = await SupabaseAdminService.getSettingsServerSide();
  return { settings };
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getLoginData();
  const currentUrl = getCurrentDomain();

  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
  };

  const rawTitle = settings?.login_page_title || 'Login - {{site_title}}';
  const rawDescription = settings?.login_page_description || 'Login to your account';

  const pageTitle = renderTemplate(rawTitle, templateVars);
  const pageDescription = renderTemplate(rawDescription, templateVars);

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: `${currentUrl}/login/`,
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description: pageDescription,
    },
    alternates: {
      canonical: `${currentUrl}/login/`,
    },
  };
}

export default async function Login() {
  const { settings } = await getLoginData();

  return <LoginPage settings={settings} />;
}
