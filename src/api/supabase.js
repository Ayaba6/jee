import { createClient } from '@supabase/supabase-js'

// On récupère les variables d'environnement définies dans le .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Sécurité : on vérifie que les clés sont bien présentes
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erreur: Les variables d'environnement Supabase sont manquantes !")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)