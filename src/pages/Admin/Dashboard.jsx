import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  UserPlusIcon,
  XMarkIcon,
  DocumentMagnifyingGlassIcon,
  ChartBarIcon,
  UserGroupIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showJuryModal, setShowJuryModal] = useState(false);
  const [juryData, setJuryData] = useState({ email: '', password: '', full_name: '', speciality: 'agro_pitch' });
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'candidat')
      .order('created_at', { ascending: false });
    if (!error) setCandidates(data);
    setLoading(false);
  }

  const handleCreateJury = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: juryData.email,
      password: juryData.password,
    });

    if (!authError && authData.user) {
      await supabase.from('profiles').insert([{ 
        id: authData.user.id, 
        full_name: juryData.full_name, 
        role: 'jury', 
        speciality: juryData.speciality, 
        email: juryData.email 
      }]);
      alert("Jury créé !");
      setShowJuryModal(false);
    }
    setIsCreating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Supprimer ${name} ?`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) setCandidates(candidates.filter(c => c.id !== id));
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone?.includes(searchTerm)
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-black animate-pulse">CHARGEMENT...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans">
      
      {/* MODAL RESPONSIVE */}
      {showJuryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 uppercase">Nouveau <span className="text-blue-600">Jury</span></h2>
              <button onClick={() => setShowJuryModal(false)} className="p-2 bg-gray-100 rounded-full"><XMarkIcon className="h-5 w-5"/></button>
            </div>
            <form onSubmit={handleCreateJury} className="space-y-4">
              <input required placeholder="Nom Complet" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setJuryData({...juryData, full_name: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setJuryData({...juryData, email: e.target.value})} />
              <input required type="password" placeholder="Mot de passe" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setJuryData({...juryData, password: e.target.value})} />
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none" onChange={e => setJuryData({...juryData, speciality: e.target.value})}>
                <option value="agro_pitch">Agro Pitch</option>
                <option value="slam">Slam</option>
              </select>
              <button disabled={isCreating} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg">
                {isCreating ? 'CRÉATION...' : 'CONFIRMER'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER RESPONSIVE */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white md:block hidden"><UsersIcon className="h-5 w-5" /></div>
            <h1 className="text-sm md:text-xl font-black text-gray-900 tracking-tighter uppercase">Admin <span className="text-blue-600">JEE</span></h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/jurys')} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition"><UserGroupIcon className="h-5 w-5" /></button>
            <button onClick={() => navigate('/admin/results')} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition"><ChartBarIcon className="h-5 w-5" /></button>
            <button onClick={() => setShowJuryModal(true)} className="flex items-center gap-2 bg-gray-900 text-white px-3 md:px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black"><UserPlusIcon className="h-4 w-4" /><span className="hidden sm:inline">AJOUTER JURY</span></button>
            <button onClick={handleLogout} className="text-gray-400 p-2"><ArrowRightOnRectangleIcon className="h-6 w-6" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* STATS RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total', count: candidates.length, color: 'blue' },
            { label: 'Agro Pitch', count: candidates.filter(c => c.competition === 'agro_pitch').length, color: 'green' },
            { label: 'Slam', count: candidates.filter(c => c.competition === 'slam').length, color: 'orange' }
          ].map(stat => (
            <div key={stat.label} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className={`bg-${stat.color}-50 text-${stat.color}-600 p-3 rounded-2xl font-black text-xl`}>{stat.count}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* RECHERCHE */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input placeholder="Rechercher..." className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm outline-none text-sm" onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* LISTE DES CANDIDATS : TABLEAU (PC) OU CARTES (MOBILE) */}
        <div className="bg-white md:bg-transparent rounded-[2rem] overflow-hidden">
          {/* VUE TABLEAU (Desktop) */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Candidat</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Concours</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center">Médias</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCandidates.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{c.full_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">+226 {c.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${c.competition === 'agro_pitch' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {c.competition?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      {c.document_url && <a href={c.document_url} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DocumentMagnifyingGlassIcon className="h-4 w-4"/></a>}
                      {Array.isArray(c.video_url) && c.video_url.length > 0 && <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg flex items-center gap-1 text-[10px] font-black"><VideoCameraIcon className="h-4 w-4"/> {c.video_url.length}</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(c.id, c.full_name)} className="p-2 text-gray-300 hover:text-red-500 transition"><TrashIcon className="h-5 w-5"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VUE CARTES (Mobile) */}
          <div className="md:hidden space-y-4">
            {filteredCandidates.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-black text-gray-900 text-base">{c.full_name}</div>
                    <div className="text-xs text-gray-400 font-bold">+226 {c.phone}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${c.competition === 'agro_pitch' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {c.competition?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div className="flex gap-2">
                    {c.document_url && <a href={c.document_url} target="_blank" rel="noreferrer" className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DocumentMagnifyingGlassIcon className="h-5 w-5"/></a>}
                    {Array.isArray(c.video_url) && c.video_url.length > 0 && <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex items-center gap-2 text-xs font-black"><VideoCameraIcon className="h-5 w-5"/> {c.video_url.length}</div>}
                  </div>
                  <button onClick={() => handleDelete(c.id, c.full_name)} className="p-3 text-red-100 bg-red-50 text-red-500 rounded-xl transition"><TrashIcon className="h-5 w-5"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}