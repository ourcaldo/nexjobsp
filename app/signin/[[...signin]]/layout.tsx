import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke akun Nexjob Anda untuk mengakses fitur lengkap pencarian kerja.',
  robots: { index: false, follow: false },
};

export default function SigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
