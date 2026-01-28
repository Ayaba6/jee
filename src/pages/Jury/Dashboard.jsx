import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  DocumentTextIcon, 
  PlayCircleIcon, 
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function JuryDashboard() {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [juryProfile, setJuryProfile] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJuryAndData();
  }, []);

  async function fetchJuryAndData() {
    setLoading(true);
    
    // 1. Session Utilisateur
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');

    // 2. Profil Jury
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'jury') return navigate('/login');
    setJuryProfile(profile);

    // Déterminer la catégorie de recherche (enlever le préfixe 'president_' si présent)
    const baseCategory = profile.speciality.replace('president_', '');

    // 3. Récupérer les Candidats + Les évaluations déjà faites par ce jury
    const [candidatsRes, evaluationsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'candidat').eq('competition', baseCategory).order('full_name'),
      supabase.from('evaluations').select('candidat_id').eq('jury_id', user.id) // On suppose que tu as une colonne jury_id
    ]);

    if (!candidatsRes.error) setCandidats(candidatsRes.data);
    if (!evaluationsRes.error) setEvaluations(evaluationsRes.data.map(e => e.candidat_id));
    
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Initialisation de l'espace expert...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* NAVBAR STYLE PREMIUM */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-none">ESPACE <span className="text-indigo-600">JURY</span></h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                {juryProfile?.full_name} {juryProfile?.speciality.includes('president') && "⭐"}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="group flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
            <span>Déconnexion</span>
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        {/* BANDEAU D'INFOS */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic">Candidats <span className="text-indigo-600">JEE 2026</span></h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Catégorie {juryProfile?.speciality.replace('president_', '').replace('_', ' ')}
              </p>
            </div>
            <div className="flex gap-2">
                <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xl font-black text-gray-900 leading-none">{candidats.length}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">Total</p>
                </div>
                <div className="text-center px-4 py-2 bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-xl font-black text-green-600 leading-none">{evaluations.length}</p>
                    <p className="text-[8px] font-bold text-green-500 uppercase">Notés</p>
                </div>
            </div>
          </div>
        </div>

        {/* LISTE DES CANDIDATS */}
        <div className="grid grid-cols-1 gap-4">
          {candidats.map((c) => {
            const isEvaluated = evaluations.includes(c.id);
            return (
              <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg ${isEvaluated ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {c.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{c.full_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {isEvaluated ? (
                        <span className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircleIcon className="h-3 w-3" /> Évalué
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                          <ClockIcon className="h-3 w-3" /> En attente
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8">
                  {/* DOCUMENTS */}
                  <div className="flex gap-3">
                    {c.document_url && (
                      <a href={c.document_url} target="_blank" rel="noreferrer" title="Voir le document" className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                        <DocumentTextIcon className="h-5 w-5" />
                      </a>
                    )}
                    {c.video_url && (
                       <a href={c.video_url} target="_blank" rel="noreferrer" title="Voir la vidéo" className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                        <PlayCircleIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>

                  {/* BOUTON ACTION */}
                  <Link to={`/jury/notation/${c.id}`}>
                    <button className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                      isEvaluated 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-95'
                    }`}>
                      {isEvaluated ? 'Modifier' : 'Noter le candidat'}
                    </button>
                  </Link>
                </div>

              </div>
            );
          })}

          {candidats.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-gray-400">
               <p className="font-black uppercase tracking-widest text-[10px]">Aucun candidat dans votre section</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}