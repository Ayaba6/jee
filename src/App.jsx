import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JuryDashboard from './pages/Jury/Dashboard';
import Notation from './pages/Jury/Notation';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminResults from './pages/Admin/Results';
import JuryList from './pages/Admin/JuryList'; // <-- 1. Importation de la liste des jurys
import CandidatDashboard from './pages/Candidat/Dashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />} 
      
      <main className={showNavbar ? "container mx-auto px-4 py-8" : ""}>
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

          {/* --- 2. NOUVELLE ROUTE : LISTE DES JURYS --- */}
          <Route 
            path="/admin/jurys" 
            element={
              <ProtectedRoute allowedRole="admin">
                <JuryList />
              </ProtectedRoute>
            } 
          />
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