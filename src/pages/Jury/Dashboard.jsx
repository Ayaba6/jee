import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  DocumentTextIcon, 
  PlayCircleIcon, 
  StarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function JuryDashboard() {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [juryProfile, setJuryProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJuryAndCandidats();
  }, []);

  async function fetchJuryAndCandidats() {
    setLoading(true);
    
    // 1. Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');

    // 2. Récupérer le profil du jury pour connaître sa spécialité
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, speciality')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'jury') {
      console.error("Accès non autorisé");
      return navigate('/login');
    }

    setJuryProfile(profile);

    // 3. Récupérer uniquement les candidats de SA spécialité
    const { data: candidatsData, error: candidatsError } = await supabase
      .from('profiles')
      .select('id, full_name, competition, document_url, video_url')
      .eq('role', 'candidat')
      .eq('competition', profile.speciality) // FILTRE STRICT ICI
      .order('full_name', { ascending: true });

    if (!candidatsError) setCandidats(candidatsData);
    
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Jury <span className="text-indigo-600">JEE 2026</span></h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Expert : {juryProfile?.full_name}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition">
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-10">
        {/* BADGE DE CATÉGORIE ACTIVE */}
        <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Candidats à évaluer</h2>
            <p className="text-sm text-gray-500 font-medium">
              Liste exclusive pour la catégorie <span className="text-indigo-600 font-bold uppercase">{juryProfile?.speciality?.replace('_', ' ')}</span>
            </p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl font-black text-xl">
            {candidats.length}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidat</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ressources</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Évaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {candidats.map((c) => (
                <tr key={c.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-gray-900 text-lg">{c.full_name}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-4">
                      {c.document_url && (
                        <a href={c.document_url} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
                          <DocumentTextIcon className="h-5 w-5" />
                        </a>
                      )}
                      {Array.isArray(c.video_url) && c.video_url.length > 0 && (
                        <div className="flex items-center gap-1 p-2 bg-rose-50 text-rose-600 rounded-lg">
                          <PlayCircleIcon className="h-5 w-5" />
                          <span className="text-xs font-black">{c.video_url.length}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link to={`/jury/notation/${c.id}`}>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95">
                        Évaluer
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {candidats.length === 0 && (
            <div className="py-20 text-center italic text-gray-400 font-medium">
              Aucun candidat disponible pour cette catégorie.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}