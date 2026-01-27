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
      .eq('role', 'candidat') // Filtre strictement sur les candidats
      .order('created_at', { ascending: false });
    
    if (!error) setCandidates(data);
    setLoading(false);
  }

  // --- LOGIQUE DES STATISTIQUES ---
  const stats = {
    total: candidates.length,
    agroPitch: candidates.filter(c => c.competition === 'agro_pitch').length,
    slam: candidates.filter(c => c.competition === 'slam').length
  };

  // --- LOGIQUE EXPORT CSV ---
  const exportToCSV = () => {
    if (candidates.length === 0) return;
    
    const headers = ["Nom Complet", "Email", "Telephone", "Competition", "Date Inscription"];
    const rows = candidates.map(c => [
      c.full_name,
      c.email,
      `+226${c.phone}`,
      c.competition,
      new Date(c.created_at).toLocaleDateString()
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidats_jee_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      alert("Jury créé avec succès !");
      setShowJuryModal(false);
    } else {
      alert("Erreur: " + authError.message);
    }
    setIsCreating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Supprimer définitivement le candidat ${name} ?`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) setCandidates(candidates.filter(c => c.id !== id));
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-600 font-black uppercase tracking-widest text-xs">Chargement JEE Admin...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans text-gray-900">
      
      {/* MODAL JURY */}
      {showJuryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-tighter">Nouveau <span className="text-blue-600">Jury</span></h2>
              <button onClick={() => setShowJuryModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition"><XMarkIcon className="h-5 w-5"/></button>
            </div>
            <form onSubmit={handleCreateJury} className="space-y-4">
              <input required placeholder="Nom Complet" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setJuryData({...juryData, full_name: e.target.value})} />
              <input required type="email" placeholder="Email professionnel" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setJuryData({...juryData, email: e.target.value})} />
              <input required type="password" placeholder="Mot de passe" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setJuryData({...juryData, password: e.target.value})} />
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none" onChange={e => setJuryData({...juryData, speciality: e.target.value})}>
                <option value="agro_pitch">Spécialité : Agro Pitch</option>
                <option value="slam">Spécialité : Slam</option>
              </select>
              <button disabled={isCreating} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition transform active:scale-95">
                {isCreating ? 'EN COURS...' : 'CRÉER LE COMPTE'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-20 px-4">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100"><UsersIcon className="h-5 w-5" /></div>
            <h1 className="text-sm md:text-xl font-black tracking-tighter uppercase">Admin <span className="text-blue-600">JEE</span></h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => navigate('/admin/jurys')} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition"><UserGroupIcon className="h-5 w-5" /></button>
            <button onClick={() => navigate('/admin/results')} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition"><ChartBarIcon className="h-5 w-5" /></button>
            <button onClick={() => setShowJuryModal(true)} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black hover:bg-blue-600 transition shadow-md"><UserPlusIcon className="h-4 w-4" /><span className="hidden sm:inline">AJOUTER JURY</span></button>
            <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 p-2 transition"><ArrowRightOnRectangleIcon className="h-6 w-6" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* STATS DYNAMIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-blue-600 text-white h-14 w-14 flex items-center justify-center rounded-[1.2rem] font-black text-2xl shadow-blue-100 shadow-xl">{stats.total}</div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Candidats</div>
              <div className="text-sm font-bold italic">Total Inscrits</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-emerald-500 text-white h-14 w-14 flex items-center justify-center rounded-[1.2rem] font-black text-2xl shadow-emerald-100 shadow-xl">{stats.agroPitch}</div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Catégorie</div>
              <div className="text-sm font-bold italic">Agro Pitch</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-orange-500 text-white h-14 w-14 flex items-center justify-center rounded-[1.2rem] font-black text-2xl shadow-orange-100 shadow-xl">{stats.slam}</div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Catégorie</div>
              <div className="text-sm font-bold italic">Slam</div>
            </div>
          </div>
        </div>

        {/* BARRE DE RECHERCHE ET EXPORT */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input placeholder="Rechercher un candidat..." className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all" onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={exportToCSV} className="flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-4 rounded-2xl font-bold text-sm border border-gray-100 shadow-sm hover:bg-gray-50 transition active:scale-95">
            <ArrowDownTrayIcon className="h-5 w-5 text-blue-600" />
            EXPORTER CSV
          </button>
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
                  <tr key={c.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900">{c.full_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono tracking-tight">+226 {c.phone}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${c.competition === 'agro_pitch' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {c.competition?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-3">
                        {c.document_url && <a href={c.document_url} target="_blank" rel="noreferrer" className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition"><DocumentMagnifyingGlassIcon className="h-4 w-4"/></a>}
                        {Array.isArray(c.video_url) && c.video_url.length > 0 && <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl flex items-center gap-2 text-[10px] font-black"><VideoCameraIcon className="h-4 w-4"/> {c.video_url.length}</div>}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDelete(c.id, c.full_name)} className="p-2.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition"><TrashIcon className="h-5 w-5"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4">
            {filteredCandidates.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-black text-gray-900 text-base">{c.full_name}</div>
                    <div className="text-xs text-gray-400 font-bold tracking-tight">+226 {c.phone}</div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase ${c.competition === 'agro_pitch' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {c.competition?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-50">
                  <div className="flex gap-2">
                    {c.document_url && <a href={c.document_url} target="_blank" rel="noreferrer" className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl"><DocumentMagnifyingGlassIcon className="h-5 w-5"/></a>}
                    {Array.isArray(c.video_url) && c.video_url.length > 0 && <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center gap-2 text-xs font-black"><VideoCameraIcon className="h-5 w-5"/> {c.video_url.length}</div>}
                  </div>
                  <button onClick={() => handleDelete(c.id, c.full_name)} className="p-3.5 bg-red-50 text-red-500 rounded-2xl transition"><TrashIcon className="h-5 w-5"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}