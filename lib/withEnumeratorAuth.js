import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';

// Higher-order component for enumerator-protected routes (enumerators and admins can access)
export default function withEnumeratorAuth(Component) {
  const EnumeratorProtectedComponent = (props) => {
    const { isAuthenticated, isAdmin, isEnumerator, role, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      // If auth state is loaded and user is either not authenticated or not enumerator/admin, redirect to home
      if (!loading && (!isAuthenticated || (!isEnumerator && !isAdmin))) {
        router.replace('/');
      }
    }, [isAuthenticated, isAdmin, isEnumerator, loading, router]);
    
    // Show nothing while checking auth status
    if (loading || !isAuthenticated || (!isEnumerator && !isAdmin)) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    // If authenticated and (enumerator or admin), render the protected component
    return <Component {...props} />;
  };
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  EnumeratorProtectedComponent.displayName = `withEnumeratorAuth(${displayName})`;
  
  return EnumeratorProtectedComponent;
}

