
import React, { useState } from 'react';
import { Position, UserGoal, UserProfile, AssessmentResults } from '../types';
import { analyzeAssessment } from '../services/gemini';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentResults>({ 
    date: new Date().toLocaleDateString(),
    sprint100m: 15, 
    juggling: 0, 
    dribbling: 25, 
    plank: 30 
  });
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '', age: 18, position: Position.MID, goal: UserGoal.ACADEMY, weaknesses: '', 
    hoursPerWeek: 6, sessionsPerWeek: 3, currentWeek: 1, streak: 0, xp: 0, level: 1,
    stats: { technical: 50, physical: 50, tactical: 50, mental: 50, speed: 50, stamina: 50 }
  });

  const handleSubmit = async () => {
    setAnalyzing(true);
    try {
      const analysis = await analyzeAssessment(formData, assessment);
      const finalStats = analysis.stats || formData.stats;
      
      const completeProfile: UserProfile = {
        name: formData.name || 'Player',
        age: formData.age || 18,
        position: formData.position || Position.MID,
        goal: formData.goal || UserGoal.ACADEMY,
        weaknesses: formData.weaknesses || '',
        hoursPerWeek: formData.hoursPerWeek || 6,
        sessionsPerWeek: formData.sessionsPerWeek || 3,
        currentWeek: 1,
        streak: 0,
        xp: 0,
        level: analysis.level || 1,
        stats: finalStats,
        statsHistory: [{ 
          date: 'Entry', 
          overall: Math.round((finalStats.technical + finalStats.physical + finalStats.tactical + finalStats.mental + finalStats.speed + finalStats.stamina) / 6),
          technical: finalStats.technical,
          physical: finalStats.physical
        }],
        assessment: assessment,
        assessmentHistory: [assessment],
        evaluation: analysis.evaluation
      };
      
      onComplete(completeProfile);
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalyzing(false);
      alert("Hệ thống AI đang bận. Vui lòng thử lại sau vài giây.");
    }
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-brand-neon/20 rounded-full"></div>
          <div className="absolute inset-0 w-32 h-32 border-4 border-brand-neon border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mt-12 mb-4 text-white">GENERATING ACADEMY DATA...</h2>
        <p className="text-brand-neon font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">AI SCOUT IS ANALYZING YOUR PERFORMANCE</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-neon/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-md w-full bg-brand-accent/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl relative z-10">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex gap-1">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className={`h-1 w-6 rounded-full ${i <= step ? 'bg-brand-neon shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-white/10'}`}></div>
            ))}
          </div>
          <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">PHASE 0{step}</span>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-neon/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-brand-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <h2 className="text-4xl font-black italic uppercase text-white leading-none mb-2">PLAYER <span className="text-brand-neon">BIO.</span></h2>
              <p className="text-white/40 text-xs italic font-medium">Nhập thông tin cơ bản để AI thiết lập hồ sơ tuyển trạch.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest ml-1">Tên cầu thủ</label>
                <input type="text" placeholder="Họ và tên..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-neon transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest ml-1">Tuổi</label>
                <input type="number" placeholder="Tuổi hiện tại..." value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-neon transition-all" />
              </div>
            </div>
            
            <button 
              onClick={() => setStep(2)} 
              disabled={!formData.name || !formData.age} 
              className="w-full bg-brand-neon text-black font-black py-5 rounded-2xl uppercase italic shadow-xl shadow-brand-neon/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
            >
              TIẾP TỤC
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-4xl font-black italic uppercase text-white leading-none">FIELD <span className="text-brand-neon">DATA.</span></h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest ml-1">Vị trí sở trường</label>
                <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value as Position})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none appearance-none cursor-pointer hover:border-brand-neon transition-all">
                  {Object.values(Position).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest ml-1">Mục tiêu sự nghiệp</label>
                <select value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value as UserGoal})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none appearance-none cursor-pointer hover:border-brand-neon transition-all">
                  {Object.values(UserGoal).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-brand-neon text-black font-black py-5 rounded-2xl uppercase italic shadow-xl shadow-brand-neon/20 transition-all">XÁC NHẬN VỊ TRÍ</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-4xl font-black italic uppercase text-white leading-none">TRAINING <span className="text-brand-neon">PLAN.</span></h2>
            <p className="text-white/40 text-xs italic font-medium">Bạn có thể dành bao nhiêu thời gian tập luyện?</p>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-widest ml-1">Số buổi mỗi tuần</label>
                  <span className="text-brand-neon font-black italic">{formData.sessionsPerWeek} buổi</span>
                </div>
                <input 
                  type="range" min="1" max="7" step="1" 
                  value={formData.sessionsPerWeek} 
                  onChange={e => setFormData({...formData, sessionsPerWeek: parseInt(e.target.value)})}
                  className="w-full accent-brand-neon" 
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-widest ml-1">Tổng số giờ tập / tuần</label>
                  <span className="text-brand-neon font-black italic">{formData.hoursPerWeek} giờ</span>
                </div>
                <input 
                  type="range" min="1" max="20" step="1" 
                  value={formData.hoursPerWeek} 
                  onChange={e => setFormData({...formData, hoursPerWeek: parseInt(e.target.value)})}
                  className="w-full accent-brand-neon" 
                />
              </div>
              
              <div className="p-4 bg-brand-neon/5 border border-brand-neon/20 rounded-2xl">
                <p className="text-[10px] text-white/60 italic text-center">
                  Dự kiến: <span className="text-brand-neon font-bold">{Math.round((formData.hoursPerWeek! * 60) / formData.sessionsPerWeek!)} phút</span> mỗi buổi tập.
                </p>
              </div>
            </div>
            
            <button onClick={() => setStep(4)} className="w-full bg-brand-neon text-black font-black py-5 rounded-2xl uppercase italic shadow-xl shadow-brand-neon/20 transition-all">THIẾT LẬP LỊCH TẬP</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-4xl font-black italic uppercase text-white leading-none">AI <span className="text-brand-neon">DIAGNOSTICS.</span></h2>
            <div className="space-y-4">
              <label className="text-xs text-white/60 font-medium italic">"Điểm yếu nào khiến bạn mất tự tin nhất trên sân?"</label>
              <textarea value={formData.weaknesses} onChange={e => setFormData({...formData, weaknesses: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 text-white h-40 outline-none focus:border-brand-neon transition-all placeholder:text-white/10" placeholder="VD: Sút chân không thuận, tốc độ xoay sở..." />
            </div>
            <button onClick={() => setStep(5)} disabled={!formData.weaknesses} className="w-full bg-brand-neon text-black font-black py-5 rounded-2xl uppercase italic shadow-xl shadow-brand-neon/20 transition-all">PHÂN TÍCH CHUYÊN SÂU</button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-4xl font-black italic uppercase text-white leading-none">TEST <span className="text-brand-neon">RESULT.</span></h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] text-white/40 uppercase font-black block mb-2">100m (giây)</label>
                <input type="number" step="0.1" value={assessment.sprint100m} onChange={e => setAssessment({...assessment, sprint100m: parseFloat(e.target.value)})} className="w-full bg-transparent text-white font-black text-2xl outline-none" />
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] text-white/40 uppercase font-black block mb-2">Tâng bóng (số lần)</label>
                <input type="number" value={assessment.juggling} onChange={e => setAssessment({...assessment, juggling: parseInt(e.target.value)})} className="w-full bg-transparent text-white font-black text-2xl outline-none" />
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] text-white/40 uppercase font-black block mb-2">Rê bóng (giây)</label>
                <input type="number" step="0.1" value={assessment.dribbling} onChange={e => setAssessment({...assessment, dribbling: parseFloat(e.target.value)})} className="w-full bg-transparent text-white font-black text-2xl outline-none" />
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] text-white/40 uppercase font-black block mb-2">Plank (giây)</label>
                <input type="number" value={assessment.plank} onChange={e => setAssessment({...assessment, plank: parseInt(e.target.value)})} className="w-full bg-transparent text-white font-black text-2xl outline-none" />
              </div>
            </div>
            <button onClick={() => setStep(6)} className="w-full bg-brand-neon text-black font-black py-5 rounded-2xl uppercase italic shadow-xl shadow-brand-neon/20 transition-all">HOÀN TẤT HỒ SƠ</button>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-brand-neon rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(57,255,20,0.4)]">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h2 className="text-4xl font-black italic uppercase text-white leading-none">READY FOR <span className="text-brand-neon">KICKOFF?</span></h2>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-left">
              <p className="text-sm text-white/60 italic leading-relaxed">
                "Hệ thống Academy sẽ tạo cho bạn <span className="text-brand-neon font-bold uppercase">{formData.sessionsPerWeek} buổi tập</span> một tuần, mỗi buổi tập tối ưu cho vị trí <span className="text-brand-neon font-bold uppercase">{formData.position}</span> trong khoảng <span className="text-brand-neon font-bold uppercase">{Math.round((formData.hoursPerWeek! * 60) / formData.sessionsPerWeek!)} phút</span>."
              </p>
            </div>
            <button onClick={handleSubmit} className="w-full bg-brand-neon text-black font-black py-6 rounded-3xl uppercase italic shadow-2xl shadow-brand-neon/30 hover:scale-[1.02] transition-all">KHỞI TẠO ACADEMY</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
