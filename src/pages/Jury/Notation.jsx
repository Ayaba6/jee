import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { 
  ChevronLeftIcon, 
  CheckBadgeIcon, 
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

export default function Notation() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [candidat, setCandidat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  
  const [scores, setScores] = useState({ 
    elocution: 5, 
    pertinence: 5, 
    originalite: 5 
  });

  useEffect(() => {
    initPage();
  }, [id]);

  async function initPage() {
    setLoading(true);
    
    // 1. Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');
    setUserId(user.id);

    // 2. Récupérer les infos du candidat
    const { data: cand } = await supabase
      .from('profiles')
      .select('full_name, competition')
      .eq('id', id)
      .single();

    if (cand) setCandidat(cand);

    // 3. Récupérer la note existante si elle existe
    const { data: existingEval } = await supabase
      .from('evaluations')
      .select('*')
      .eq('candidat_id', id)
      .eq('jury_id', user.id)
      .single();

    if (existingEval) {
      setScores({
        elocution: existingEval.critere_eloquence,
        pertinence: existingEval.critere_pertinence,
        originalite: existingEval.critere_originalite
      });
    }
    
    setLoading(false);
  }

  const updateScore = (criterion, delta) => {
    setScores(prev => ({
      ...prev,
      [criterion]: Math.max(0, Math.min(10, prev[criterion] + delta))
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const total = scores.elocution + scores.pertinence + scores.originalite;

    // Utilisation de UPSERT pour éviter l'erreur de doublon
    const { error } = await supabase
      .from('evaluations')
      .upsert({ 
        candidat_id: id, 
        jury_id: userId, // On lie la note à l'utilisateur connecté
        critere_eloquence: scores.elocution,
        critere_pertinence: scores.pertinence,
        critere_originalite: scores.originalite,
        total_score: total
      }, { 
        onConflict: 'candidat_id, jury_id' // Clé d'unicité
      });

    if (error) {
      alert("⚠️ Erreur : " + error.message);
    } else {
      alert("✅ Note enregistrée avec succès !");
      navigate('/jury');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Récupération du dossier...</p>
    </div>
  );

  const totalPoints = scores.elocution + scores.pertinence + scores.originalite;

  const CriterionField = ({ label, value, field, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${color} bg-opacity-10 ${color.replace('bg-', 'text-')}`}>
            <Icon className="h-5 w-5" />
          </div>
          <label className="text-sm font-black text-gray-700 uppercase tracking-tight">{label}</label>
        </div>
        <span className={`text-2xl font-black ${color.replace('bg-', 'text-')}`}>{value}<small className="text-gray-300 text-xs ml-1">/10</small></span>
      </div>
      
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => updateScore(field, -1)} className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 active:scale-90 transition-all">
          <MinusIcon className="h-5 w-5" />
        </button>
        <input type="range" min="0" max="10" step="1" value={value} onChange={(e) => setScores({...scores, [field]: parseInt(e.target.value)})} className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-gray-100" />
        <button type="button" onClick={() => updateScore(field, 1)} className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 active:scale-90 transition-all">
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 px-4 py-4 mb-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/jury')} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <ChevronLeftIcon className="h-6 w-6 text-gray-400" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black text-gray-900 uppercase tracking-tighter truncate max-w-[180px]">{candidat?.full_name}</h1>
            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{candidat?.competition?.replace('_', ' ')}</p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <form onSubmit={handleSave} className="space-y-4">
          <CriterionField label="Élocution & Charisme" value={scores.elocution} field="elocution" icon={ChatBubbleLeftRightIcon} color="bg-blue-600" />
          <CriterionField label="Pertinence du Fond" value={scores.pertinence} field="pertinence" icon={CheckBadgeIcon} color="bg-emerald-600" />
          <CriterionField label="Originalité" value={scores.originalite} field="originalite" icon={LightBulbIcon} color="bg-amber-500" />

          <div className="bg-gray-900 rounded-[2.5rem] p-8 mt-8 text-white shadow-xl relative overflow-hidden group">
            <SparklesIcon className="absolute -right-4 -top-4 h-24 w-24 text-white opacity-5" />
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Note Finale Cumulée</span>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black">{totalPoints}</span>
                <span className="text-xl font-bold text-gray-500">/30</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${(totalPoints / 30) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-8">
            <button type="submit" disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[2rem] shadow-lg transition-all active:scale-95 disabled:grayscale">
              {saving ? "TRANSMISSION..." : "VALIDER ET ENREGISTRER"}
            </button>
            <button type="button" onClick={() => navigate('/jury')} className="w-full py-4 text-gray-400 font-bold text-sm">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}