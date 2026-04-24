import { useState } from 'react';
import { CheckCircle2, MessageSquare, Flame, BarChart3, Users, Zap, Search, ChevronRight, Sparkles } from 'lucide-react';
import { Task } from '../types';

export default function TeacherWorkspaceScreen({ tasks, onAcceptTask, onReturnTask, onReplySos }: { 
  tasks: Task[], 
  onAcceptTask: (taskId: string, rating: number) => void,
  onReturnTask: (taskId: string) => void,
  onReplySos: (taskId: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'review' | 'sos' | 'dashboard' | 'classes'>('review');
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [isAiChecking, setIsAiChecking] = useState<Record<string, boolean>>({});
  const [strictness, setStrictness] = useState(60);

  const handleAiReview = async (taskId: string, taskContext: string, solution?: string) => {
    setIsAiChecking(prev => ({ ...prev, [taskId]: true }));
    try {
      const isImage = solution?.startsWith('data:image');
      const response = await fetch('/api/ai-check-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskContext, 
          solution: solution || "Решение не предоставлено текстом (возможно во вложении)",
          isImage,
          strictness
        })
      });
      if (!response.ok) throw new Error('AI Error');
      const data = await response.json();
      
      // Parse numeric grade from string like "5-" or "4"
      const numericGrade = parseInt(data.grade) || 5;
      
      setGrades(prev => ({ ...prev, [taskId]: numericGrade }));
      setFeedback(prev => ({ ...prev, [taskId]: data.feedback }));
    } catch (err) {
      console.error(err);
      alert("Не удалось связаться с ИИ-помощником (Ollama)");
    } finally {
      setIsAiChecking(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const reviews = tasks.filter(t => t.status === 'pending');
  const sosRequests = tasks.filter(t => t.hasSos && t.status === 'active');

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    active: tasks.filter(t => t.status === 'active').length,
    efficiency: Math.round((tasks.filter(t => t.status === 'completed').length / (tasks.length || 1)) * 100)
  };

  const quickFeedback = ["Отлично!", "Хорошая работа", "Переделай", "Мало деталей", "Супер! 🎯"];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in overflow-hidden">
      <div className="bg-white/80 backdrop-blur-md pt-8 pb-4 px-4 shadow-sm z-10 shrink-0 border-b border-emerald-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-800">Кабинет</h1>
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             В сети
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-[22px] gap-1 overflow-x-auto scrollbar-hide shrink-0">
          <button 
            onClick={() => setActiveTab('review')}
            className={`whitespace-nowrap px-4 py-2.5 font-bold text-xs rounded-[16px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'review' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Проверка <span className="bg-emerald-100 text-emerald-600 px-2 rounded-full text-[10px] py-0.5">{reviews.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('sos')}
            className={`whitespace-nowrap px-4 py-2.5 font-bold text-xs rounded-[16px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sos' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            SOS <span className="bg-orange-100 text-orange-600 px-2 rounded-full text-[10px] py-0.5">{sosRequests.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap px-4 py-2.5 font-bold text-xs rounded-[16px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Сводка
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`whitespace-nowrap px-4 py-2.5 font-bold text-xs rounded-[16px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'classes' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Классы
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-300">
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-3 text-blue-100"><BarChart3 size={40} /></div>
                   <div className="text-3xl font-black text-slate-800">{stats.efficiency}%</div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Освоение программы</div>
                </div>
                <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-3 text-emerald-100"><CheckCircle2 size={40} /></div>
                   <div className="text-3xl font-black text-emerald-600">{stats.completed}</div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Выполнено заданий</div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[32px] text-white shadow-xl shadow-blue-200">
                <div className="flex justify-between items-start mb-4">
                   <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md"><Zap size={20} className="fill-white" /></div>
                   <span className="text-[10px] font-bold uppercase py-1 px-2 bg-white/10 rounded-lg">Совет ИИ</span>
                </div>
                <h3 className="text-lg font-bold leading-tight mb-2">Класс 9-A отстает по Геометрии</h3>
                <p className="text-xs text-blue-100 font-medium leading-relaxed opacity-90">
                  Рекомендуется упростить следующий тест или провести дополнительную консультацию. 65% учеников еще не сдали тест №4.
                </p>
             </div>

             <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-4 px-1">Топ лидеров</h4>
                <div className="space-y-4">
                   {[
                     { name: 'Иван Сергеев', xp: 2450, color: 'bg-amber-100 text-amber-600' },
                     { name: 'Мария Кюри', xp: 2120, color: 'bg-slate-100 text-slate-600' },
                     { name: 'Петр Капица', xp: 1980, color: 'bg-orange-100 text-orange-600' }
                   ].map((u, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.color}`}>{u.name[0]}</div>
                        <div className="flex-1 font-bold text-slate-700 text-sm">{u.name}</div>
                        <div className="text-xs font-black text-emerald-600">{u.xp} XP</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="space-y-3 animate-in fade-in duration-300">
             <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Поиск ученика или класса..." 
                  className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-emerald-300 transition-all shadow-sm"
                />
             </div>
             {['9-A', '9-B', '10-A', '10-B', '11-A'].map((c, i) => (
                <div key={i} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
                      <div>
                        <h4 className="font-bold text-slate-800">{c}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase">24 ученика • 5 активных дел</p>
                      </div>
                   </div>
                   <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
             ))}
          </div>
        )}

        {activeTab === 'review' && reviews.map(req => {
          const rating = grades[req.id] || 5;
          const currentFeedback = feedback[req.id] || "";

          return (
            <div key={req.id} className="bg-white rounded-[32px] p-5 shadow-sm border border-emerald-100 flex flex-col gap-4 animate-in slide-in-from-right-5 duration-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl ring-4 ring-emerald-50/50">
                    {req.studentName?.[0] || 'П'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{req.studentName || 'Петя (Ученик)'}</h3>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-500">{req.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black text-slate-300 uppercase mb-0.5">Срок</div>
                   <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{req.deadline}</span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-[20px] relative">
                 <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Задание:</div>
                 <div className="text-slate-600 font-medium text-sm leading-relaxed mb-3">
                    "{req.description}"
                 </div>
                 
                 {req.solution && (
                   <div className="mt-2 pt-3 border-t border-slate-200">
                     <div className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Решение ученика:</div>
                     <div className="text-slate-800 font-bold text-sm italic">
                        "{req.solution}"
                     </div>
                   </div>
                 )}
                 
                 {req.attachment && <div className="mt-3 text-xs bg-white p-2 rounded-lg border border-slate-100 text-blue-600 font-bold flex items-center gap-2 cursor-pointer">📎 homework_scan.pdf</div>}
              </div>

               {/* Feedback Area */}
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ваш комментарий (опционально)</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400">Строгость ИИ</span>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={strictness}
                      onChange={(e) => setStrictness(parseInt(e.target.value))}
                      className="w-12 h-1 bg-slate-200 accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-[9px] font-black text-emerald-600">{strictness}%</span>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                   {quickFeedback.map(f => (
                     <button 
                      key={f}
                      onClick={() => setFeedback({...feedback, [req.id]: f})}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                        currentFeedback === f ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-100 text-slate-500 active:bg-slate-50'
                      }`}
                     >
                       {f}
                     </button>
                   ))}
                </div>
                <div className="relative">
                  <textarea 
                    value={currentFeedback}
                    onChange={(e) => setFeedback({...feedback, [req.id]: e.target.value})}
                    placeholder="Напишите замечания..."
                    className="w-full bg-slate-50 border border-transparent rounded-[18px] p-3 text-sm focus:bg-white focus:border-emerald-300 outline-none transition-all resize-none min-h-[60px]"
                  />
                  <button 
                    onClick={() => handleAiReview(req.id, req.description, req.solution)}
                    disabled={isAiChecking[req.id]}
                    className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                      isAiChecking[req.id] ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                    }`}
                    title="Запросить проверку ИИ"
                  >
                     {isAiChecking[req.id] ? <Zap size={16} className="animate-pulse" /> : <Zap size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 pt-2">
                 <div className="flex-1">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-xs font-black text-slate-700">Оценка: <span className="text-emerald-600 text-lg ml-1">{rating}</span></span>
                    </div>
                    <input 
                      type="range" 
                      min="2" max="5" step="1" 
                      value={rating}
                      onChange={(e) => setGrades({...grades, [req.id]: parseInt(e.target.value)})}
                      className="w-full accent-emerald-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                 </div>
                 <div className="flex flex-col gap-2 shrink-0">
                   <button onClick={() => onAcceptTask(req.id, rating)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-[18px] text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-200">
                     Принять
                   </button>
                   <button onClick={() => onReturnTask(req.id)} className="text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase">
                     Вернуть
                   </button>
                 </div>
              </div>
            </div>
          )
        })}

        {activeTab === 'sos' && sosRequests.map(sos => (
          <div key={sos.id} className="bg-white rounded-[32px] p-5 shadow-[0_12px_40px_rgba(249,115,22,0.12)] border border-orange-100 flex flex-col gap-4 animate-in zoom-in-95 duration-300">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-[20px] flex items-center justify-center shrink-0 ring-8 ring-orange-50/50">
                   <Flame size={28} className="fill-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                     {sos.studentName || 'Петя'} <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase shadow-sm">SOS!</span>
                   </h3>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-wide">{sos.subject} • {sos.deadline}</p>
                </div>
             </div>
             
             <div className="bg-orange-50/50 p-4 rounded-[20px] border border-orange-100/50">
                <div className="text-[10px] font-bold text-orange-400 uppercase mb-1">Вопрос ученика:</div>
                <div className="text-slate-700 font-medium text-sm italic">
                  "{sos.sosMessage || 'Не понимаю, как решить вторую часть задачи...'}"
                </div>
             </div>

             <div className="flex gap-2">
                <button 
                  onClick={() => onReplySos(sos.id)} 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-[20px] text-sm transition-all active:scale-95 shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                   <MessageSquare size={18} /> Ответить
                </button>
             </div>
          </div>
        ))}

        {((activeTab === 'review' && reviews.length === 0) || (activeTab === 'sos' && sosRequests.length === 0)) && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 opacity-60">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={48} className="opacity-30" strokeWidth={1} />
            </div>
            <p className="font-bold text-lg">Задач нет</p>
            <p className="text-xs font-medium">Ваш рабочий день на сегодня чист!</p>
          </div>
        )}
      </div>
    </div>
  );
}
