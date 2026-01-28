import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  UserPlusIcon,
  DocumentMagnifyingGlassIcon,
  ChartBarIcon,
  UserGroupIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import CreateJuryModal from './CreateJuryModal'; // Ton composant externe

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showJuryModal, setShowJuryModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    setLoading(true);
    try {
      // Requête simple sans .order() pour éviter l'erreur 400
      const { data, error } = await supabase.from('profiles').select('*');
      
      if (error) throw error;

      if (data) {
        // Filtrage des candidats
        const onlyCandidates = data.filter(p => p.role?.toLowerCase() === 'candidat');
        // Tri manuel par date
        const sorted = onlyCandidates.sort((a, b) => 
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        setCandidates(sorted);
      }
    } catch (err) {
      console.error("Erreur de récupération:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: candidates.length,
    agroPitch: candidates.filter(c => (c.competition || "").toLowerCase().includes('agro')).length,
    slam: candidates.filter(c => (c.competition || "").toLowerCase().includes('slam')).length
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Supprimer définitivement ${name} ?`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) setCandidates(candidates.filter(c => c.id !== id));
    }
  };

  const filteredCandidates = candidates.filter(c => 
    (c.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone || "").includes(searchTerm)
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Chargement Admin...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans text-black">
      
      {/* APPEL DU MODAL EXTERNE */}
      <CreateJuryModal 
        isOpen={showJuryModal} 
        onClose={() => setShowJuryModal(false)} 
      />

      {/* NAV BAR */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-20 px-4">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><UsersIcon className="h-5 w-5" /></div>
            <h1 className="text-sm md:text-xl font-black text-gray-900 tracking-tighter uppercase italic">Admin <span className="text-blue-600">JEE</span></h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button title="Liste des Jurys" onClick={() => navigate('/admin/jurys')} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition">
              <UserGroupIcon className="h-5 w-5" />
            </button>
            <button title="Résultats" onClick={() => navigate('/admin/results')} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition">
              <ChartBarIcon className="h-5 w-5" />
            </button>
            
            {/* BOUTON QUI LANCE LE MODAL */}
            <button 
              onClick={() => setShowJuryModal(true)} 
              className="flex items-center gap-2 bg-gray-900 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-md uppercase tracking-widest"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">JURY</span>
            </button>

            <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 p-2 transition">
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
            <div className="bg-blue-600 text-white h-14 w-14 flex items-center justify-center rounded-2xl font-black text-2xl shadow-xl shadow-blue-100">{stats.total}</div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Inscrits</div>
              <div className="text-sm font-bold text-gray-900 italic">Candidats</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
            <div className="bg-emerald-500 text-white h-14 w-14 flex items-center justify-center rounded-2xl font-black text-2xl shadow-xl shadow-emerald-100">{stats.agroPitch}</div>
            <div>
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Catégorie</div>
              <div className="text-sm font-bold text-gray-900 italic">Agro Pitch</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
            <div className="bg-orange-500 text-white h-14 w-14 flex items-center justify-center rounded-2xl font-black text-2xl shadow-xl shadow-orange-100">{stats.slam}</div>
            <div>
              <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Catégorie</div>
              <div className="text-sm font-bold text-gray-900 italic">Slam</div>
            </div>
          </div>
        </div>

        {/* RECHERCHE */}
        <div className="relative mb-8 text-black">
          <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
          <input 
            placeholder="Rechercher un candidat..." 
            className="w-full pl-14 pr-6 py-5 bg-white rounded-[1.5rem] border-none shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-black" 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>

        {/* LISTE DES CANDIDATS */}
        <div className="bg-white md:bg-transparent rounded-[2.5rem] overflow-hidden">
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidat</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Concours</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Médias</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCandidates.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/20 transition-colors group text-black">
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{c.full_name || 'Sans Nom'}</div>
                      <div className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">+226 {c.phone}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${ (c.competition || "").toLowerCase().includes('agro') ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {c.competition?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center gap-2">
                        {c.document_url && <a href={c.document_url} target="_blank" rel="noreferrer" className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition"><DocumentMagnifyingGlassIcon className="h-4 w-4"/></a>}
                        {Array.isArray(c.video_url) && c.video_url.length > 0 && <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl flex items-center gap-1.5 text-[10px] font-black"><VideoCameraIcon className="h-4 w-4"/> {c.video_url.length}</div>}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDelete(c.id, c.full_name)} className="p-2.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                        <TrashIcon className="h-5 w-5"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4">
            {filteredCandidates.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-black">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-black text-gray-900 text-base italic">{c.full_name || 'Sans Nom'}</div>
                    <div className="text-xs text-gray-400 font-bold">+226 {c.phone}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${(c.competition || "").toLowerCase().includes('agro') ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {c.competition?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-50">
                  <div className="flex gap-2">
                    {c.document_url && <a href={c.document_url} target="_blank" rel="noreferrer" className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DocumentMagnifyingGlassIcon className="h-5 w-5"/></a>}
                    {Array.isArray(c.video_url) && c.video_url.length > 0 && <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex items-center gap-2 text-xs font-black"><VideoCameraIcon className="h-5 w-5"/> {c.video_url.length}</div>}
                  </div>
                  <button onClick={() => handleDelete(c.id, c.full_name)} className="p-3 bg-red-50 text-red-500 rounded-xl"><TrashIcon className="h-5 w-5"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}