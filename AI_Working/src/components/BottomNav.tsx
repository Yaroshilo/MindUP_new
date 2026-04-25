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
    <div className="absolute bottom-0 w-full bg-emerald-50/95 backdrop-blur-md border-t border-emerald-100 px-6 py-4 pb-8 sm:pb-4 flex justify-between z-40 rounded-b-[40px]">
      {currentTabs.map(tab => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button 
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-emerald-600 shadow-md shadow-emerald-200 text-white translate-y-[-4px]' : 'text-emerald-400 bg-transparent hover:bg-emerald-50'}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-extrabold transition-colors duration-300 ${isActive ? 'text-emerald-600' : 'text-emerald-400'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  );
}
