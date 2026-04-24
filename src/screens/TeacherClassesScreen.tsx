import { Users, GraduationCap, TrendingUp, Search } from 'lucide-react';

export default function TeacherClassesScreen() {
  const classes = [
    { id: 1, name: '9 "А"', studentsCount: 24, avgXP: 4500, topStudent: 'Петрова Анна' },
    { id: 2, name: '9 "Б"', studentsCount: 22, avgXP: 3200, topStudent: 'Смирнов Илья' },
    { id: 3, name: '10 "А"', studentsCount: 28, avgXP: 5100, topStudent: 'Иванов Иван' },
    { id: 4, name: '11 "В"', studentsCount: 20, avgXP: 6800, topStudent: 'Кузнецов Петр' }
  ];

  return (
    <div className="flex flex-col h-full bg-emerald-50/50 animate-in fade-in">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 pt-8 pb-6 px-4 shadow-sm z-10 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-white mb-4">Мои классы</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
            <input 
              type="text" 
              placeholder="Поиск класса или ученика..." 
              className="w-full bg-white/10 border border-white/20 rounded-[16px] py-3 pl-10 pr-4 text-white placeholder:text-white/50 font-medium outline-none focus:bg-white/20 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-emerald-100 flex flex-col gap-4 group hover:border-emerald-200 transition-colors cursor-pointer">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-extrabold text-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                   {cls.name}
                 </div>
                 <div>
                   <p className="font-bold text-slate-800 flex items-center gap-1">
                     <Users size={14} className="text-slate-400" /> {cls.studentsCount} учеников
                   </p>
                   <p className="text-xs font-bold text-slate-400 mt-0.5">Лидер: {cls.topStudent}</p>
                 </div>
               </div>
               
               <div className="text-right">
                 <div className="font-extrabold text-emerald-600 text-lg flex items-center justify-end gap-1">
                   <TrendingUp size={16} /> {cls.avgXP}
                 </div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Средний XP</p>
               </div>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-slate-50">
               <button className="flex-1 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold py-2 rounded-[12px] text-sm transition-colors">
                 Успеваемость
               </button>
               <button className="flex-1 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold py-2 rounded-[12px] text-sm transition-colors">
                 Журнал задач
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
