import type { Metadata } from 'next';
import { SupabaseAdminService } from '@/services/supabaseAdminService';
import { getCurrentDomain } from '@/lib/env';
import { renderTemplate } from '@/utils/templateUtils';
import SignupPage from '@/components/pages/SignupPage';

async function getSignupData() {
  const settings = await SupabaseAdminService.getSettingsServerSide();
  return { settings };
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSignupData();
  const currentUrl = getCurrentDomain();

  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
  };

  const rawTitle = settings?.signup_page_title || 'Sign Up - {{site_title}}';
  const rawDescription = settings?.signup_page_description || 'Create your account';

  const pageTitle = renderTemplate(rawTitle, templateVars);
  const pageDescription = renderTemplate(rawDescription, templateVars);

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: `${currentUrl}/signup/`,
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description: pageDescription,
    },
    alternates: {
      canonical: `${currentUrl}/signup/`,
    },
  };
}

export default async function Signup() {
  const { settings } = await getSignupData();

  return <SignupPage settings={settings} />;
}
