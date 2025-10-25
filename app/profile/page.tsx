import type { Metadata } from 'next';
import { SupabaseAdminService } from '@/services/supabaseAdminService';
import { getCurrentDomain } from '@/lib/env';
import { renderTemplate } from '@/utils/templateUtils';
import ProfilePage from '@/components/pages/ProfilePage';

async function getProfileData() {
  const settings = await SupabaseAdminService.getSettingsServerSide();
  return { settings };
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getProfileData();
  const currentUrl = getCurrentDomain();

  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
  };

  const rawTitle = settings?.profile_page_title || 'Profile - {{site_title}}';
  const rawDescription = settings?.profile_page_description || 'Manage your profile';

  const pageTitle = renderTemplate(rawTitle, templateVars);
  const pageDescription = renderTemplate(rawDescription, templateVars);

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: `${currentUrl}/profile/`,
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description: pageDescription,
    },
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `${currentUrl}/profile/`,
    },
  };
}

export default async function Profile() {
  const { settings } = await getProfileData();

  return <ProfilePage settings={settings} />;
}
