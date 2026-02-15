
import { createClient } from '@supabase/supabase-js';

/**
 * Cấu hình Supabase chính thức của ứng dụng.
 * URL và Key được cập nhật theo yêu cầu mới nhất của người dùng.
 */
const supabaseUrl = 'https://odujudoexdkxuwzgpqoy.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdWp1ZG9leGRreHV3emdwcW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjY4MTcsImV4cCI6MjA4NjY0MjgxN30._yltK2fYNP1oXr-ZQiLWw7hXg_93ac94re9KtWtloNI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Kiểm tra kết nối tới bảng profiles.
 * Đảm bảo bảng này tồn tại trong Supabase của bạn.
 */
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
};
