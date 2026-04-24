import { useState } from 'react';
import { Task, FamilyGoal } from '../types';
import { Activity, AlertTriangle, Target, X, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';

export default function ParentRadarScreen({ tasks, profilePoints, goals, onAddGoal }: { tasks: Task[], profilePoints: number, goals: FamilyGoal[], onAddGoal: (reward: string, xp: number) => void }) {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalReward, setGoalReward] = useState('Поход в аквапарк');
  const [targetXP, setTargetXP] = useState(5000);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const missedTasks = tasks.filter(t => t.status === 'active' && t.priority === 'high');
  
  const activeGoal = goals[0];

  return (
    <div className="p-5 space-y-6 pt-8 bg-[#fcfdfc] h-full animate-in fade-in overflow-y-auto pb-32">
      <div className="px-1">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest leading-none">Радар</h1>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mt-2">Мониторинг успехов: Петя</p>
      </div>

      {/* Block 1: Status */}
      <div className="bg-emerald-600 rounded-[32px] p-7 text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center gap-2 mb-6 text-white/60 font-black text-[9px] tracking-[0.2em] uppercase">
          <Activity size={14} strokeWidth={3} /> Статус активности
        </div>
        <div className="flex items-end justify-between relative z-10">
          <div className="space-y-1">
             <div className="flex items-baseline gap-1.5">
               <span className="text-4xl font-black">{completedCount}</span>
               <span className="text-xs font-black uppercase tracking-widest opacity-60">Задач</span>
             </div>
             <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-wider opacity-60">За неделю</p>
          </div>
          <div className="text-right space-y-1">
             <div className="text-2xl font-black text-yellow-300">+{profilePoints} XP</div>
             <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-wider opacity-60">Баланс</p>
          </div>
        </div>
      </div>

      {/* Block 2: Alerts */}
      <div className="space-y-4">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Сигналы</h2>
        {missedTasks.length > 0 ? (
          <div className="space-y-3">
            {missedTasks.map(t => (
              <div key={t.id} className="bg-rose-50 border border-rose-100/50 rounded-[24px] p-6 flex gap-5 items-center">
                <div className="bg-rose-100/50 p-3.5 rounded-[18px] text-rose-500 shrink-0">
                  <AlertTriangle size={22} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-rose-900 leading-tight text-[15px] truncate">{t.description}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mt-1.5">Дедлайн: {t.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100/50 rounded-[28px] p-6 flex gap-5 items-center">
             <div className="bg-emerald-100/50 p-3.5 rounded-[18px] text-emerald-600 shrink-0"><CheckCircle2 size={26} strokeWidth={2.5} /></div>
             <div>
               <h3 className="font-bold text-emerald-900 leading-tight">Всё под контролем</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-1.5">Долгов не обнаружено</p>
             </div>
          </div>
        )}
      </div>

      {/* Block 3: Interactive Call to action */}
      <button 
        onClick={() => !activeGoal && setIsGoalModalOpen(true)}
        className={`w-full bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 transition-all text-left flex items-center justify-between group active:scale-95 ${activeGoal ? 'border-emerald-100' : 'hover:border-emerald-200'}`}
      >
        <div className="flex gap-4 items-center">
          <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 transition-all ${activeGoal ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
            <Target size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-[14px] uppercase tracking-wider">{activeGoal ? 'Цель установлена' : 'Установить цель'}</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1">{activeGoal ? `Награда: ${activeGoal.reward}` : 'Нажми, чтобы договориться'}</p>
          </div>
        </div>
        {!activeGoal && <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />}
      </button>

      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-slate-100">
            <button onClick={() => setIsGoalModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Общая цель</h2>
            <p className="text-slate-500 text-sm font-semibold text-center mb-6">Договоритесь с ребенком: если он накопит <span className="text-emerald-600 font-bold bg-emerald-100 px-2 rounded">{targetXP} XP</span>, он получит следующую награду:</p>
            
            <input 
              type="text" 
              value={goalReward}
              onChange={(e) => setGoalReward(e.target.value)}
              placeholder="Например: Поход в аквапарк"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[16px] px-4 py-3.5 text-slate-800 font-bold outline-none focus:border-lime-500 focus:bg-white transition-colors text-center text-lg mb-6 shadow-inner"
            />
            
            <button onClick={() => { onAddGoal(goalReward, targetXP); setIsGoalModalOpen(false); }} className="w-full py-4 rounded-[16px] bg-lime-500 hover:bg-lime-600 text-white font-bold text-lg shadow-lg shadow-lime-500/30 transition-transform active:scale-95">
              Подтвердить цель
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
