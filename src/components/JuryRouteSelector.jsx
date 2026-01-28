import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import JuryDashboard from '../pages/Jury/Dashboard';
import PresidentDashboard from '../pages/Jury/PresidentDashboard';

export default function JuryRouteSelector() {
  const [speciality, setSpeciality] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('speciality')
          .eq('id', user.id)
          .single();
        setSpeciality(data?.speciality);
      }
      setLoading(false);
    }
    checkRole();
  }, []);

  if (loading) return null; // Ou un spinner

  // Si la spécialité contient "president", on envoie vers le Dashboard Président
  if (speciality?.includes('president')) {
    return <PresidentDashboard />;
  }

  // Sinon, vers le Dashboard classique
  return <JuryDashboard />;
}