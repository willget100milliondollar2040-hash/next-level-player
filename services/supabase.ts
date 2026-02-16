
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odujudoexdkxuwzgpqoy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdWp1ZG9leGRreHV3emdwcW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjY4MTcsImV4cCI6MjA4NjY0MjgxN30._yltK2fYNP1oXr-ZQiLWw7hXg_93ac94re9KtWtloNI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) return false;
    return true;
  } catch (err) {
    return false;
  }
};
