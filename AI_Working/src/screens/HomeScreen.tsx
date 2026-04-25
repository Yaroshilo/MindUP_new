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
  const progress = (profile.points / profile.nextLevelPoints) * 100;
  
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

  return (
    <div className="p-4 space-y-6 pt-6 animate-in fade-in">
      {/* Header Block with XP */}
      <div className="bg-emerald-500 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/30 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-sm font-semibold opacity-80 uppercase tracking-widest mb-1">Привет, {profile.name}!</h1>
              <h2 className="text-[28px] font-bold leading-none">{profile.level}</h2>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/10 uppercase font-black text-xs tracking-tighter italic">
              {profile.role === 'student' ? 'Student' : profile.role === 'teacher' ? 'Teacher' : 'Parent'}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-widest opacity-60">
                <span>Уровень {profile.level}</span>
                <span>{profile.points} / {profile.nextLevelPoints} XP</span>
              </div>
              <div className="h-2 w-full bg-emerald-900/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 bg-white/10 p-4 rounded-[24px] backdrop-blur-sm border border-white/10">
              <div className="flex justify-between text-[11px] font-bold">
                <span>Прогресс дня</span>
                <span>{completedTasksCount} / {tasks.length} задач</span>
              </div>
              <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-lime-300 to-green-300 rounded-full transition-all duration-700 ease-in-out" 
                  style={{ width: `${dayProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Widgets */}
      <div className="flex flex-col gap-3">
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-emerald-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
            <Target size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">В деле</div>
            <div className="text-lg font-bold text-slate-800">{activeTasks.length} задачи</div>
          </div>
          <div className="text-blue-500 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold">Активные</div>
        </div>
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-emerald-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-lime-100 text-lime-600 rounded-2xl flex items-center justify-center shrink-0">
            <SearchCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Проверка</div>
            <div className="text-lg font-bold text-slate-800">{pendingTasks.length} на проверке</div>
          </div>
          <div className="text-lime-600 bg-lime-50 px-3 py-1 rounded-full text-xs font-bold">ИИ Ждёт</div>
        </div>
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
