import { Outlet } from 'react-router-dom';
import type { RootLayoutProps } from './types';

export const RootLayout = (props: RootLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};
