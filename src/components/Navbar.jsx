import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useEffect, useState } from 'react';
import JeeLogo from '../assets/logo.jpg'; // Ton nouveau logo

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Vérifier si un utilisateur est connecté pour adapter le menu
  useEffect(() => {
    const session = supabase.auth.getSession();
    setUser(supabase.auth.getUser());

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO & NOM - À GAUCHE */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={JeeLogo} alt="JEE" className="h-12 w-auto group-hover:scale-105 transition-transform" />
              <span className="font-black text-xl tracking-tighter text-gray-900">
                JEE <span className="text-blue-600">2026</span>
              </span>
            </Link>
          </div>

          {/* LIENS CENTRÉS (Desktop) */}
          <div className="hidden md:flex items-center bg-gray-100/50 rounded-full px-2 py-1 border border-gray-200">
            <Link to="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition">Accueil</Link>
            {!user && (
              <>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition">Inscription</Link>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition">Connexion</Link>
              </>
            )}
          </div>

          {/* ACTIONS - À DROITE */}
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-5 py-2 rounded-full text-sm font-bold hover:bg-red-100 transition-colors border border-red-100"
              >
                Déconnexion
              </button>
            ) : (
              <Link 
                to="/register" 
                className="hidden sm:block bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
              >
                Rejoindre le concours
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}