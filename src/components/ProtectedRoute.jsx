import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

export default function ProtectedRoute({ children, allowedRole }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setUserRole(data?.role);
      }
      setLoading(false);
    }
    getRole();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (userRole !== allowedRole) return <Navigate to="/login" />;

  return children;
}