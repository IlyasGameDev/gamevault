import type { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'Profile',
  robots: {
    index: false,
    follow: true,
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
