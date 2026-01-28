import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  UserGroupIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function PresidentDashboard() {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [juryProfile, setJuryProfile] = useState(null);
  const [allEvaluations, setAllEvaluations] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null); // Pour la modale vidéo
  const navigate = useNavigate();

  useEffect(() => {
    fetchPresidentData();
  }, []);

  async function fetchPresidentData() {
    if (!refreshing) setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile || !profile.speciality.includes('president')) return navigate('/jury');
    setJuryProfile(profile);

    const baseCategory = profile.speciality.replace('president_', '');

    const [candRes, evalRes] = await Promise.all([
      supabase.from('profiles')
        .select('*')
        .eq('role', 'candidat')
        .eq('competition', baseCategory)
        .order('full_name'),
      supabase.from('evaluations')
        .select(`*, jury:profiles!jury_id(full_name)`)
    ]);

    const candidateIds = candRes.data?.map(c => c.id) || [];
    const relevantEvals = evalRes.data?.filter(e => candidateIds.includes(e.candidat_id)) || [];

    setCandidats(candRes.data || []);
    setAllEvaluations(relevantEvals);
    setLoading(false);
    setRefreshing(false);
  }

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchPresidentData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Synchronisation présidentielle...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      
      {/* --- MODALE VIDÉO --- */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10">
          <button 
            onClick={() => setActiveVideo(null)}
            className="absolute top-6 right-6 text-white hover:text-amber-400 transition-colors z-[110]"
          >
            <XMarkIcon className="h-10 w-10" />
          </button>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <video 
              src={activeVideo} 
              controls 
              autoPlay 
              className="w-full h-full"
            />
          </div>
          {/* Fermeture au clic sur l'arrière-plan */}
          <div className="absolute inset-0 -z-10" onClick={() => setActiveVideo(null)}></div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="bg-gray-900 sticky top-0 z-30 px-6 h-24 flex items-center justify-between shadow-2xl rounded-b-[2rem]">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 p-2.5 rounded-2xl text-gray-900 shadow-lg">
            <ShieldCheckIcon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white text-xl font-black uppercase italic tracking-tighter leading-none">
                Console <span className="text-amber-400">Président</span>
              </h1>
              <button onClick={handleManualRefresh} className={`p-1 transition-all ${refreshing ? 'animate-spin' : 'hover:rotate-180'}`}>
                <ArrowPathIcon className="h-4 w-4 text-amber-400/50" />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
              Catégorie : {juryProfile?.speciality.replace('president_', '').toUpperCase()}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-red-400 transition-all active:scale-90">
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 gap-8">
          {candidats.map((c) => {
            const myNote = allEvaluations.find(e => e.candidat_id === c.id && e.jury_id === juryProfile.id);
            const othersNotes = allEvaluations.filter(e => e.candidat_id === c.id && e.jury_id !== juryProfile.id);
            const allNotes = allEvaluations.filter(e => e.candidat_id === c.id);
            const moyenne = allNotes.length > 0 ? allNotes.reduce((acc, curr) => acc + curr.total_score, 0) / allNotes.length : 0;

            return (
              <div key={c.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-100/50">
                <div className="p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  
                  {/* IDENTITÉ */}
                  <div className="flex items-center gap-6">
                    <div className={`h-16 w-16 rounded-[2rem] flex items-center justify-center font-black text-2xl shadow-inner ${myNote ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
                      {c.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-2xl uppercase tracking-tight leading-none mb-2">{c.full_name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {myNote ? (
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">Ma note : {myNote.total_score}/30</span>
                        ) : (
                          <span className="text-[9px] font-black bg-rose-100 text-rose-500 px-3 py-1 rounded-full uppercase animate-pulse">Ma note : En attente</span>
                        )}
                        <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                          <UserGroupIcon className="h-3 w-3" /> {othersNotes.length} Experts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SUPERVISION EXPERTS */}
                  <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-[2rem] border border-gray-100 min-w-[200px] justify-center">
                    {othersNotes.length > 0 ? (
                      othersNotes.map((note, idx) => (
                        <div key={idx} className="group relative flex flex-col items-center">
                          <div className="h-12 w-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:border-indigo-400 transition-all cursor-help">
                            <span className="text-xs font-black text-gray-800">{note.total_score}</span>
                          </div>
                          <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-gray-900 text-white text-[8px] px-2 py-1 rounded-lg z-50">
                            {note.jury?.full_name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[9px] font-bold text-gray-300 uppercase italic">En attente des experts</p>
                    )}
                  </div>

                  {/* ACTIONS MÉDIAS & VOTE */}
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    {/* Ouvrir le document (PDF) sans télécharger */}
                    {c.document_url && (
                      <a 
                        href={`${c.document_url}#toolbar=0`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-4 bg-gray-900 text-amber-400 rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center"
                        title="Visionner le document"
                      >
                        <DocumentTextIcon className="h-6 w-6" />
                      </a>
                    )}
                    
                    {/* Lire la vidéo dans la modale */}
                    {c.video_url && (
                      <button 
                        onClick={() => setActiveVideo(c.video_url)}
                        className="p-4 bg-amber-400 text-gray-900 rounded-2xl hover:bg-amber-500 transition-all flex items-center justify-center shadow-lg shadow-amber-100"
                        title="Visionner la vidéo"
                      >
                        <PlayIcon className="h-6 w-6 fill-current" />
                      </button>
                    )}

                    <Link to={`/jury/notation/${c.id}`} className="flex-1 lg:flex-none">
                      <button className={`w-full px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all ${
                        myNote ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
                      }`}>
                        {myNote ? 'Réviser' : 'Noter'}
                      </button>
                    </Link>
                  </div>
                </div>

                {/* MOYENNE */}
                <div className="bg-indigo-50/50 px-8 py-5 flex flex-col sm:flex-row items-center justify-between border-t border-indigo-50 gap-4">
                  <div className="flex items-center gap-3 text-indigo-900/40">
                    <ChartBarIcon className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Score Moyen Final</span>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="flex-1 sm:w-48 h-3 bg-white rounded-full overflow-hidden border border-indigo-100 p-[2px]">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-1000" style={{ width: `${(moyenne / 30) * 100}%` }}></div>
                    </div>
                    <div className="flex items-baseline gap-1 bg-white px-4 py-1 rounded-xl border border-indigo-100 shadow-sm">
                      <span className="text-xl font-black text-indigo-600">{moyenne.toFixed(2)}</span>
                      <span className="text-[10px] font-bold text-indigo-300">/30</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}