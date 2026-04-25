import React, { useState } from 'react';
import { LogIn, UserPlus, GraduationCap, Users, ShieldCheck, Cpu } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface Props {
  onLogin: (role: 'student' | 'teacher' | 'parent', name: string) => void;
}

export default function AuthScreen({ onLogin }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [error, setError] = useState<string | null>(null);
  const [schoolCode, setSchoolCode] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Пожалуйста, заполните логин и пароль');
      return;
    }

    try {
      if (isRegister) {
        if (!name.trim()) { setError('Введите имя'); return; }
        if ((role === 'student' || role === 'teacher') && !schoolCode) { setError('Введите код школы'); return; }
        if (role === 'parent' && !studentId) { setError('Введите ID ученика'); return; }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          role,
          schoolCode: schoolCode || null,
          studentId: studentId || null,
          points: 0,
          totalXP: 0,
          level: 'Новичок',
          achievements: []
        });
        onLogin(role, name);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // Data fetch handling would go here, simplified for now
        onLogin(role, email); 
      }
    } catch (e: any) {
      // Полный вывод ошибки для отладки
      console.error("Firebase error details:", e);
      // Удобное сообщение для пользователя
      let userMessage = e.message;
      if (e.code === 'auth/invalid-credential') {
        userMessage = 'Неверный логин или пароль. Проверьте правильность введенных данных.';
      } else if (e.code === 'auth/email-already-in-use') {
        userMessage = 'Этот Email уже зарегистрирован. Попробуйте войти.';
      }
      setError(userMessage);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-emerald-50 overflow-y-auto">
      {/* Header */}
      <div className="pt-12 pb-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-emerald-600 text-lime-400 rounded-[24px] flex items-center justify-center shadow-lg shadow-emerald-200/50 mb-5 transform -rotate-6">
          <span className="text-4xl font-extrabold italic">W</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Wata Study</h1>
        <p className="text-slate-500 font-medium mt-2 text-center text-sm">Твой персональный учебный наставник</p>
      </div>

      {/* Role Selection */}
      <div className="mb-6 space-y-3">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Выберите вашу роль</label>
        <div className="grid grid-cols-3 gap-2">
          {(['student', 'teacher', 'parent'] as const).map(r => {
            const isActive = role === r;
            const Icon = r === 'student' ? GraduationCap : r === 'teacher' ? Users : ShieldCheck;
            const label = r === 'student' ? 'Ученик' : r === 'teacher' ? 'Учитель' : 'Родитель';
            
            return (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(null); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  isActive 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-105' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-bold uppercase">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabs / Toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-[20px] mb-6">
        <button
          type="button"
          onClick={() => { setIsRegister(false); setError(null); }}
          className={`flex-1 py-3 text-sm font-bold rounded-[16px] transition-all ${
            !isRegister 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Вход
        </button>
        <button
          type="button"
          onClick={() => { setIsRegister(true); setError(null); }}
          className={`flex-1 py-3 text-sm font-bold rounded-[16px] transition-all ${
            isRegister 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Регистрация
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
          ⚠️ {error}
        </div>
      )}

      {/* Form */}
      <form className="space-y-4 flex-1 flex flex-col" onSubmit={handleSubmit}>
        {isRegister && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">ФИО / Никнейм</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                placeholder="Как к вам обращаться?"
                className="w-full bg-white border-2 border-slate-100 rounded-[16px] px-4 py-3.5 text-slate-700 outline-none focus:border-emerald-500 transition-all text-base font-semibold"
              />
            </div>
            {(role === 'student' || role === 'teacher') && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Код школы</label>
                <input 
                  type="text" 
                  value={schoolCode}
                  onChange={(e) => { setSchoolCode(e.target.value); setError(null); }}
                  placeholder="Введите код школы"
                  className="w-full bg-white border-2 border-slate-100 rounded-[16px] px-4 py-3.5 text-slate-700 outline-none focus:border-emerald-500 transition-all text-base font-semibold"
                />
              </div>
            )}
            {role === 'parent' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">ID ученика</label>
                <input 
                  type="text" 
                  value={studentId}
                  onChange={(e) => { setStudentId(e.target.value); setError(null); }}
                  placeholder="Введите ID ребенка"
                  className="w-full bg-white border-2 border-slate-100 rounded-[16px] px-4 py-3.5 text-slate-700 outline-none focus:border-emerald-500 transition-all text-base font-semibold"
                />
              </div>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Логин (Email)</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder="example@school.ru"
            className="w-full bg-white border-2 border-slate-100 rounded-[16px] px-4 py-3.5 text-slate-700 outline-none focus:border-emerald-500 transition-all text-base font-semibold"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Пароль</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            placeholder="••••••••"
            className="w-full bg-white border-2 border-slate-100 rounded-[16px] px-4 py-3.5 text-slate-700 outline-none focus:border-emerald-500 transition-all text-base font-semibold"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[20px] text-lg py-4 mt-4 shadow-lg shadow-emerald-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {isRegister ? <UserPlus size={22} /> : <LogIn size={22} />}
          {isRegister ? 'Начать обучение' : 'Войти в систему'}
        </button>
      </form>

      {/* Developer Bypass Button */}
      <div className="mt-8 pt-6 border-t border-slate-100 pb-4">
        <button
          onClick={() => onLogin('teacher', 'Master Developer')}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-slate-900 text-lime-400 font-black rounded-[20px] transition-transform active:scale-[0.98] shadow-2xl border-b-4 border-slate-950"
        >
          <Cpu size={20} strokeWidth={2.5} className="animate-pulse" />
          РЕЖИМ РАЗРАБОТЧИКА
        </button>
      </div>
    </div>
  );
}
