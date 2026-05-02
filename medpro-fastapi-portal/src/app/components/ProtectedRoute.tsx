import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** 需要具体角色时传入，不传则只要登录即可 */
  requiredRole?: 'student' | 'teacher' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0B5394] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#64748B] text-sm">正在验证身份…</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
