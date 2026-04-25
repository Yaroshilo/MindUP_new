import { useState } from 'react';
import { FamilyGoal, UserProfile } from '../types';
import { Trophy, Plus, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

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
    <div className="p-4 space-y-6 pt-8 animate-in fade-in">
      <div className="px-2">
         <h1 className="text-3xl font-extrabold text-slate-800">Цели и награды</h1>
         <p className="text-slate-500 font-semibold mt-1">Мотивируйте {profile.name} бонусами за XP</p>
      </div>

      {/* AI Goal Generator for Parents */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[28px] p-5 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-300 fill-yellow-300/20" />
            <h3 className="font-bold text-lg">ИИ Помощник для родителей</h3>
          </div>
          <p className="text-xs opacity-80 leading-relaxed font-medium capitalize">
            Напишите, что бы вы хотели подарить ребенку, и ИИ рассчитает справедливую цену в XP.
          </p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Напр: хочу подарить велосипед..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:bg-white/20 placeholder:text-white/50"
            />
            <button 
              onClick={handleAiSuggest}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-800/50 text-indigo-900 w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-lg active:scale-95"
            >
              {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            </button>
          </div>
        </div>
      </div>

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="w-full bg-lime-50 text-lime-700 hover:bg-lime-100 transition-colors rounded-[24px] p-5 border-2 border-lime-200/50 border-dashed flex flex-col items-center justify-center gap-2 font-bold shadow-sm active:scale-95">
          <Plus size={28} />
          Создать новую цель вручную
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-[28px] p-6 shadow-xl border border-emerald-100">
           <h3 className="font-bold text-slate-800 text-lg mb-4">Настройка цели</h3>
           
           <div className="space-y-4">
             <div>
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Награда</label>
               <input type="text" value={reward} onChange={(e) => setReward(e.target.value)} placeholder="Поход в кино, новая игра..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-[16px] px-4 py-3 font-bold text-slate-700 outline-none focus:border-lime-500" />
             </div>
             
             <div>
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Майлстоун (XP)</label>
               <div className="flex items-center gap-2">
                 <input type="number" value={targetXP} onChange={(e) => setTargetXP(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[16px] px-4 py-3 font-bold text-slate-700 outline-none focus:border-lime-500" />
                 <span className="font-extrabold text-slate-400 bg-slate-100 px-4 py-3 rounded-[16px]">XP</span>
               </div>
             </div>

             <div className="flex gap-2 pt-2">
               <button onClick={() => setIsOpen(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-[16px] active:scale-95 transition-transform">Отмена</button>
               <button 
                 onClick={() => { 
                   if(reward.trim()) { 
                     onAddGoal(reward, targetXP);
                     setReward('');
                     setTargetXP(5000);
                     setIsOpen(false);
                   }
                 }} 
                 className="flex-1 bg-lime-500 text-white font-bold py-3 rounded-[16px] shadow-lg shadow-lime-200 active:scale-95 transition-transform"
               >
                 Сохранить
               </button>
             </div>
           </div>
        </div>
      )}

      <div className="space-y-4 pb-8">
        <h3 className="text-lg font-bold text-slate-800 px-2 mt-4">Активные цели</h3>
        {goals.length === 0 && !isOpen && (
          <p className="text-slate-400 text-center text-sm font-semibold mt-8">Нет установленных целей</p>
        )}
        
        {goals.map(goal => {
          const progress = Math.min((profile.totalXP / goal.targetXP) * 100, 100);
          const isCompleted = progress >= 100;
          return (
            <div key={goal.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-emerald-100 flex flex-col gap-4 relative overflow-hidden">
               {isCompleted && <div className="absolute inset-0 bg-lime-50/50 z-0"></div>}
               <div className="flex justify-between items-start z-10">
                 <div className="flex items-center gap-3">
                   <div className={`${isCompleted ? 'bg-lime-500 text-white' : 'bg-lime-100 text-lime-600'} p-3 rounded-full transition-colors`}>
                     {isCompleted ? <CheckCircle2 size={24} /> : <Trophy size={24} />}
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-800 text-[17px] leading-tight">{goal.reward}</h4>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Цель: {goal.targetXP} XP</p>
                   </div>
                 </div>
               </div>

               <div className="space-y-1.5 z-10">
                 <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-500">Прогресс {profile.name}</span>
                   <span className={isCompleted ? 'text-lime-600' : 'text-slate-600'}>{profile.totalXP} / {goal.targetXP}</span>
                 </div>
                 <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.5)]' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                 </div>
               </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
