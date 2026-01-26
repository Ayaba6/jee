import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';

export default function Notation() {
  const { id } = useParams(); // Récupère l'ID du candidat dans l'URL
  const navigate = useNavigate();
  
  const [candidat, setCandidat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // États pour les notes (sur 10)
  const [scores, setScores] = useState({ 
    elocution: 5, 
    pertinence: 5, 
    originalite: 5 
  });

  useEffect(() => {
    fetchCandidat();
  }, [id]);

  async function fetchCandidat() {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, competition')
      .eq('id', id)
      .single();

    if (error) {
      alert("Candidat introuvable");
      navigate('/jury');
    } else {
      setCandidat(data);
    }
    setLoading(false);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const total = scores.elocution + scores.pertinence + scores.originalite;

    const { error } = await supabase
      .from('evaluations')
      .insert([{ 
        candidat_id: id, 
        critere_eloquence: scores.elocution,
        critere_pertinence: scores.pertinence,
        critere_originalite: scores.originalite,
        total_score: total
      }]);

    if (error) {
      alert("Erreur lors de l'enregistrement. Vous avez peut-être déjà noté ce candidat.");
    } else {
      alert("Note enregistrée avec succès !");
      navigate('/jury');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Chargement du profil...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* En-tête avec le nom du candidat */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wide">{candidat?.full_name}</h2>
          <p className="opacity-80 mt-1 font-medium">Concours : {candidat?.competition?.toUpperCase()}</p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          {/* Curseur Élocution */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-gray-700 font-bold">🎙️ Élocution & Charisme</label>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{scores.elocution}/10</span>
            </div>
            <input 
              type="range" min="0" max="10" step="1"
              value={scores.elocution}
              onChange={(e) => setScores({...scores, elocution: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Curseur Pertinence */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-gray-700 font-bold">🎯 Pertinence du message</label>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{scores.pertinence}/10</span>
            </div>
            <input 
              type="range" min="0" max="10" step="1"
              value={scores.pertinence}
              onChange={(e) => setScores({...scores, pertinence: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Curseur Originalité */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-gray-700 font-bold">✨ Originalité / Innovation</label>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{scores.originalite}/10</span>
            </div>
            <input 
              type="range" min="0" max="10" step="1"
              value={scores.originalite}
              onChange={(e) => setScores({...scores, originalite: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-gray-800">Note Totale :</span>
              <span className="text-3xl font-black text-indigo-600">
                {scores.elocution + scores.pertinence + scores.originalite} <small className="text-gray-400 text-sm">/ 30</small>
              </span>
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => navigate('/jury')}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button 
                type="submit"
                disabled={saving}
                className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition transform active:scale-95 disabled:bg-gray-400"
              >
                {saving ? "Enregistrement..." : "Valider la note"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}