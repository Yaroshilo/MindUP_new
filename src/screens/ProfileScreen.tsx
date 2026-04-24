import { User, Book, Shield, Award, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onLogout?: () => void;
  onBuyReward?: (price: number, name: string) => void;
}

const REWARDS = [
  { id: 1, title: "Скидка 15% в столовой", price: 300, emoji: "🍕", colorStyle: "bg-orange-100 text-orange-600" },
  { id: 2, title: "Уникальная тема (Космос)", price: 800, emoji: "🌌", colorStyle: "bg-indigo-100 text-indigo-600" },
  { id: 3, title: "Виртуальный питомец-напарник", price: 2000, emoji: "🐉", colorStyle: "bg-emerald-100 text-emerald-600" },
  { id: 4, title: "+1 балл к итоговой за тест", price: 5000, emoji: "💯", colorStyle: "bg-rose-100 text-rose-600" }
];

export default function ProfileScreen({ profile, onLogout, onBuyReward }: Props) {
  return (
    <div className="p-4 space-y-6">
      <div className="mt-4 px-2">
        <h1 className="text-3xl font-bold text-slate-800">Профиль</h1>
      </div>

      <div className="flex flex-col items-center p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm shadow-slate-100/50">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
           <span className="text-3xl font-black leading-none">{profile.name.charAt(0)}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 text-center tracking-tight">{profile.name}</h2>
        
        {profile.classId && (
          <div className="flex items-center gap-2 mt-3">
            <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
              Класс {profile.classId}
            </span>
            {profile.subject && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                {profile.subject}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full font-black mt-4 text-xs uppercase tracking-widest border border-emerald-100">
          <Award size={16} className="fill-emerald-500 text-emerald-500" />
          <span>{profile.level}</span>
        </div>
      </div>

      {/* Student Specific Sections (Diary & Store) */}
      {profile.role === 'student' && (
        <>
          <div className="pt-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Твои оценки</h3>
            <div className="grid grid-cols-2 gap-4">
               <button className="card-base p-4 flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-all">
                  <div className="text-3xl font-black text-emerald-500">5</div>
                  <div className="text-[11px] font-bold text-slate-500">Алгебра</div>
               </button>
               <button 
                className="card-base p-4 flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-all relative overflow-hidden"
                onClick={() => (window as any).handleGradeClick?.('Физика', 3)}
               >
                  <div className="text-3xl font-black text-orange-400">3</div>
                  <div className="text-[11px] font-bold text-slate-500">Физика</div>
                  <div className="absolute top-0 right-0 w-8 h-8 bg-orange-400 text-white flex items-center justify-center rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                    <Shield size={14} strokeWidth={3} />
                  </div>
               </button>
               <button className="card-base p-4 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all">
                  <div className="text-3xl font-black text-emerald-500">4+</div>
                  <div className="text-[11px] font-bold text-slate-500">История</div>
               </button>
               <button 
                className="card-base p-4 flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-all relative overflow-hidden"
                onClick={() => (window as any).handleGradeClick?.('Химия', 2)}
               >
                  <div className="text-3xl font-black text-rose-500">2</div>
                  <div className="text-[11px] font-bold text-slate-500">Химия</div>
                  <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500 text-white flex items-center justify-center rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                    <Shield size={14} strokeWidth={3} />
                  </div>
               </button>
            </div>
          </div>

          <div className="pt-6 pb-6 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Магазин наград</h3>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                <Award size={14} className="fill-emerald-500" />
                {profile.points} XP
              </span>
            </div>

            <div className="space-y-3">
              {REWARDS.map(reward => {
                const canAfford = profile.points >= reward.price;
                
                return (
                  <div key={reward.id} className="card-base p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-3xl shrink-0 ${reward.colorStyle} shadow-inner`}>
                      {reward.emoji}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight truncate">{reward.title}</h4>
                      <p className={`text-[10px] font-black tracking-widest uppercase mt-1.5 ${canAfford ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {reward.price} XP
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => canAfford && onBuyReward?.(reward.price, reward.title)}
                      disabled={!canAfford}
                      className={`shrink-0 px-5 py-2.5 rounded-[16px] font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 ${
                        canAfford 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
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
          className="w-full flex items-center justify-center gap-2 py-4 text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-black text-xs uppercase tracking-widest rounded-[20px] transition-all border border-transparent hover:border-rose-100 active:scale-95"
        >
          <LogOut size={18} strokeWidth={3} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
