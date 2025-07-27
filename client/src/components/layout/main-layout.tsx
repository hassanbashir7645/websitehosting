import { ReactNode } from 'react';
import Sidebar from './sidebar';
import Header from './header';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
