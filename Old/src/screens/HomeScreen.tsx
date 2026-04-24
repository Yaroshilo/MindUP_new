import { UserProfile, Task, FamilyGoal } from '../types';
import TaskCard from '../components/TaskCard';
import { Target, SearchCheck, Trophy } from 'lucide-react';

interface Props {
  profile: UserProfile;
  tasks: Task[];
  goals: FamilyGoal[];
  onChangeTab: (tab: string) => void;
  onTaskClick: (task: Task) => void;
}

export default function HomeScreen({ profile, tasks, goals, onChangeTab, onTaskClick }: Props) {
  const nextLevel = profile.nextLevelPoints || 1000;
  const progress = (profile.points / nextLevel) * 100;
  
  const activeTasks = tasks.filter(t => t.status === 'active');
  const sortedActiveTasks = [...activeTasks].sort((a, b) => 
    (a.dateTimestamp || Number.MAX_VALUE) - (b.dateTimestamp || Number.MAX_VALUE)
  );

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const totalTasksCount = tasks.length || 1;
  const dayProgress = (completedTasksCount / totalTasksCount) * 100;

  // Find urgent task (closest deadline)
  const urgentTask = sortedActiveTasks[0];

  const pluralizeTasks = (count: number) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `${count} задач`;
    if (lastDigit === 1) return `${count} задача`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${count} задачи`;
    return `${count} задач`;
  };

  const getStatInfo = (count: number, type: 'active' | 'pending') => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    let label = '';
    
    if (type === 'active') {
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) label = 'задач в деле';
      else if (lastDigit === 1) label = 'задача в деле';
      else if (lastDigit >= 2 && lastDigit <= 4) label = 'задачи в деле';
      else label = 'задач в деле';
    } else {
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) label = 'на проверке';
      else if (lastDigit === 1) label = 'на проверке';
      else if (lastDigit >= 2 && lastDigit <= 4) label = 'на проверке';
      else label = 'на проверке';
    }
    
    return { count, label };
  };

  return (
    <div className="p-5 space-y-7 pt-8 bg-[#fcfdfc] animate-in fade-in pb-32">
      {/* Header Block with XP */}
      <div className="bg-emerald-600 rounded-[32px] p-7 text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div className="flex flex-col gap-2.5">
              <div className="bg-white/20 self-start h-6 inline-flex items-center px-2.5 rounded-lg backdrop-blur-md border border-white/10 uppercase font-black text-[7px] tracking-widest text-white shadow-sm">
                {profile.role === 'student' ? 'Ученик' : profile.role === 'teacher' ? 'Учитель' : 'Родитель'}
              </div>
              <h2 className="text-4xl font-black leading-none">{profile.level}</h2>
              <h1 className="text-sm font-bold opacity-80 mt-1">Привет, {profile.name}!</h1>
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-100/60">
                <span>Прогресс уровня</span>
                <span className="text-white">{profile.points} <span className="opacity-40">/</span> {profile.nextLevelPoints} XP</span>
              </div>
              <div className="h-3 w-full bg-emerald-900/20 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-1000 ease-out relative" 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-white/20"></div>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-black/10 p-5 rounded-[24px] border border-white/5 shadow-inner">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-emerald-100/80 mb-1">
                <span>Успеваемость сегодня</span>
                <span className="text-white">{completedTasksCount} <span className="opacity-40">из</span> {tasks.length}</span>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-700 ease-in-out" 
                  style={{ width: `${dayProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(() => {
          const active = getStatInfo(activeTasks.length, 'active');
          const pending = getStatInfo(pendingTasks.length, 'pending');
          
          return (
            <>
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 flex flex-col gap-5 group hover:border-emerald-100 transition-all">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                  <Target size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800 leading-none mb-1">{active.count}</div>
                  <div className="text-[11px] font-bold text-slate-400 leading-none">{active.label}</div>
                </div>
              </div>
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 flex flex-col gap-5 group hover:border-indigo-100 transition-all">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                  <SearchCheck size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800 leading-none mb-1">{pending.count}</div>
                  <div className="text-[11px] font-bold text-slate-400 leading-none">{pending.label}</div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Family Goals Section */}
      {goals.length > 0 && (
        <div className="pt-2">
          <h3 className="text-lg font-bold text-slate-800 px-2 mb-3">Совместная цель</h3>
          {goals.map(goal => {
            const goalProgress = Math.min((profile.totalXP / goal.targetXP) * 100, 100);
            const isCompleted = goalProgress >= 100;
            return (
              <div key={goal.id} className="bg-gradient-to-br from-lime-500 to-emerald-500 rounded-[24px] p-4 text-white shadow-lg shadow-lime-500/20 mb-3 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-sm">
                    <Trophy size={14} /> {goal.reward}
                  </div>
                  <span className="font-extrabold text-xs">{profile.totalXP} / {goal.targetXP} XP</span>
                </div>
                
                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5 relative z-10">
                  <div 
                    className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-1000 ease-out" 
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Urgent Task */}
      {urgentTask && (
        <div className="pb-4">
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Ближайшая задача
              </h3>
            </div>
            <button onClick={() => onChangeTab('tasks')} className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
              Все
            </button>
          </div>
          <TaskCard 
            task={urgentTask} 
            onClick={onTaskClick}
          />
        </div>
      )}
    </div>
  );
}
