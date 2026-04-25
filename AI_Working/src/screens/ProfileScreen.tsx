import { User, Book, Shield, Award, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onLogout?: () => void;
  onRoleChange: (role: 'student' | 'teacher' | 'parent') => void;
  onBuyReward?: (price: number, name: string) => void;
}

const REWARDS = [
  { id: 1, title: "Скидка 15% в столовой", price: 300, emoji: "🍕", colorStyle: "bg-orange-100 text-orange-600" },
  { id: 2, title: "Уникальная тема (Космос)", price: 800, emoji: "🌌", colorStyle: "bg-indigo-100 text-indigo-600" },
  { id: 3, title: "Виртуальный питомец-напарник", price: 2000, emoji: "🐉", colorStyle: "bg-emerald-100 text-emerald-600" },
  { id: 4, title: "+1 балл к итоговой за тест", price: 5000, emoji: "💯", colorStyle: "bg-rose-100 text-rose-600" }
];

export default function ProfileScreen({ profile, onLogout, onRoleChange, onBuyReward }: Props) {
  return (
    <div className="p-4 space-y-6">
      <div className="mt-4 px-2">
        <h1 className="text-3xl font-bold text-slate-800">Профиль</h1>
      </div>

      <div className="flex flex-col items-center p-8 bg-white border-2 border-emerald-100 rounded-[32px] shadow-sm">
        <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 justify-center flex items-center mb-5 ring-4 ring-emerald-50">
           <User size={48} strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 text-center">{profile.name}</h2>
        <div className="flex items-center gap-1.5 text-lime-600 bg-lime-50 px-3 py-1.5 rounded-full font-bold mt-3 text-sm">
          <Award size={16} className="fill-lime-500 text-lime-500" />
          <span>{profile.level}</span>
        </div>
      </div>

      {/* ROLE SWITCHER */}
      {profile.role !== 'student' && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Текущая роль</h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-emerald-100 overflow-hidden grid grid-cols-1 divide-y divide-emerald-100">
            {(['student', 'teacher', 'parent'] as const).map(role => {
              const isSelected = profile.role === role;
              return (
                <button 
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`flex items-center justify-between p-4 px-5 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {role === 'student' && <User size={20} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />}
                    {role === 'teacher' && <Book size={20} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />}
                    {role === 'parent' && <Shield size={20} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />}
                    <span className={`font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {role === 'student' ? 'Ученик' : role === 'teacher' ? 'Учитель' : 'Родитель'}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Student Specific Sections (Diary & Store) */}
      {profile.role === 'student' && (
        <>
          <div className="pt-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Твои оценки (Дневник)</h3>
            <div className="grid grid-cols-2 gap-3">
               <button 
                onClick={() => onRoleChange('student')} 
                className="bg-white p-4 rounded-[24px] border border-emerald-100 shadow-sm flex flex-col items-center justify-center gap-1 group active:scale-95 transition-all"
               >
                  <div className="text-3xl font-black text-emerald-600">5</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Алгебра</div>
               </button>
               <button 
                className="bg-white p-4 rounded-[24px] border border-orange-100 shadow-sm flex flex-col items-center justify-center gap-1 group active:scale-95 transition-all relative overflow-hidden"
                onClick={() => (window as any).handleGradeClick?.('Физика', 3)}
               >
                  <div className="text-3xl font-black text-orange-500">3</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Физика</div>
                  <div className="absolute top-0 right-0 w-6 h-6 bg-orange-500 text-white flex items-center justify-center rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Shield size={12} />
                  </div>
               </button>
               <button className="bg-white p-4 rounded-[24px] border border-emerald-100 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition-all">
                  <div className="text-3xl font-black text-emerald-600">4+</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">История</div>
               </button>
               <button 
                className="bg-white p-4 rounded-[24px] border border-red-100 shadow-sm flex flex-col items-center justify-center gap-1 group active:scale-95 transition-all relative overflow-hidden"
                onClick={() => (window as any).handleGradeClick?.('Химия', 2)}
               >
                  <div className="text-3xl font-black text-red-500">2</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Химия</div>
                  <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white flex items-center justify-center rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Shield size={12} />
                  </div>
               </button>
            </div>
          </div>

          <div className="pt-2 pb-6 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-extrabold text-slate-800">Магазин наград</h3>
              <span className="text-sm font-bold text-lime-700 bg-lime-100 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Award size={14} className="fill-lime-500" />
                {profile.points} XP
              </span>
            </div>

            <div className="grid grid-cols-1 space-y-3">
              {REWARDS.map(reward => {
                const canAfford = profile.points >= reward.price;
                
                return (
                  <div key={reward.id} className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center text-3xl shrink-0 ${reward.colorStyle} shadow-inner`}>
                      {reward.emoji}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight truncate">{reward.title}</h4>
                      <p className={`text-xs font-extrabold tracking-widest uppercase mt-1 ${canAfford ? 'text-lime-600' : 'text-slate-400'}`}>
                        {reward.price} XP
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => canAfford && onBuyReward?.(reward.price, reward.title)}
                      disabled={!canAfford}
                      className={`shrink-0 px-4 py-2.5 rounded-[16px] font-bold text-sm transition-all active:scale-95 ${
                        canAfford 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'
                      }`}
                    >
                      Купить
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="pt-2">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-[20px] transition-colors shadow-sm"
        >
          <LogOut size={20} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
