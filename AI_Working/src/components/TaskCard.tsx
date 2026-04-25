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
      className={`bg-white rounded-[24px] p-4 border-2 text-left transition-all active:scale-[0.98] cursor-pointer group ${
        isUrgent ? 'border-red-400 shadow-[0_8px_25px_rgba(248,113,113,0.2)]' : 'border-slate-100 shadow-sm hover:shadow-md'
      } ${isCompleted ? 'opacity-75 bg-slate-50' : ''}`}
    >
      <div className="flex items-center gap-4">
        {/* Left Indicator */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${priorityColors[task.priority]} ${isUrgent ? 'animate-pulse' : ''}`}>
             {isUrgent ? <Flame size={20} className="fill-white" /> : <Star size={20} />}
          </div>
          <span className="text-[10px] font-extrabold text-lime-700 mt-1">+{task.points}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {task.subject}
            </span>
            {isCompleted && (
              <span className="text-lime-500 font-bold text-[10px] bg-lime-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 size={10} /> Готoво
              </span>
            )}
          </div>
          <h3 className={`font-bold text-base leading-[1.2] truncate ${isUrgent ? 'text-red-500' : isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {task.description}
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <div className={`flex items-center gap-1 text-[11px] font-bold ${isCompleted ? 'text-slate-400' : isUrgent ? 'text-red-400' : 'text-emerald-500'}`}>
               <Clock size={12} strokeWidth={2.5} />
               {isCompleted ? 'Завершено' : task.deadline}
             </div>
             {task.steps && task.steps.length > 0 && (
               <span className="text-[11px] font-bold text-slate-400 opacity-60">
                 • {task.steps.length} ш.
               </span>
             )}
          </div>
        </div>

        {/* Right Arrow/Indicator (Optional but nice for lists) */}
        {!isCompleted && (
          <div className="shrink-0 text-slate-300">
            <CheckCircle2 size={24} className="group-hover:text-emerald-400 transition-colors opacity-20 group-hover:opacity-100" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
