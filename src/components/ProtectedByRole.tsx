import { useProfile, UserRole } from '@/hooks/useProfile';

interface ProtectedByRoleProps {
  children: React.ReactNode;
  requiredRole: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function ProtectedByRole({ children, requiredRole, fallback = null }: ProtectedByRoleProps) {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
    );
  }

  if (!profile) {
    return <>{fallback}</>;
  }

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Admin has access to everything
  if (profile.role === 'admin') {
    return <>{children}</>;
  }

  // Business has access to personal features too
  if (profile.role === 'business' && (allowedRoles.includes('business') || allowedRoles.includes('personal'))) {
    return <>{children}</>;
  }

  // Personal only has access to personal features
  if (profile.role === 'personal' && allowedRoles.includes('personal')) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}