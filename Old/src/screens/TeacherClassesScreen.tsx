import { Users, GraduationCap, TrendingUp, Search } from 'lucide-react';

export default function TeacherClassesScreen() {
  const classes = [
    { id: 1, name: '9 "А"', studentsCount: 24, avgXP: 4500, topStudent: 'Петрова Анна' },
    { id: 2, name: '9 "Б"', studentsCount: 22, avgXP: 3200, topStudent: 'Смирнов Илья' },
    { id: 3, name: '10 "А"', studentsCount: 28, avgXP: 5100, topStudent: 'Иванов Иван' },
    { id: 4, name: '11 "В"', studentsCount: 20, avgXP: 6800, topStudent: 'Кузнецов Петр' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#fcfdfc] animate-in fade-in">
      <div className="bg-white/90 backdrop-blur-md pt-6 pb-4 px-5 border-b border-slate-100 z-10 shrink-0">
        <div className="relative z-10">
          <h1 className="text-xl font-black text-slate-800 mb-5 uppercase tracking-widest leading-none px-1">Мои классы</h1>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск класса или ученика..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 font-medium outline-none focus:bg-white focus:border-emerald-300 transition-all text-sm shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-32">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 flex flex-col gap-5 group hover:border-emerald-100 transition-all cursor-pointer">
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[20px] flex items-center justify-center font-black text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                   {cls.name.replace(/"/g, '')}
                 </div>
                 <div className="space-y-1">
                   <h3 className="font-bold text-slate-800 text-lg leading-none">{cls.name}</h3>
                   <div className="flex items-center gap-3">
                     <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                       <Users size={12} /> {cls.studentsCount}
                     </span>
                     <span className="text-[11px] font-bold text-slate-400">•</span>
                     <span className="text-[11px] font-bold text-slate-500">Лидер: {cls.topStudent.split(' ')[0]}</span>
                   </div>
                 </div>
               </div>
               
               <div className="text-right">
                 <div className="font-black text-emerald-600 text-lg flex items-center justify-end gap-1 leading-none">
                    {cls.avgXP}
                 </div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-1">Средний XP</p>
               </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-50">
               <button className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] border border-emerald-100/50">
                 Успеваемость
               </button>
               <button className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] border border-emerald-100/50">
                 Журнал задач
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
