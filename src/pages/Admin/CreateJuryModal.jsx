import { useState } from 'react';
import { supabase } from '../../api/supabase';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function CreateJuryModal({ isOpen, onClose }) {
  const [isCreating, setIsCreating] = useState(false);
  const [juryData, setJuryData] = useState({ 
    email: '', 
    password: '', 
    full_name: '', 
    speciality: 'agro_pitch' 
  });

  if (!isOpen) return null;

  const handleCreateJury = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: juryData.email,
        password: juryData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{ 
          id: authData.user.id, 
          full_name: juryData.full_name, 
          role: 'jury', 
          speciality: juryData.speciality, // On stocke ici 'president_agro_pitch', etc.
          email: juryData.email 
        }]);

        if (profileError) throw profileError;

        alert(`Accès validé pour ${juryData.full_name} !`);
        setJuryData({ email: '', password: '', full_name: '', speciality: 'agro_pitch' });
        onClose();
      }
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none">Nouveau <span className="text-blue-600">Membre</span></h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Collège des experts JEE 2026</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition">
            <XMarkIcon className="h-5 w-5"/>
          </button>
        </div>

        <form onSubmit={handleCreateJury} className="space-y-4">
          <input 
            required 
            placeholder="Nom Complet" 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all" 
            onChange={e => setJuryData({...juryData, full_name: e.target.value})} 
          />
          <input 
            required 
            type="email" 
            placeholder="Email professionnel" 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all" 
            onChange={e => setJuryData({...juryData, email: e.target.value})} 
          />
          <input 
            required 
            type="password" 
            placeholder="Mot de passe" 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all" 
            onChange={e => setJuryData({...juryData, password: e.target.value})} 
          />
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em]">Affectation & Rang</label>
            <select 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-xs cursor-pointer appearance-none border-r-[16px] border-transparent" 
              value={juryData.speciality}
              onChange={e => setJuryData({...juryData, speciality: e.target.value})}
            >
              <optgroup label="Membres du Jury">
                <option value="agro_pitch">Jury Agro Pitch</option>
                <option value="slam">Jury Slam</option>
              </optgroup>
              <optgroup label="Hautes Fonctions">
                <option value="president_agro_pitch">⭐ Président Agro Pitch</option>
                <option value="president_slam">⭐ Président Slam</option>
              </optgroup>
            </select>
          </div>

          <button 
            disabled={isCreating} 
            className={`w-full ${isCreating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-100 transition-all transform active:scale-95 uppercase tracking-[0.2em] text-[10px] mt-4`}
          >
            {isCreating ? 'TRAITEMENT EN COURS...' : 'CONFIRMER L\'ACCÈS'}
          </button>
        </form>
      </div>
    </div>
  );
}