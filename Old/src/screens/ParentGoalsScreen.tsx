import { useState } from 'react';
import { FamilyGoal, UserProfile } from '../types';
import { Trophy, Plus, CheckCircle2, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function ParentGoalsScreen({ goals, profile, onAddGoal }: { goals: FamilyGoal[], profile: UserProfile, onAddGoal: (reward: string, xp: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reward, setReward] = useState('');
  const [targetXP, setTargetXP] = useState(5000);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiSuggest = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    
    // Demo logic for AI goal suggestion
    setTimeout(() => {
      const promptLower = aiPrompt.toLowerCase();
      if (promptLower.includes('велосипед') || promptLower.includes('велик')) {
        setReward('Новый велосипед 🚲');
        setTargetXP(15000);
      } else if (promptLower.includes('кино') || promptLower.includes('фильм')) {
        setReward('Поход в кино на выходных 🍿');
        setTargetXP(1500);
      } else if (promptLower.includes('робокс') || promptLower.includes('игр')) {
        setReward('Премиум подписка на игру 🎮');
        setTargetXP(3000);
      } else {
        setReward(aiPrompt.trim() + ' 🎁');
        setTargetXP(5000);
      }
      setIsAiLoading(false);
      setAiPrompt('');
      if (!isOpen) setIsOpen(true);
    }, 1200);
  };

  return (
    <div className="p-5 space-y-6 pt-8 bg-[#fcfdfc] animate-in fade-in pb-32 overflow-y-auto h-full">
      <div className="px-1">
         <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest leading-none">Цели</h1>
         <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 px-0.5">Мотивируйте ребёнка за успехи</p>
      </div>

      {/* AI Goal Generator for Parents */}
      <div className="bg-emerald-600 rounded-[32px] p-6 shadow-xl shadow-emerald-500/10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} strokeWidth={2.5} className="text-yellow-300" />
            <h3 className="font-black text-xs uppercase tracking-[0.2em]">Умные рекомендации</h3>
          </div>
          <p className="text-xs text-emerald-50/80 leading-relaxed font-medium">
            Напишите, что бы вы хотели подарить ребёнку, и ИИ предложит справедливую цену в XP.
          </p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Новый самокат..."
              className="flex-1 bg-white/20 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white/30 placeholder:text-white/60 transition-all text-white"
            />
            <button 
              onClick={handleAiSuggest}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="bg-white text-emerald-600 hover:bg-emerald-50 disabled:bg-white/10 disabled:text-white/30 w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-lg active:scale-90 shrink-0"
            >
              {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="w-full bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all rounded-[28px] p-6 border border-slate-100 border-dashed flex flex-col items-center justify-center gap-3 active:scale-95 group">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:border-emerald-100 transition-all">
            <Plus size={24} strokeWidth={3} className="text-slate-300 group-hover:text-emerald-500" />
          </div>
          <span className="font-bold text-xs px-2">Новая цель вручную</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
           <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest mb-5 px-1">Настройка цели</h3>
           
           <div className="space-y-4">
             <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Награда</label>
               <input type="text" value={reward} onChange={(e) => setReward(e.target.value)} placeholder="Поход в кино, новая игра..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-400 transition-all shadow-sm" />
             </div>
             
             <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Порог (XP)</label>
               <div className="flex items-center gap-3">
                 <input type="number" value={targetXP} onChange={(e) => setTargetXP(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-400 transition-all shadow-sm" />
                 <span className="font-black text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-5 py-4 rounded-2xl uppercase tracking-widest">XP</span>
               </div>
             </div>

             <div className="flex gap-3 pt-4">
               <button onClick={() => setIsOpen(false)} className="flex-1 bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-widest py-4 rounded-2xl active:scale-95 transition-all">Отмена</button>
               <button 
                 onClick={() => { 
                   if(reward.trim()) { 
                     onAddGoal(reward, targetXP);
                     setReward('');
                     setTargetXP(5000);
                     setIsOpen(false);
                   }
                 }} 
                 className="flex-1 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
               >
                 Создать
               </button>
             </div>
           </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Текущие цели</h3>
        {goals.length === 0 && !isOpen && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-300">
            <Trophy size={48} strokeWidth={1} className="opacity-20 mb-4" />
            <p className="text-[11px] font-black uppercase tracking-widest">Активных целей нет</p>
          </div>
        )}
        
        {goals.map(goal => {
          const progress = Math.min((profile.totalXP / goal.targetXP) * 100, 100);
          const isCompleted = progress >= 100;
          return (
            <div key={goal.id} className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 flex flex-col gap-5 relative overflow-hidden transition-all hover:border-emerald-100 group">
               {isCompleted && <div className="absolute inset-0 bg-emerald-50/30 z-0"></div>}
               <div className="flex justify-between items-start z-10">
                 <div className="flex items-center gap-4">
                   <div className={`${isCompleted ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-50 text-emerald-600'} w-14 h-14 rounded-[20px] flex items-center justify-center transition-all shrink-0 shadow-inner group-hover:scale-105`}>
                     {isCompleted ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Trophy size={28} strokeWidth={2.5} />}
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-800 text-lg leading-tight tracking-tight">{goal.reward}</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                       <Trophy size={10} className="text-emerald-500" /> Порог: {goal.targetXP} XP
                     </p>
                   </div>
                 </div>
               </div>

               <div className="space-y-2 z-10">
                 <div className="flex justify-between items-end mb-1">
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Прогресс обучения</span>
                   <span className={`text-xs font-black tracking-tight ${isCompleted ? 'text-emerald-600' : 'text-slate-700'}`}>
                     {profile.totalXP} <span className="text-slate-300 font-bold">/</span> {goal.targetXP}
                   </span>
                 </div>
                 <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner">
                   <div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isCompleted ? 'bg-emerald-500' : 'bg-emerald-400'}`} style={{ width: `${progress}%` }}>
                      {progress > 10 && (
                        <div className="absolute top-0 right-0 w-4 h-full bg-white/20 blur-sm"></div>
                      )}
                   </div>
                 </div>
               </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
