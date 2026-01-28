import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { 
  UserGroupIcon, 
  ChevronLeftIcon, 
  EnvelopeIcon,
  AcademicCapIcon,
  MicrophoneIcon,
  TrashIcon,
  ShieldCheckIcon
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
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'jury');

    if (!error && data) {
      // Tri alphabétique de base pour les membres
      const sorted = data.sort((a, b) => a.full_name.localeCompare(b.full_name));
      setJurys(sorted);
    }
    setLoading(false);
  }

  const handleDeleteJury = async (id, name) => {
    if (window.confirm(`Supprimer définitivement l'accès de ${name} ?`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) setJurys(jurys.filter(j => j.id !== id));
    }
  };

  // Composant interne pour la carte Jury
  const JuryCard = ({ jury, isPresident }) => (
    <div className={`group relative bg-white p-5 rounded-[2rem] border ${isPresident ? 'border-blue-200 ring-4 ring-blue-50/50 shadow-md' : 'border-gray-100 shadow-sm'} transition-all duration-300`}>
      {isPresident && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-2xl flex items-center gap-1">
          <ShieldCheckIcon className="h-3 w-3" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Président</span>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${jury.speciality.includes('agro') ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
          {jury.speciality.includes('agro') ? <AcademicCapIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-black text-gray-900 text-sm truncate uppercase tracking-tight">{jury.full_name}</h4>
          <p className="text-[10px] text-gray-400 font-bold truncate lowercase">{jury.email}</p>
        </div>
        <button onClick={() => handleDeleteJury(jury.id, jury.full_name)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // Helper pour filtrer et trier une compétition spécifique
  const renderCompetitionGroup = (label, specKey, prezKey, icon) => {
    const president = jurys.find(j => j.speciality === prezKey);
    const members = jurys.filter(j => j.speciality === specKey);

    return (
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">{icon}</div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest italic">{label}</h2>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Le président est toujours affiché en premier s'il existe */}
          {president && <JuryCard jury={president} isPresident={true} />}
          
          {/* Les autres membres */}
          {members.map(jury => (
            <JuryCard key={jury.id} jury={jury} isPresident={false} />
          ))}
          
          {!president && members.length === 0 && (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
              <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest">Aucun membre pour cette catégorie</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-6">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
            <ChevronLeftIcon className="h-6 w-6 text-gray-400 hover:text-gray-900" />
          </button>
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-black text-gray-900 uppercase italic">Collège des <span className="text-blue-600">Jurys</span></h1>
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {/* SECTION AGRO PITCH */}
        {renderCompetitionGroup(
          "Catégorie Agro Pitch", 
          "agro_pitch", 
          "president_agro_pitch", 
          <AcademicCapIcon className="h-5 w-5" />
        )}

        {/* SECTION SLAM */}
        {renderCompetitionGroup(
          "Catégorie Slam", 
          "slam", 
          "president_slam", 
          <MicrophoneIcon className="h-5 w-5" />
        )}
      </div>
    </div>
  );
}