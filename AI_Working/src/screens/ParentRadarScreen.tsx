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
    <div className="p-4 space-y-5 pt-6 bg-emerald-50/20 h-full animate-in fade-in overflow-y-auto">
      <div className="mb-2">
        <h1 className="text-3xl font-extrabold text-slate-800">Радар</h1>
        <p className="text-slate-500 font-semibold mt-1">Мониторинг успехов: Петя</p>
      </div>

      {/* Block 1: Status */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-500/20">
        <div className="flex items-center gap-2 mb-4 opacity-90 font-bold text-sm tracking-wide uppercase">
          <Activity size={18} /> Статус ребенка
        </div>
        <div className="flex items-end justify-between">
          <div>
             <div className="text-4xl font-extrabold">{completedCount} <span className="text-lg font-semibold opacity-80">задач</span></div>
             <p className="text-emerald-50 font-medium text-sm mt-1">Выполнено за неделю</p>
          </div>
          <div className="text-right">
             <div className="text-2xl font-extrabold text-yellow-300">+{profilePoints} XP</div>
             <p className="text-emerald-50 font-medium text-sm mt-1">Заработано</p>
          </div>
        </div>
      </div>

      {/* Block 2: Alerts */}
      <h2 className="text-lg font-bold text-slate-800 px-1 pt-2">Сигналы</h2>
      {missedTasks.length > 0 ? (
        <div className="space-y-3">
          {missedTasks.map(t => (
            <div key={t.id} className="bg-red-50 border-2 border-red-100 rounded-[20px] p-3 flex gap-3 items-center">
              <div className="bg-red-100 p-2 rounded-full text-red-500 shrink-0">
                <AlertTriangle size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-red-900 leading-tight text-sm truncate">{t.description}</h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Дедлайн: {t.deadline}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 border-2 border-green-100 rounded-[24px] p-4 flex gap-4 items-start">
           <div className="bg-green-100 p-2.5 rounded-full text-green-600 shrink-0"><CheckCircle2 size={20} /></div>
           <div>
             <h3 className="font-bold text-green-900 leading-tight mb-1">Дедлайны в норме</h3>
             <p className="text-xs font-bold uppercase tracking-wider text-green-600">Задолженностей не найдено</p>
           </div>
        </div>
      )}

      {/* Block 3: Interactive Call to action */}
      <button 
        onClick={() => !activeGoal && setIsGoalModalOpen(true)}
        className={`w-full bg-white rounded-[24px] p-4 shadow-sm border-2 transition-all text-left flex items-center justify-between group ${activeGoal ? 'border-lime-200 cursor-default' : 'border-slate-100 hover:border-lime-400 cursor-pointer'}`}
      >
        <div className="flex gap-3 items-center">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${activeGoal ? 'bg-lime-500 text-white' : 'bg-lime-100 text-lime-600 group-hover:scale-110'}`}>
            <Target size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-[15px]">{activeGoal ? 'Цель установлена' : 'Установить совместную цель'}</h3>
            <p className="text-[11px] font-semibold text-slate-400">{activeGoal ? `Награда: ${activeGoal.reward}` : 'Нажми, чтобы договориться о награде'}</p>
          </div>
        </div>
        {!activeGoal && <ArrowRight size={18} className="text-slate-300 group-hover:text-lime-500 transition-colors" />}
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
