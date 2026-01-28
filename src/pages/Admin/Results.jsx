import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { 
  TrophyIcon, 
  ChartBarIcon, 
  ChevronLeftIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('agro_pitch');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classements_candidats')
        .select('*')
        .order('moyenne_finale', { ascending: false });

      if (!error) setResults(data);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  }

  const exportToExcel = () => {
    const headers = ["Rang", "Nom Complet", "Competition", "Evaluations", "Moyenne Finale"];
    const csvContent = [
      headers.join(","),
      ...results.map((r, index) => 
        `${index + 1},${r.full_name},${r.competition.replace('_', ' ')},${r.nombre_evaluations},${r.moyenne_finale}`
      )
    ].join("\n");

    // Ajout du BOM UTF-8 pour Excel (évite les problèmes d'accents)
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Classement_JEE_2026.csv`;
    link.click();
  };

  const renderList = (category) => {
    const filtered = results.filter(r => r.competition === category);
    
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filtered.map((res, index) => {
          const isTop3 = index < 3;
          const medalColor = index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-300' : index === 2 ? 'bg-orange-400' : 'bg-gray-100';
          
          return (
            <div key={res.id} className="relative bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group overflow-hidden">
              {/* Indicateur de rang visuel */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isTop3 ? medalColor : 'bg-transparent'}`}></div>
              
              <div className="flex items-center gap-4 md:gap-6">
                <div className={`${medalColor} ${isTop3 ? 'text-white' : 'text-gray-400'} w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner`}>
                  {index + 1}
                </div>
                
                <div>
                  <div className="font-bold text-gray-900 text-base md:text-xl leading-tight">{res.full_name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
                      {res.nombre_evaluations} ÉVALUATIONS
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex flex-col items-end">
                  <div className="text-2xl md:text-3xl font-black text-gray-900 leading-none">
                    {res.moyenne_finale?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter mt-1">Points</div>
                </div>
                {/* Petite barre de progression sous le score */}
                <div className="w-20 md:w-32 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${category === 'agro_pitch' ? 'bg-emerald-500' : 'bg-orange-500'}`}
                    style={{ width: `${(res.moyenne_finale / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
        
        {filtered.length === 0 && (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
            <ChartBarIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">En attente des premières notes...</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Calcul des classements...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-black">
      {/* HEADER RESPONSIVE */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-4 md:px-6">
        <div className="max-w-5xl mx-auto h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors group"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-900" />
          </button>
          
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-6 w-6 text-yellow-500" />
            <h1 className="text-lg md:text-xl font-black text-gray-900 uppercase italic">Palmarès <span className="text-indigo-600">JEE</span></h1>
          </div>

          <button 
            onClick={exportToExcel}
            className="bg-gray-900 hover:bg-indigo-600 text-white p-2.5 md:px-5 md:py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span className="hidden md:inline text-xs font-black uppercase">Exporter</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* STATS RAPIDES */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <ChartBarIcon className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10 group-hover:scale-110 transition-transform" />
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Candidats Notés</div>
            <div className="text-3xl font-black">{results.filter(r => r.nombre_evaluations > 0).length}</div>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Performance Moy.</div>
            <div className="text-3xl font-black text-gray-900">
              {results.length > 0 
                ? (results.reduce((acc, curr) => acc + curr.moyenne_finale, 0) / results.length).toFixed(2)
                : "0.00"
              }
            </div>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex p-1.5 bg-gray-100 rounded-[2rem] mb-8">
          <button 
            onClick={() => setActiveTab('agro_pitch')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] text-xs font-black transition-all ${activeTab === 'agro_pitch' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <AcademicCapIcon className="h-4 w-4" />
            AGRO PITCH
          </button>
          <button 
            onClick={() => setActiveTab('slam')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] text-xs font-black transition-all ${activeTab === 'slam' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <MicrophoneIcon className="h-4 w-4" />
            SLAM
          </button>
        </div>

        {/* TITRE DE SECTION */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
            Classement Général — {activeTab.replace('_', ' ')}
          </h2>
          <div className="h-px flex-1 bg-gray-100 mx-4"></div>
        </div>

        {/* LISTE DYNAMIQUE */}
        {renderList(activeTab)}
        
      </div>
    </div>
  );
}