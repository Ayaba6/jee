import { useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate, Link } from 'react-router-dom';
import JeeLogo from '../assets/logo.jpg';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '', // Remplacé email par phone
    password: '',
    competition: 'slam',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Nettoyage du numéro : enlever les espaces et s'assurer qu'il n'y a pas de '+'
    const cleanPhone = formData.phone.replace(/\s/g, '');
    // Astuce : On crée un identifiant unique que Supabase accepte comme email
    const fakeEmail = `${cleanPhone}@jee.bf`;

    // 1. Inscription Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: fakeEmail, 
      password: formData.password,
    });

    if (authError) {
      alert("Erreur : " + authError.message);
    } else {
      // 2. Insertion dans la table 'profiles'
      const { error: dbError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            full_name: formData.fullName, 
            phone: cleanPhone, // On stocke le vrai numéro
            role: 'candidat',
            competition: formData.competition 
          }
        ]);

      if (dbError) {
        alert("Erreur base de données : " + dbError.message);
      } else {
        alert("Félicitations ! Inscription réussie.");
        navigate('/dashboard-candidat');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-6">
           <Link to="/" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
             ← Retour à l'accueil
           </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
          <div className="text-center mb-8">
            <img src={JeeLogo} alt="JEE Logo" className="h-16 mx-auto mb-4 object-contain" />
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Inscription Candidat</h2>
            <p className="text-gray-500 mt-2 font-medium">Rejoins la compétition JEE 2026</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom Complet */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">Nom Complet</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: Moussa Traoré"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">Numéro de Téléphone</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400 font-bold border-r border-gray-200 pr-3 my-3">
                  +226
                </span>
                <input 
                  type="tel" 
                  required 
                  placeholder="70 00 00 00"
                  className="w-full pl-20 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-900 font-medium"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">Ton mot de passe</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {/* Sélection Concours */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">Ta catégorie</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, competition: 'slam'})}
                  className={`py-4 rounded-2xl font-bold transition-all border-2 ${formData.competition === 'slam' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                >
                  🎙️ Slam
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, competition: 'agro_pitch'})}
                  className={`py-4 rounded-2xl font-bold transition-all border-2 ${formData.competition === 'agro_pitch' ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                >
                  🌱 Agro Pitch
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform active:scale-[0.98] disabled:bg-gray-400 mt-4"
            >
              {loading ? 'Création du compte...' : "Valider mon inscription"}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-50 pt-6">
            <p className="text-gray-500 text-sm">
              Déjà inscrit ?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">Se connecter ici</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}