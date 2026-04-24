import { Target, User, Trophy, Activity, Flag, LayoutDashboard, Users, Calendar } from 'lucide-react';

interface Props {
  activeTab: string;
  onChange: (tab: string) => void;
  role?: 'student' | 'teacher' | 'parent';
}

export default function BottomNav({ activeTab, onChange, role = 'student' }: Props) {
  // Navigation structure per role
  const tabsConfig = {
    student: [
      { id: 'home', icon: Trophy, label: 'Главная' },
      { id: 'tasks', icon: Target, label: 'Задачи' },
      { id: 'calendar', icon: Calendar, label: 'Календарь' },
      { id: 'profile', icon: User, label: 'Дневник' }
    ],
    parent: [
      { id: 'radar', icon: Activity, label: 'Радар' },
      { id: 'goals', icon: Flag, label: 'Цели' },
      { id: 'calendar', icon: Calendar, label: 'Календарь' },
      { id: 'profile', icon: User, label: 'Профиль' }
    ],
    teacher: [
      { id: 'home', icon: LayoutDashboard, label: 'Рабочий стол' },
      { id: 'classes', icon: Users, label: 'Классы' },
      { id: 'calendar', icon: Calendar, label: 'Календарь' },
      { id: 'profile', icon: User, label: 'Профиль' }
    ]
  };

  const currentTabs = tabsConfig[role] || tabsConfig.student;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100/50 px-6 py-3 flex justify-between z-50 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 12px)' }}
    >
      {currentTabs.map(tab => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button 
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-1 group relative py-1"
          >
            <div className={`transition-all duration-300 relative z-10 ${isActive ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-50 rounded-2xl -z-10 animate-in zoom-in-75 duration-300" />
              )}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  );
}
