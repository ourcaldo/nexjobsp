import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar',
  description: 'Buat akun Nexjob untuk mulai mencari lowongan kerja terbaik di Indonesia.',
  robots: { index: false, follow: false },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
