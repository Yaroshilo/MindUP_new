import React from 'react';
import { Task } from '../types';
import { Clock, Star, CheckCircle2, Flame } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const isCompleted = task.status === 'completed';
  const isUrgent = task.priority === 'high' && task.status === 'active';
  
  const completedSteps = task.steps ? task.steps.filter(s => s.isCompleted).length : 0;
  const totalSteps = task.steps ? task.steps.length : 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const priorityColors = {
    high: isUrgent ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700',
    medium: 'bg-orange-100 text-orange-700',
    low: 'bg-green-100 text-green-700'
  };

  const priorityLabels = {
    high: isUrgent ? 'Горящая!' : 'Высокий',
    medium: 'Средний',
    low: 'Низкий'
  };

  return (
    <div 
      onClick={() => onClick?.(task)}
      className={`bg-white rounded-[24px] p-4 border border-slate-100 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-[0_4px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:border-emerald-100 ${
        isCompleted ? 'opacity-75 bg-slate-50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Left Indicator */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${priorityColors[task.priority]} ${isUrgent ? 'animate-pulse' : ''} shadow-sm shadow-emerald-900/5`}>
             {isUrgent ? <Flame size={22} className="fill-white" /> : <Star size={22} strokeWidth={2.5} />}
          </div>
          <div className="bg-emerald-50 px-2 py-0.5 rounded-lg mt-1.5 border border-emerald-100 shadow-sm">
             <span className="text-[10px] font-black text-emerald-600">+{task.points}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 capitalize">
              {task.subject}
            </span>
            {isUrgent && (
              <span className="text-[9px] px-1.5 py-0.5 bg-rose-50 text-rose-500 font-bold uppercase rounded-md border border-rose-100">Срочно</span>
            )}
            {isCompleted && (
              <span className="text-emerald-500 font-bold text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-1 uppercase">
                <CheckCircle2 size={10} /> Гoтово
              </span>
            )}
          </div>
          <h3 className={`font-black text-[15px] leading-tight truncate tracking-tight ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {task.description}
          </h3>
          <div className="flex items-center gap-2 mt-2">
             <div className={`flex items-center gap-1 text-[11px] font-bold ${isCompleted ? 'text-slate-400' : isUrgent ? 'text-rose-500' : 'text-emerald-600/80'}`}>
               <Clock size={12} strokeWidth={3} />
               {isCompleted ? 'Завершено' : task.deadline}
             </div>
             {task.steps && task.steps.length > 0 && (
               <span className="text-[11px] font-medium text-slate-400">
                 • {task.steps.length} ш.
               </span>
             )}
          </div>
        </div>

        {/* Right Arrow/Indicator */}
        {!isCompleted && (
          <div className="shrink-0 ml-1">
            <div className="w-9 h-9 rounded-full bg-white border-[1.5px] border-slate-200 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-all duration-300 shadow-sm">
              <CheckCircle2 size={20} className="text-slate-200 group-hover:text-emerald-500 transition-all" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
