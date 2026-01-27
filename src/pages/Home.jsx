import { Link } from 'react-router-dom';
import jeeLogo from '../assets/jee-logo.png'; 

export default function Home() {
  return (
    <div className="bg-white">
      {/* SECTION HERO - pt-2 pour PC et Mobile */}
      <div className="relative isolate px-6 pt-2 lg:px-8">
        
        {/* Container - py-2 supprime les gros espaces verticaux sur PC */}
        <div className="mx-auto max-w-3xl py-2 md:py-6">
          <div className="text-center">
            
            {/* LOGO - Réduit à mb-2 pour coller au badge */}
            <div className="flex justify-center mb-2 animate-in fade-in slide-in-from-top-4 duration-1000">
              <img 
                src={jeeLogo} 
                alt="JEE 2026 Logo" 
                className="h-28 md:h-40 w-auto object-contain drop-shadow-sm"
              />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] md:text-xs font-black mb-4 tracking-widest uppercase">
              Édition 2026
            </span>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-6xl lg:text-7xl leading-tight">
              L'avenir de l'entrepreneuriat commence <span className="text-blue-600">ici</span>.
            </h1>
            
            <p className="mt-4 text-base md:text-lg leading-7 text-gray-600 max-w-2xl mx-auto">
              Bienvenue à la <strong>Journée de l'Élève Entrepreneur</strong>. Une plateforme dédiée à l'innovation, à la créativité et au talent.
            </p>
            
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
              >
                S'inscrire
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition">
                Se connecter <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION CATÉGORIES - Reste inchangé */}
    </div>
  );
}