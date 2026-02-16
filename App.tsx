
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { UserProfile } from './types';
import { supabase } from './services/supabase';

const LandingPage: React.FC<{ onStart: () => void, isAuthenticated: boolean }> = ({ onStart, isAuthenticated }) => (
  <div className="relative min-h-screen flex flex-col items-center justify-center bg-brand-black overflow-hidden">
    <div className="absolute inset-0 opacity-20">
      <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="" />
    </div>
    <div className="relative z-10 text-center px-6">
      <div className="inline-block px-4 py-1 bg-brand-neon/10 border border-brand-neon/30 rounded-full mb-6">
        <span className="text-brand-neon text-[10px] font-black uppercase tracking-[0.3em]">Next Generation Academy</span>
      </div>
      <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-tight mb-8">
        TRAIN LIKE <span className="text-brand-neon italic">A PRO.</span>
      </h1>
      <button onClick={onStart} className="px-12 py-5 bg-brand-neon text-black font-black text-xl rounded-full hover:scale-105 transition shadow-2xl shadow-brand-neon/20">
        {isAuthenticated ? 'VÀO DASHBOARD' : 'BẮT ĐẦU HÀNH TRÌNH'}
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'landing' | 'auth' | 'onboarding' | 'dashboard'>('landing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Lắng nghe thay đổi trạng thái Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setView('landing');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('data')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data && data.data) {
        setUserProfile(data.data as UserProfile);
        setView('dashboard');
      } else {
        setView('onboarding');
      }
    } catch (e) {
      console.error("Fetch profile error:", e);
      // Nếu bảng profiles chưa tồn tại hoặc lỗi, vẫn cho vào onboarding
      setView('onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async (profile: UserProfile) => {
    if (!session) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: session.user.id, 
          data: profile, 
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;
      setUserProfile(profile);
      setView('dashboard');
    } catch (error) {
      console.error("Save profile error:", error);
      alert("Lỗi lưu hồ sơ. Hãy đảm bảo bạn đã tạo bảng 'profiles' trong Supabase SQL Editor.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (profile: UserProfile) => {
    if (!session) return;
    setUserProfile(profile);
    await supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-neon border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em]">Connecting to Academy...</p>
      </div>
    );
  }

  return (
    <div className="custom-scrollbar">
      {view === 'landing' && (
        <LandingPage 
          isAuthenticated={!!session}
          onStart={() => {
            if (session) {
              setView(userProfile ? 'dashboard' : 'onboarding');
            } else {
              setView('auth');
            }
          }} 
        />
      )}
      
      {view === 'auth' && <Auth />}
      
      {view === 'onboarding' && (
        <Onboarding onComplete={handleCompleteOnboarding} />
      )}
      
      {view === 'dashboard' && userProfile && (
        <Dashboard profile={userProfile} onUpdateProfile={handleUpdateProfile} />
      )}
    </div>
  );
};

export default App;
