
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, TrainingSession, ChatMessage, Exercise, UserStats } from '../types';
import PlayerRadar from './RadarChart';
import PerformanceTrends from './PerformanceTrends';
import { generatePersonalizedPlan, getCoachChatResponse } from '../services/gemini';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

const calculateOverall = (s: UserStats) => {
  return Math.round((s.technical + s.physical + s.tactical + s.mental + s.speed + s.stamina) / 6);
};

const mergeStats = (oldStats: UserStats, newStats: UserStats): UserStats => {
  return {
    technical: Math.max(oldStats.technical, newStats.technical),
    physical: Math.max(oldStats.physical, newStats.physical),
    tactical: Math.max(oldStats.tactical, newStats.tactical),
    mental: Math.max(oldStats.mental, newStats.mental),
    speed: Math.max(oldStats.speed, newStats.speed),
    stamina: Math.max(oldStats.stamina, newStats.stamina),
  };
};

const TrainingModal: React.FC<{ 
  session: TrainingSession; 
  onClose: () => void;
  onComplete: () => void;
}> = ({ session, onClose, onComplete }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const toggleExercise = (idx: number) => {
    setCompleted(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const exercise = session.exercises[activeIdx];
  const progress = Math.round((completed.length / session.exercises.length) * 100);
  const phases = ["Khởi động", "Tập chính", "Tập bổ trợ", "Thể lực"];

  return (
    <div className="fixed inset-0 z-[100] bg-brand-black/98 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="max-w-6xl w-full h-[90vh] bg-brand-accent rounded-[3rem] border border-white/10 flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-full md:w-80 border-r border-white/5 bg-brand-dark/50 flex flex-col">
          <div className="p-8 border-b border-white/5">
            <button onClick={onClose} className="text-white/20 hover:text-white mb-6 flex items-center gap-2 uppercase font-black text-[9px] tracking-widest transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
              ESC SESSION
            </button>
            <h2 className="text-2xl font-black italic uppercase text-brand-neon leading-tight mb-4 tracking-tighter">{session.title}</h2>
            <div className="bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-brand-neon shadow-[0_0_15px_rgba(57,255,20,0.8)] transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {phases.map(phase => {
              const phaseExercises = session.exercises.map((ex, i) => ({ ...ex, originalIndex: i })).filter(ex => ex.phase === phase);
              if (phaseExercises.length === 0) return null;
              return (
                <div key={phase} className="space-y-2">
                  <h3 className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em] ml-4">{phase}</h3>
                  {phaseExercises.map((ex) => (
                    <button key={ex.originalIndex} onClick={() => setActiveIdx(ex.originalIndex)} className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 ${activeIdx === ex.originalIndex ? 'bg-brand-neon/10 border border-brand-neon/30 shadow-[inset_0_0_20px_rgba(57,255,20,0.05)]' : 'border border-transparent hover:bg-white/5'}`}>
                      <div onClick={(e) => { e.stopPropagation(); toggleExercise(ex.originalIndex); }} className={`w-5 h-5 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${completed.includes(ex.originalIndex) ? 'bg-brand-neon border-brand-neon' : 'border-white/10'}`}>
                        {completed.includes(ex.originalIndex) && <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                      </div>
                      <div className="truncate">
                        <p className={`text-[12px] font-black italic uppercase truncate ${activeIdx === ex.originalIndex ? 'text-brand-neon' : 'text-white/60'}`}>{ex.name}</p>
                        <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">{ex.reps}</p>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="p-8 border-t border-white/5">
            <button onClick={onComplete} disabled={completed.length === 0} className="w-full py-5 bg-brand-neon text-black font-black uppercase italic rounded-2xl shadow-xl shadow-brand-neon/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">FINISH SESSION</button>
          </div>
        </div>
        <div className="flex-1 p-8 md:p-16 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-neon/10 via-transparent to-transparent">
          <div className="max-w-3xl space-y-10">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1 bg-brand-neon/10 text-brand-neon font-black uppercase tracking-[0.2em] text-[10px] rounded-full border border-brand-neon/20">{exercise.phase}</span>
              <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none">{exercise.name}</h1>
            </div>
            <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8 backdrop-blur-md">
              <div className="space-y-4">
                <h3 className="text-white/40 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  SCOUT INSTRUCTIONS
                </h3>
                <p className="text-2xl text-white/90 leading-tight italic font-bold">"{exercise.description}"</p>
              </div>
              <div className="pt-8 border-t border-white/5 flex gap-12">
                <div>
                  <span className="text-[10px] font-black uppercase text-white/20 block mb-2 tracking-widest">Reps / Time</span>
                  <span className="text-brand-neon font-black text-4xl italic tracking-tighter">{exercise.reps}</span>
                </div>
              </div>
            </div>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtubeQuery)}`} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-6 w-full py-8 bg-brand-black border border-white/10 hover:border-brand-neon/50 text-white font-black uppercase italic rounded-[2rem] transition-all shadow-2xl hover:scale-[1.02]">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
              </div>
              WATCH PRO PERFORMANCE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const CoachChat: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: `Chào ${profile.name}! Scout Report của bạn đã có. Bạn cần cải thiện kỹ năng nào trước?` }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    try {
      const response = await getCoachChatResponse(profile, messages, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Hệ thống Academy đang quá tải, vui lòng chờ giây lát!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      {isOpen ? (
        <div className="w-80 md:w-96 h-[550px] bg-brand-accent/95 border border-white/10 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 backdrop-blur-3xl">
          <div className="p-6 bg-brand-neon flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-black rounded-full animate-ping"></div>
              <span className="text-black font-black italic uppercase text-[10px] tracking-widest">PRO SCOUT LIVE</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-black/40 hover:text-black transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-5 rounded-3xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-brand-neon text-black font-black shadow-lg shadow-brand-neon/10' : 'bg-white/5 text-white/80 border border-white/5 italic'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex gap-1 animate-pulse">
                  <div className="w-1 h-1 bg-brand-neon rounded-full"></div>
                  <div className="w-1 h-1 bg-brand-neon rounded-full"></div>
                  <div className="w-1 h-1 bg-brand-neon rounded-full"></div>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-white/5 flex gap-3 bg-brand-black/40">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Hỏi Coach kỹ thuật..." className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-brand-neon transition-all" />
            <button onClick={handleSend} disabled={isTyping} className="p-4 bg-brand-neon rounded-2xl text-black shadow-xl shadow-brand-neon/20 hover:scale-110 active:scale-90 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-20 h-20 bg-brand-neon rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(57,255,20,0.5)] hover:scale-110 active:scale-90 transition-all duration-500 group">
          <svg className="w-10 h-10 group-hover:rotate-12 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        </button>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string | number, trend?: string, color?: string }> = ({ label, value, trend, color = 'brand-neon' }) => (
  <div className="bg-brand-accent/50 border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-brand-neon/30 transition-all shadow-xl">
    <div className={`absolute top-0 left-0 w-1 h-full bg-${color} opacity-50`}></div>
    <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-2">{label}</p>
    <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
    {trend && <p className="text-[10px] font-black text-brand-neon mt-2 flex items-center gap-1 uppercase"> {trend}</p>}
  </div>
);

const Dashboard: React.FC<Props> = ({ profile, onUpdateProfile }) => {
  const [sessions, setSessions] = useState<TrainingSession[]>(profile.currentSessions || []);
  const [loadingPlan, setLoadingPlan] = useState(!profile.currentSessions || profile.currentSessions.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [showReview, setShowReview] = useState(false);

  const stats = profile.stats || { technical: 50, physical: 50, tactical: 50, mental: 50, speed: 50, stamina: 50 };
  const overallRating = calculateOverall(stats);

  const fetchPlan = async () => {
    if (profile.currentSessions && profile.currentSessions.length > 0) {
      setSessions(profile.currentSessions);
      setLoadingPlan(false);
      return;
    }

    setLoadingPlan(true);
    setError(null);
    try {
      const result = await generatePersonalizedPlan(profile);
      setSessions(result.sessions);
      onUpdateProfile({ ...profile, currentSessions: result.sessions });
    } catch (err: any) {
      console.error(err);
      setError("HLV đang soạn giáo án...");
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [profile.currentWeek]);

  const handleFinishWeek = async (feedback: string) => {
    setShowReview(false);
    setLoadingPlan(true);
    setError(null);
    try {
      const result = await generatePersonalizedPlan(profile, feedback);
      const safeStats = mergeStats(profile.stats, result.updatedStats);
      const newOverall = calculateOverall(safeStats);
      
      const nextWeekProfile: UserProfile = { 
        ...profile, 
        currentWeek: (profile.currentWeek || 1) + 1, 
        streak: (profile.streak || 0) + 1,
        stats: safeStats,
        evaluation: result.evaluation,
        currentSessions: result.sessions,
        statsHistory: [
          ...(profile.statsHistory || []),
          { 
            date: `W${profile.currentWeek}`, 
            overall: newOverall,
            technical: safeStats.technical,
            physical: safeStats.physical
          }
        ]
      };
      
      setSessions(result.sessions);
      onUpdateProfile(nextWeekProfile);
    } catch (err: any) {
      console.error(err);
      setError("Lỗi cập nhật. Thử lại.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const toggleSessionComplete = (id: string) => {
    const updatedSessions = sessions.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    setSessions(updatedSessions);
    onUpdateProfile({ ...profile, currentSessions: updatedSessions });
  };

  const isWeekComplete = sessions.length > 0 && sessions.every(s => s.completed);

  return (
    <div className="min-h-screen bg-brand-black p-6 md:p-12 custom-scrollbar relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-neon/5 blur-[120px] pointer-events-none"></div>
      
      <CoachChat profile={profile} />

      {showReview && (
        <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-brand-accent p-12 rounded-[3.5rem] border border-brand-neon/20 text-center space-y-10 shadow-2xl">
            <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none">END OF WEEK {profile.currentWeek}</h2>
            <div className="space-y-4">
              <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block">HLV muốn nghe cảm nhận của bạn:</label>
              <textarea autoFocus className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-6 text-white h-40 outline-none focus:border-brand-neon transition-all italic text-sm" placeholder="VD: Bài tập thể lực hơi nặng, rê bóng ổn hơn..." id="weekly-feedback" />
            </div>
            <button onClick={() => handleFinishWeek((document.getElementById('weekly-feedback') as HTMLTextAreaElement).value)} className="w-full py-6 bg-brand-neon text-black font-black uppercase italic rounded-3xl shadow-2xl shadow-brand-neon/30 hover:scale-[1.02] active:scale-95 transition-all">NEXT WEEK PLAN →</button>
          </div>
        </div>
      )}

      {activeSession && (
        <TrainingModal 
          session={activeSession} 
          onClose={() => setActiveSession(null)}
          onComplete={() => { toggleSessionComplete(activeSession.id); setActiveSession(null); }}
        />
      )}
      
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-neon rounded-2xl flex items-center justify-center text-black font-black text-xl italic shadow-xl shadow-brand-neon/20">NL</div>
              <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">Elite Player Portal v2.5</p>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none text-white">
              {profile.name.split(' ')[0]} <span className="text-brand-neon">ACADEMY.</span>
            </h1>
          </div>
          <div className="flex items-center gap-10 bg-brand-accent/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5">
            <div className="text-center">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Overall</p>
              <p className="text-5xl font-black italic text-brand-neon tracking-tighter">{overallRating}</p>
            </div>
            <div className="h-12 w-[1px] bg-white/10"></div>
            <div className="text-center">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Academy LVL</p>
              <p className="text-5xl font-black italic text-white tracking-tighter">{profile.level || 1}</p>
            </div>
            <div className="h-12 w-[1px] bg-white/10"></div>
            <div className="text-center">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Streak</p>
              <p className="text-5xl font-black italic text-white tracking-tighter">{profile.streak || 0}d</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-brand-accent/50 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg className="w-32 h-32 text-brand-neon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              </div>
              <h3 className="text-sm font-black italic uppercase tracking-widest text-brand-neon mb-8">Scout Radar Analysis</h3>
              <PlayerRadar stats={stats} />
            </div>

            <div className="bg-brand-accent/50 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl">
              <h3 className="text-sm font-black italic uppercase tracking-widest text-white/40 mb-6">Performance Trends</h3>
              <PerformanceTrends history={profile.statsHistory || []} />
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard label="Weekly Target" value={`${profile.sessionsPerWeek} Buổi`} trend={`${profile.hoursPerWeek} Giờ / Tuần`} />
              <MetricCard label="Current Position" value={profile.position} trend="Primary Role" color="white" />
              <MetricCard label="Session Duration" value={`${Math.round((profile.hoursPerWeek * 60) / profile.sessionsPerWeek)} Min`} trend="Average / Session" color="brand-neon" />
            </div>

            <div className="bg-brand-accent/50 border border-white/5 rounded-[3.5rem] p-12 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                  <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none mb-2">Training <span className="text-brand-neon">Grounds.</span></h2>
                  <p className="text-white/40 text-xs font-black uppercase tracking-widest">Week {profile.currentWeek} • {sessions.filter(s => s.completed).length}/{sessions.length} Completed</p>
                </div>
                {isWeekComplete && (
                  <button onClick={() => setShowReview(true)} className="bg-brand-neon text-black font-black px-8 py-4 rounded-full uppercase italic shadow-xl shadow-brand-neon/20 hover:scale-105 transition-all">
                    COMPLETE WEEK {profile.currentWeek}
                  </button>
                )}
              </div>

              {loadingPlan ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 border-4 border-brand-neon border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-brand-neon font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Designing Weekly Sessions...</p>
                </div>
              ) : error ? (
                <div className="py-20 text-center space-y-6">
                  <p className="text-white/40 font-black italic uppercase tracking-widest">{error}</p>
                  <button onClick={fetchPlan} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all">Retry Link</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className={`group relative bg-brand-black/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:border-brand-neon/30 hover:bg-brand-black/60 ${session.completed ? 'opacity-60 border-brand-neon/20' : ''}`}>
                      <div className="flex items-center gap-8 w-full md:w-auto">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black italic text-xl shadow-2xl transition-all ${session.completed ? 'bg-brand-neon text-black' : 'bg-brand-accent text-white group-hover:bg-brand-neon group-hover:text-black'}`}>
                          {session.completed ? (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                          ) : 'GO'}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-1">{session.type} • {session.duration} mins</p>
                          <h4 className="text-2xl font-black italic uppercase text-white tracking-tighter group-hover:text-brand-neon transition-all">{session.title}</h4>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveSession(session)}
                        className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all ${session.completed ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-brand-neon/10 text-brand-neon border border-brand-neon/30 hover:bg-brand-neon hover:text-black shadow-lg shadow-brand-neon/5'}`}
                      >
                        {session.completed ? 'REWATCH DATA' : 'START SESSION'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-brand-neon/5 border border-brand-neon/10 rounded-[3.5rem] p-12 backdrop-blur-md">
              <div className="flex items-start gap-8">
                <div className="w-20 h-20 shrink-0 bg-brand-neon rounded-full flex items-center justify-center shadow-2xl shadow-brand-neon/20">
                  <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">AI Scout Evaluation</h3>
                  <p className="text-white/70 italic text-sm leading-relaxed font-medium">
                    "{profile.evaluation || "Đang phân tích hiệu suất tuần trước của bạn. Hãy hoàn thành các buổi tập để nhận báo cáo tuyển trạch chuyên sâu."}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
