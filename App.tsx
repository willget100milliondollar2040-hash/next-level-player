
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserProfile } from './types';

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="relative min-h-screen flex flex-col items-center justify-center bg-brand-black overflow-hidden">
    <div className="absolute inset-0 opacity-20">
      <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="" />
    </div>
    <div className="relative z-10 text-center px-6">
      <div className="inline-block px-4 py-1 bg-brand-neon/10 border border-brand-neon/30 rounded-full mb-6">
        <span className="text-brand-neon text-[10px] font-black uppercase tracking-[0.3em]">Direct Access Mode (Test)</span>
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
  const [view, setView] = useState<'landing' | 'onboarding' | 'dashboard'>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Load profile từ localStorage nếu có để giữ data khi refresh trong lúc test
  useEffect(() => {
    const savedProfile = localStorage.getItem('nextlevel_test_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setUserProfile(parsed);
      } catch (e) {
        console.error("Lỗi load profile test:", e);
      }
    }
  }, []);

  const handleCompleteOnboarding = (profile: UserProfile) => {
    setLoading(true);
    // Giả lập delay lưu trữ
    setTimeout(() => {
      setUserProfile(profile);
      localStorage.setItem('nextlevel_test_profile', JSON.stringify(profile));
      setView('dashboard');
      setLoading(false);
    }, 1000);
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('nextlevel_test_profile', JSON.stringify(profile));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-neon border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em]">Processing Academy Data...</p>
      </div>
    );
  }

  return (
    <div className="custom-scrollbar">
      {view === 'landing' && (
        <LandingPage 
          onStart={() => setView(userProfile ? 'dashboard' : 'onboarding')} 
        />
      )}
      
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
