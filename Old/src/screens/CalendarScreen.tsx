import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Task, FamilyGoal } from '../types';
import './CalendarStyles.css'; // Importing custom styles

interface Props {
  role: 'student' | 'teacher' | 'parent';
  tasks: Task[];
  goals: FamilyGoal[];
}

export default function CalendarScreen({ role, tasks, goals }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const isSameDay = (d1: Date, timestamp?: number) => {
    if (!timestamp) return false;
    const d2 = new Date(timestamp);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const filteredTasks = tasks.filter(task => isSameDay(selectedDate, task.dateTimestamp));

  return (
    <div className="p-6 bg-[#fcfdfc] min-h-screen">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <CalendarIcon className="text-emerald-500" />
        {role === 'student' ? 'Мое расписание' : role === 'teacher' ? 'Учебный план' : 'Календарь семьи'}
      </h2>

      <div className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
        <Calendar 
          className="w-full border-none font-sans" 
          onChange={(value) => setSelectedDate(value as Date)}
          value={selectedDate}
          locale="ru-RU"
          formatDay={(locale, date) => date.getDate().toString()}
          nextLabel={<ChevronRight size={20} className="text-emerald-600" />}
          prevLabel={<ChevronLeft size={20} className="text-emerald-600" />}
          next2Label={null}
          prev2Label={null}
          tileClassName="h-12 text-sm font-bold text-slate-600 hover:bg-emerald-50 rounded-2xl flex items-center justify-center transition-colors"
        />
      </div>

      <div className="mt-2">
        <h4 className="font-bold text-lg text-slate-800 mb-4 ml-1">
          {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' })}
        </h4>
        
        {role === 'parent' && goals.length > 0 && (
           <div className="mb-6 bg-emerald-100/50 p-4 rounded-[24px]">
              <h5 className="text-sm font-bold text-emerald-800 mb-3 uppercase tracking-wider">🎯 Цели</h5>
              {goals.map(goal => <p key={goal.id} className="text-sm font-medium text-emerald-900 bg-white/60 p-3 rounded-[16px] mb-2">{goal.reward}</p>)}
           </div>
        )}

        <div className="space-y-3 pb-32">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <div key={task.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:border-emerald-200">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{task.subject}</p>
                  <p className="text-sm text-slate-500 truncate">{task.description}</p>
                </div>
                <div className={`ml-3 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${task.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    {task.status === 'active' ? 'Активно' : 'Завершено'}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-6 bg-white rounded-[24px] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold">На эту дату задач нет.</p>
                <p className="text-slate-300 text-sm mt-1">Отдыхайте или займитесь хобби! ✨</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
