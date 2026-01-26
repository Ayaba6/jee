import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { 
  UserGroupIcon, 
  ChevronLeftIcon, 
  EnvelopeIcon,
  AcademicCapIcon,
  MicrophoneIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function JuryList() {
  const [jurys, setJurys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJurys();
  }, []);

  async function fetchJurys() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'jury')
      .order('full_name', { ascending: true });

    if (!error) setJurys(data);
    setLoading(false);
  }

  const handleDeleteJury = async (id, name) => {
    if (window.confirm(`Supprimer le compte jury de ${name} ?`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) setJurys(jurys.filter(j => j.id !== id));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-gray-300 animate-pulse uppercase tracking-widest">
      Chargement des experts...
    </div>
  );

  const JurySection = ({ title, data, type }) => (
    <div className="mb-10">
      <div className="flex items-center gap-4 mb-6 px-2">
        <h2 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.3em] whitespace-nowrap">{title}</h2>
        <div className="h-px bg-gray-200 w-full"></div>
        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold">{data.length}</span>
      </div>

      {/* GRILLE RESPONSIVE : 1 colonne mobile, 2 tablettes, 3 desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {data.map((jury) => (
          <div key={jury.id} className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${type === 'agro_pitch' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                {type === 'agro_pitch' ? <AcademicCapIcon className="h-6 w-6" /> : <MicrophoneIcon className="h-6 w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-gray-900 text-base md:text-lg truncate">{jury.full_name}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-widest truncate">
                  <EnvelopeIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{jury.email || 'Email non renseigné'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter ${
                type === 'agro_pitch' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'
              }`}>
                Expert {type.replace('_', ' ')}
              </span>
              
              <button 
                onClick={() => handleDeleteJury(jury.id, jury.full_name)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 text-xs font-bold uppercase">
          Aucun membre enregistré dans cette catégorie
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* NAVBAR RESPONSIVE */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 md:gap-2 text-gray-500 font-bold hover:text-indigo-600 transition text-sm">
            <ChevronLeftIcon className="h-5 w-5" /> <span className="hidden sm:inline">Retour</span>
          </button>
          
          <div className="flex items-center gap-2 md:gap-3">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tighter text-center">
              Membres du <span className="text-blue-600">Jury</span>
            </h1>
          </div>
          
          <div className="w-10 sm:w-20"></div> {/* Spacer pour centrer le titre */}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8 md:mt-12">
        <JurySection 
          title="Catégorie Agro Pitch" 
          data={jurys.filter(j => j.speciality === 'agro_pitch')} 
          type="agro_pitch" 
        />
        
        <JurySection 
          title="Catégorie Slam" 
          data={jurys.filter(j => j.speciality === 'slam')} 
          type="slam" 
        />
      </div>
    </div>
  );
}