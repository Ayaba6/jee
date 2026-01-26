import { useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate, Link } from 'react-router-dom';
import JeeLogo from '../assets/logo.jpg';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); // Nom plus générique (email ou tel)
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    let loginEmail = "";

    // LOGIQUE HYBRIDE :
    // Si l'identifiant contient un "@", on l'utilise tel quel (Admin/Jury par mail)
    // Sinon, on traite comme un numéro de téléphone (Candidat)
    if (identifier.includes('@')) {
      loginEmail = identifier.trim();
    } else {
      const cleanPhone = identifier.replace(/\s/g, '');
      loginEmail = `${cleanPhone}@jee.bf`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password,
    });

    if (error) {
      alert("Erreur : Identifiants ou mot de passe incorrects.");
    } else {
      // Récupération du rôle pour la redirection
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Redirection intelligente selon le rôle
      if (profile?.role === 'admin') {
        navigate('/admin');
      } else if (profile?.role === 'jury') {
        navigate('/jury');
      } else {
        navigate('/dashboard-candidat');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
           <Link to="/" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
             ← Retour à l'accueil
           </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
          <div className="text-center mb-10">
            <img src={JeeLogo} alt="JEE Logo" className="h-20 mx-auto mb-4 object-contain" />
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Espace Membre</h2>
            <p className="text-gray-500 mt-2 font-medium italic">Accès Candidats & Administration</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Champ Identifiant (Email ou Téléphone) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">
                Téléphone ou Email Admin
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  placeholder="Ex: 70000000 ou admin@mail.com"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-900 font-medium"
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 ml-1">
                * Pour les candidats, le numéro de téléphone suffit.
              </p>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">Mot de passe</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authentification...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-50 pt-6">
            <p className="text-gray-500 text-sm">
              Pas encore inscrit ?{' '}
              <Link to="/register" className="text-blue-600 font-bold hover:underline">Créer un compte</Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-gray-300 uppercase tracking-[0.2em] font-bold">
          Journée de l'Élève Entrepreneur • 2026
        </p>
      </div>
    </div>
  );
}