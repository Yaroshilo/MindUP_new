import { useState } from 'react';
import { Task } from '../types';
import TaskCard from '../components/TaskCard';

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function TasksScreen({ tasks, onTaskClick }: Props) {
  const [filter, setFilter] = useState<'active' | 'review' | 'completed'>('active');
  const activeTasks = tasks.filter(t => t.status === 'active');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  let displayedTasks = activeTasks;
  if (filter === 'completed') displayedTasks = completedTasks;
  if (filter === 'review') displayedTasks = pendingTasks;

  // Render tasks sorted by nearest deadline
  const sortedTasks = [...displayedTasks].sort((a, b) => 
    (a.dateTimestamp || Number.MAX_VALUE) - (b.dateTimestamp || Number.MAX_VALUE)
  );

  return (
    <div className="p-4 space-y-6">
      <div className="mt-4 mb-2 px-2">
        <h1 className="text-3xl font-bold text-slate-800">Все задачи</h1>
        <p className="text-slate-500 font-medium mt-1">
          {filter === 'active' && `Твои открытые дела (${activeTasks.length})`}
          {filter === 'review' && `Ожидают проверки ИИ (${pendingTasks.length})`}
          {filter === 'completed' && `Уже покоренные вершины (${completedTasks.length})`}
        </p>
      </div>

      {/* Segmented Control Filter */}
      <div className="flex bg-slate-100 p-1 rounded-[20px] mb-4 shadow-inner">
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-3 text-[11px] font-bold rounded-[16px] transition-all flex items-center justify-center gap-2 ${
            filter === 'active' 
              ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          В процессе
        </button>
        <button
          onClick={() => setFilter('review')}
          className={`flex-1 py-3 text-[11px] font-bold rounded-[16px] transition-all flex items-center justify-center gap-2 ${
            filter === 'review' 
              ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Проверка
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-3 text-[11px] font-bold rounded-[16px] transition-all flex items-center justify-center gap-2 ${
            filter === 'completed' 
              ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Готово
        </button>
      </div>

      <div>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[24px] border border-emerald-100 shadow-sm animate-in fade-in duration-300">
            {filter === 'active' && (
              <>
                <div className="text-4xl mb-3">🎉</div>
                <p className="font-bold text-slate-700">Все задачи выполнены!</p>
                <p className="text-sm font-medium text-slate-500 mt-1">Отдыхай или добавь новую.</p>
              </>
            )}
            {filter === 'review' && (
              <>
                <div className="text-4xl mb-3">⏳</div>
                <p className="font-bold text-slate-700">Тут пока пусто</p>
                <p className="text-sm font-medium text-slate-500 mt-1">Ничего не ожидает проверки ИИ.</p>
              </>
            )}
            {filter === 'completed' && (
              <>
                <div className="text-4xl mb-3">🌱</div>
                <p className="font-bold text-slate-700">Тут пока пусто</p>
                <p className="text-sm font-medium text-slate-500 mt-1">Выполни задачу, чтобы она появилась здесь.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {sortedTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={onTaskClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
