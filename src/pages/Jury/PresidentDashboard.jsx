import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  PlayCircleIcon, 
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function PresidentDashboard() {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [juryProfile, setJuryProfile] = useState(null);
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [allEvaluations, setAllEvaluations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPresidentData();
  }, []);

  async function fetchPresidentData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile || !profile.speciality.includes('president')) return navigate('/jury');
    setJuryProfile(profile);

    const baseCategory = profile.speciality.replace('president_', '');

    // Récupérer Candidats + Mes notes + TOUTES les notes de la catégorie
    const [candRes, myEvalRes, allEvalRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'candidat').eq('competition', baseCategory).order('full_name'),
      supabase.from('evaluations').select('candidat_id').eq('jury_id', user.id),
      supabase.from('evaluations').select('*, jury:profiles(full_name)').neq('jury_id', user.id) // Notes des autres
    ]);

    setCandidats(candRes.data || []);
    setMyEvaluations(myEvalRes.data?.map(e => e.candidat_id) || []);
    setAllEvaluations(allEvalRes.data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* NAVBAR PRÉSIDENTIELLE */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30 px-6 h-20 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 p-2.5 rounded-2xl text-gray-900 shadow-lg shadow-amber-400/20">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase italic tracking-tighter">
              Présidence <span className="text-amber-400">{juryProfile?.speciality.replace('president_', '').toUpperCase()}</span>
            </h1>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">Superviseur : {juryProfile?.full_name}</p>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="p-2 text-gray-500 hover:text-white transition-colors">
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 gap-6">
          {candidats.map((c) => {
            const hasINoted = myEvaluations.includes(c.id);
            const othersNotes = allEvaluations.filter(e => e.candidat_id === c.id);
            
            return (
              <div key={c.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:border-amber-200 transition-all">
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  {/* GAUCHE : INFO CANDIDAT */}
                  <div className="flex items-center gap-5">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl ${hasINoted ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                      {c.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-xl uppercase tracking-tight">{c.full_name}</h3>
                      <div className="flex gap-2 mt-1">
                        {hasINoted ? (
                          <span className="text-[9px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase">Ma note : OK</span>
                        ) : (
                          <span className="text-[9px] font-black bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full uppercase italic animate-pulse">Ma note : En attente</span>
                        )}
                        <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                           {othersNotes.length} autres jurys
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MILIEU : APERÇU RAPIDE DES AUTRES (SUPERVISION) */}
                  <div className="flex -space-x-3 overflow-hidden px-2">
                    {othersNotes.map((note, idx) => (
                      <div key={idx} className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center shadow-sm" title={`${note.jury?.full_name}: ${note.total_score}/30`}>
                        <span className="text-[10px] font-black text-gray-600">{note.total_score}</span>
                      </div>
                    ))}
                    {othersNotes.length === 0 && <span className="text-[10px] text-gray-300 font-bold uppercase italic tracking-widest">Aucune note reçue</span>}
                  </div>

                  {/* DROITE : ACTIONS */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex gap-2 mr-4">
                      {c.document_url && (
                        <a href={c.document_url} target="_blank" className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-blue-600 transition-all">
                          <DocumentTextIcon className="h-5 w-5" />
                        </a>
                      )}
                    </div>

                    <Link to={`/jury/notation/${c.id}`} className="flex-1 md:flex-none">
                      <button className={`w-full px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        hasINoted ? 'bg-gray-100 text-gray-500' : 'bg-amber-400 text-gray-900 hover:bg-amber-500 shadow-lg shadow-amber-100'
                      }`}>
                        {hasINoted ? 'Modifier ma note' : 'Noter maintenant'}
                      </button>
                    </Link>
                  </div>
                </div>

                {/* BAS : BARRE DE PROGRESSION GLOBALE DU CANDIDAT */}
                <div className="bg-gray-50 px-8 py-3 flex items-center justify-between border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-4 w-4 text-gray-300" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tendance actuelle de ce candidat :</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 transition-all duration-700" 
                          style={{ width: `${(othersNotes.reduce((acc, curr) => acc + curr.total_score, 0) / (othersNotes.length || 1) / 30) * 100}%` }}
                        ></div>
                     </div>
                     <span className="text-xs font-black text-gray-900">
                        {(othersNotes.reduce((acc, curr) => acc + curr.total_score, 0) / (othersNotes.length || 1)).toFixed(1)} <small className="text-gray-400">/30</small>
                     </span>
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