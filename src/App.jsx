import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register'; // Import indispensable pour la PWA

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JuryDashboard from './pages/Jury/Dashboard';
import Notation from './pages/Jury/Notation';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminResults from './pages/Admin/Results';
import JuryList from './pages/Admin/JuryList'; 
import CandidatDashboard from './pages/Candidat/Dashboard';

// Composants
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// 1. Enregistrement automatique de la PWA (mise à jour immédiate)
registerSW({ immediate: true });

function AppContent() {
  const location = useLocation();
  
  // Masquer la Navbar sur la page d'accueil ou de login si nécessaire
  const showNavbar = location.pathname !== "/" && location.pathname !== "/login";

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {showNavbar && <Navbar />} 
      
      <main className={showNavbar ? "max-w-7xl mx-auto" : ""}>
        <Routes>
          {/* --- ROUTES PUBLIQUES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* --- ESPACE CANDIDAT --- */}
          <Route 
            path="/dashboard-candidat" 
            element={
              <ProtectedRoute allowedRole="candidat">
                <CandidatDashboard />
              </ProtectedRoute>
            } 
          />

          {/* --- ESPACE JURY --- */}
          <Route 
            path="/jury" 
            element={
              <ProtectedRoute allowedRole="jury">
                <JuryDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jury/notation/:id" 
            element={
              <ProtectedRoute allowedRole="jury">
                <Notation />
              </ProtectedRoute>
            } 
          />

          {/* --- ESPACE ADMIN --- */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/results" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminResults />
              </ProtectedRoute>
            } 
          />

          {/* --- GESTION DES JURYS --- */}
          <Route 
            path="/admin/jurys" 
            element={
              <ProtectedRoute allowedRole="admin">
                <JuryList />
              </ProtectedRoute>
            } 
          />

          {/* Redirection automatique pour les routes inconnues */}
          <Route path="*" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}