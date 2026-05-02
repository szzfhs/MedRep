import { Outlet, useLocation } from 'react-router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  const location = useLocation();

  // Pages that shouldn't show footer (like learning pages)
  const noFooterPages = ['/learn'];
  const showFooter = !noFooterPages.some((p) => location.pathname.includes(p));

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F8]">
      <Navbar />
      <main className="flex-1 pt-[65px]">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
