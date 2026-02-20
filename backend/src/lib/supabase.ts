import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.js';
import { config } from '../config.js';

export const supabase = createClient<Database>(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
);
