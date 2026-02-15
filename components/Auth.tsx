
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          alert('Hệ thống đã gửi yêu cầu. Nếu bạn đã tắt "Confirm Email" trong Supabase, hãy thử đăng nhập ngay.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi truy cập hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-brand-black overflow-hidden px-6">
      <div className="absolute inset-0 opacity-20">
        <img src="https://images.unsplash.com/photo-1551952237-954a0e68786c?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-brand-neon/10 border border-brand-neon/30 rounded-full mb-6">
            <span className="text-brand-neon text-[10px] font-black uppercase tracking-[0.3em]">Official Entry Portal</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-tight text-white mb-2">
            NEXTLEVEL <span className="text-brand-neon">PLAYER</span>
          </h1>
          <p className="text-white/40 text-xs font-medium italic">Học viện bóng đá online cá nhân hoá</p>
        </div>

        <div className="bg-brand-accent/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            QUICK ACCESS WITH GOOGLE
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-white/20">
              <span className="bg-brand-accent px-4 py-1 rounded-full border border-white/5">Member Login</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-brand-neon transition-all" 
            />
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mật khẩu" 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-brand-neon transition-all" 
            />
            {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-brand-neon/10 border border-brand-neon/40 text-brand-neon font-black py-4 rounded-xl uppercase italic hover:bg-brand-neon hover:text-black transition-all">
              {isSignUp ? 'Đăng ký Academy' : 'Vào học viện'}
            </button>
          </form>

          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-6 text-[10px] font-black uppercase text-white/30 hover:text-brand-neon transition tracking-widest text-center">
            {isSignUp ? 'Đã là thành viên? Đăng nhập' : 'Trở thành học viên mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
