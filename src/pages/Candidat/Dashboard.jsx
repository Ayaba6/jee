import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  VideoCameraIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export default function CandidatDashboard() {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { getProfile(); }, []);

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        // Sécurité : s'assurer que video_url est toujours un tableau
        const formattedData = {
          ...data,
          video_url: Array.isArray(data.video_url) ? data.video_url : []
        };
        setProfile(formattedData);
      }
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleFileUpload = async (event, type) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      let videoTitle = "";
      if (type === 'video') {
        videoTitle = prompt("Donnez un titre à cette vidéo (ex: Ma Ferme, Pitch Final...) :");
        if (!videoTitle) return; // Annule si pas de titre
      }

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('candidatures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('candidatures').getPublicUrl(fileName);

      let updateData = {};
      if (type === 'texte') {
        updateData.document_url = publicUrl;
      } else {
        // Stockage sous forme d'objet : URL + Titre + Date
        const newVideoObject = {
          url: publicUrl,
          title: videoTitle,
          date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        
        const isAgro = profile.competition === 'agro_pitch';
        updateData.video_url = isAgro ? [...profile.video_url, newVideoObject] : [newVideoObject];
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (updateError) throw updateError;
      getProfile();
    } catch (error) {
      alert("Erreur : " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-blue-600 font-bold animate-pulse">Chargement JEE 2026...</div>;

  const isAgroPitch = profile?.competition === 'agro_pitch';

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 mb-8 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-black text-xl tracking-tighter text-gray-900 italic">JEE <span className="text-blue-600">2026</span></span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition">
            <ArrowRightOnRectangleIcon className="h-5 w-5" /> Quitter
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4">
        {/* HEADER PROFIL */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Bienvenue, <span className="text-blue-600">{profile?.full_name}</span></h1>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">{isAgroPitch ? '🌱 Agro Pitch' : '🎙️ Slam'}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 px-6 py-2 bg-gray-900 text-white rounded-2xl font-mono text-sm shadow-xl shadow-gray-200">
            +226 {profile?.phone}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* DOSSIER ÉCRIT */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                <h3 className="font-bold text-gray-900">Dossier écrit</h3>
              </div>
              {profile?.document_url ? (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-green-50 rounded-2xl text-green-700 text-sm font-bold border border-green-100">Document validé ✅</div>
                  <a href={profile.document_url} target="_blank" rel="noreferrer" className="block w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition">Voir mon texte</a>
                  <label className="block text-xs text-blue-500 font-bold cursor-pointer">Modifier le fichier <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'texte')} /></label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-100 rounded-[2rem] cursor-pointer hover:bg-blue-50 transition-all group">
                  <CloudArrowUpIcon className="h-10 w-10 text-gray-300 group-hover:text-blue-500" />
                  <span className="text-[10px] font-black text-gray-400 mt-4 uppercase">Envoyer mon projet</span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'texte')} />
                </label>
              )}
            </div>
          </div>

          {/* GALERIE VIDÉOS AVEC TITRE ET DATE */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <VideoCameraIcon className="h-6 w-6 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Vidéos du projet</h3>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {profile?.video_url?.map((video, index) => (
                  <div key={index} className="bg-gray-50 rounded-3xl overflow-hidden shadow-md border border-gray-100 flex flex-col">
                    <div className="relative aspect-video bg-black">
                      <video src={video.url} className="w-full h-full object-cover" controls />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-gray-800 font-black text-sm mb-1 italic">
                        <TagIcon className="h-4 w-4 text-purple-500" />
                        {video.title || `Vidéo #${index + 1}`}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        <CalendarIcon className="h-3 w-3" />
                        Ajoutée le {video.date || 'Date inconnue'}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* SLOT UPLOAD */}
                {(isAgroPitch || (!isAgroPitch && profile?.video_url?.length === 0)) && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl aspect-square sm:aspect-auto sm:h-full min-h-[150px] cursor-pointer hover:bg-purple-50 transition-all">
                    <CloudArrowUpIcon className="h-10 w-10 text-purple-200" />
                    <span className="mt-3 text-[10px] font-black text-purple-400 uppercase">Ajouter une vidéo</span>
                    <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOADER */}
      {uploading && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-sm uppercase tracking-widest italic">Enregistrement en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
}