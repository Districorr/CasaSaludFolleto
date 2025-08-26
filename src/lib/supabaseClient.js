// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// Obtenemos la URL y la KEY desde el archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// Creamos y exportamos el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)