import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg-white">
      {/* SECTION HERO */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-3xl py-12 sm:py-20">
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6 tracking-wide uppercase">
              Édition 2026
            </span>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
              L'avenir de l'entrepreneuriat commence <span className="text-blue-600">ici</span>.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Bienvenue à la <strong>Journée de l'Élève Entrepreneur</strong>. Une plateforme dédiée à l'innovation, à la créativité et au talent. Que vous soyez slameur ou innovateur agricole, votre moment est arrivé.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
              >
                S'inscrire au Concours
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition">
                Se connecter <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION CATÉGORIES */}
      <div className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          {/* Carte Slam */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 transition group">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">🎙️</div>
            <h3 className="text-xl font-bold text-gray-900 italic">Concours Slam</h3>
            <p className="mt-2 text-gray-600 text-sm">
              Maniez les mots, capturez les émotions et convainquez le jury par votre éloquence.
            </p>
          </div>

          {/* Carte Agro Pitch */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-green-300 transition group">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">🌱</div>
            <h3 className="text-xl font-bold text-gray-900">Agro Pitch</h3>
            <p className="mt-2 text-gray-600 text-sm">
              Présentez vos solutions innovantes pour l'agriculture de demain.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER SIMPLE */}
      <footer className="py-10 text-center text-gray-400 text-sm">
        © 2026 JEE - Propulsé par l'innovation étudiante.
      </footer>
    </div>
  );
}