import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute rendering...', { user: !!user, loading });

  if (loading) {
    console.log('ProtectedRoute: showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-knumbers-green/10 via-background to-knumbers-purple/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-knumbers-green mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: no user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }
  
  console.log('ProtectedRoute: rendering children');
  return <>{children}</>;
}