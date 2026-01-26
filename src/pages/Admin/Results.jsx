import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { 
  TrophyIcon, 
  ChartBarIcon, 
  ChevronLeftIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    const { data, error } = await supabase
      .from('classements_candidats')
      .select('*')
      .order('moyenne_finale', { ascending: false });

    if (!error) setResults(data);
    setLoading(false);
  }

  // Fonction pour télécharger les résultats au format CSV (compatible Excel)
  const exportToExcel = () => {
    const headers = ["Rang", "Nom Complet", "Competition", "Evaluations", "Moyenne Finale"];
    const csvRows = [
      headers.join(","), // En-tête
      ...results.map((r, index) => 
        `${index + 1},${r.full_name},${r.competition.replace('_', ' ')},${r.nombre_evaluations},${r.moyenne_finale}`
      )
    ];

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Resultats_JEE_2026_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const renderPodium = (category) => {
    const filtered = results.filter(r => r.competition === category);
    
    return (
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 mb-10 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${category === 'agro_pitch' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
              <TrophyIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
              Classement {category.replace('_', ' ')}
            </h2>
          </div>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
            {filtered.length} Candidat(s)
          </span>
        </div>

        <div className="space-y-4">
          {filtered.map((res, index) => (
            <div key={res.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="flex items-center gap-5">
                <span className={`text-2xl font-black w-8 ${
                  index === 0 ? 'text-yellow-500' : 
                  index === 1 ? 'text-gray-400' : 
                  index === 2 ? 'text-orange-400' : 'text-gray-300'
                }`}>
                  #{index + 1}
                </span>
                <div>
                  <div className="font-bold text-gray-900 text-lg leading-tight">{res.full_name}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    Evalué par {res.nombre_evaluations} jury(s)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-indigo-600">{res.moyenne_finale || 0}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Points Moyens</div>
              </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400 italic text-sm font-medium">Aucun score enregistré pour cette catégorie.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Calcul des moyennes en cours...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* BARRE DE NAVIGATION */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-500 font-bold hover:text-indigo-600 transition group"
          >
            <ChevronLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /> 
            Retour
          </button>
          
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-black text-gray-900">Résultats en <span className="text-indigo-600">Direct</span></h1>
          </div>

          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition shadow-lg shadow-indigo-100"
          >
            <ArrowDownTrayIcon className="h-4 w-4" /> 
            Exporter CSV
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        {/* BANNIERE STATS */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Candidats Evalués</div>
            <div className="text-3xl font-black">{results.filter(r => r.nombre_evaluations > 0).length}</div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Moyenne Globale</div>
            <div className="text-3xl font-black text-gray-800">
              {results.length > 0 
                ? (results.reduce((acc, curr) => acc + curr.moyenne_finale, 0) / results.length).toFixed(2)
                : 0
              }
            </div>
          </div>
        </div>

        {/* LISTES PAR CATEGORIE */}
        {renderPodium('agro_pitch')}
        {renderPodium('slam')}
      </div>
    </div>
  );
}