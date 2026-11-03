import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services world — device review',
  description: 'LIONOVART services world responsive and renderer review',
  robots: { index: false, follow: false },
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
