
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { UserProfile } from './types';
import { supabase } from './services/supabase';

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => (
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
        BẮT ĐẦU HÀNH TRÌNH
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'landing' | 'auth' | 'onboarding' | 'dashboard'>('landing');
  const [loading, setLoading] = useState(true);

  // 1. Khởi tạo Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setUserProfile(null);
        setView('landing');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Tải Profile từ Database
  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('data')
        .eq('id', userId)
        .single();

      if (data && data.data) {
        setUserProfile(data.data as UserProfile);
        setView('dashboard');
      } else {
        setView('onboarding');
      }
    } catch (e) {
      setView('onboarding');
    } finally {
      setLoading(false);
    }
  };

  // 3. Hoàn tất Onboarding & Lưu Database
  const handleCompleteOnboarding = async (profile: UserProfile) => {
    if (!session) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: session.user.id, data: profile, updated_at: new Date() });

      if (error) throw error;
      setUserProfile(profile);
      setView('dashboard');
    } catch (error) {
      console.error("Save profile error:", error);
      alert("Không thể lưu hồ sơ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Cập nhật Profile định kỳ
  const handleUpdateProfile = async (profile: UserProfile) => {
    if (!session) return;
    setUserProfile(profile);
    await supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date() })
      .eq('id', session.user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-neon border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em]">Syncing Academy Data...</p>
      </div>
    );
  }

  return (
    <div className="custom-scrollbar">
      {view === 'landing' && (
        <LandingPage onStart={() => setView(session ? (userProfile ? 'dashboard' : 'onboarding') : 'auth')} />
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
