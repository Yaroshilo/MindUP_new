import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Sparkles, PenLine, Mic } from 'lucide-react';
import { Priority, UserProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: { subject: string; description: string; deadline: string; dateTimestamp: number; priority: Priority; points: number; classId?: string }) => void;
  currentUser?: UserProfile;
}

const SUBJECTS = [
  'Алгебра', 'Геометрия', 'Информатика', 'Робототехника',
  'Русский язык', 'Литература', 'Английский язык',
  'История', 'Обществознание', 
  'Физика', 'Химия', 'Биология', 'География'
];

export default function AddTaskModal({ isOpen, onClose, onAdd, currentUser }: Props) {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [strictness, setStrictness] = useState(30); // 0-100 scale
  const [previewTasks, setPreviewTasks] = useState<any[] | null>(null);

  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !deadline) return;

    // Calculate XP reward points based on priority
    const pointsCalc = priority === 'high' ? 30 : priority === 'medium' ? 20 : 10;
    
    // Format date string (e.g., '2023-10-25T14:30' -> '25.10.2023, 14:30')
    const dateObj = new Date(deadline);
    const formattedDate = dateObj.toLocaleDateString('ru-RU') + ', ' + dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    onAdd({
      subject,
      description,
      deadline: formattedDate,
      dateTimestamp: dateObj.getTime(),
      priority,
      points: pointsCalc,
      classId: currentUser?.classId
    });
    
    // Reset form
    setSubject(SUBJECTS[0]);
    setDescription('');
    setDeadline('');
    setPriority('medium');
    setAiPrompt('');
    onClose();
  };

  const [isListening, setIsListening] = useState(false);
  
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Ваш браузер не поддерживает распознавание речи.");
      return;
    }
    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onresult = (event: any) => {
      setAiPrompt(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleAiParse = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, strictness }),
      });

      if (!response.ok) throw new Error('AI parse failed');
      const dataArray = await response.json();
      
      if (Array.isArray(dataArray)) {
        setPreviewTasks(dataArray);
      }
      
      setIsAiLoading(false);
    } catch (error) {
      console.error('AI Error:', error);
      setIsAiLoading(false);
      alert('Ошибка при обработке ИИ. Попробуйте еще раз.');
    }
  };

  const confirmPreviewTasks = () => {
    if (!previewTasks) return;
    previewTasks.forEach(data => {
      // Parse D.M.Y or just use default if it fails
      let dateObj = new Date();
      if (data.deadline) {
        const parts = data.deadline.split('.');
        if (parts.length === 3) {
          // Format: DD.MM.YYYY
          dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 9, 0);
        }
      }
      
      onAdd({
        subject: data.subject || 'Алгебра',
        description: data.task || aiPrompt,
        deadline: dateObj.toLocaleDateString('ru-RU') + ', 09:00',
        dateTimestamp: isNaN(dateObj.getTime()) ? Date.now() + 86400000 : dateObj.getTime(),
        priority: (data.priority?.toLowerCase() as Priority) || 'medium',
        points: 20,
        classId: currentUser?.classId
      });
    });
    setPreviewTasks(null);
    setAiPrompt('');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-900/70 backdrop-blur-md transition-opacity">
      <div className="w-full bg-white rounded-t-[32px] p-6 pb-12 sm:pb-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Новая задача</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* AI / Manual Toggle */}
        <div className="flex bg-slate-50 p-1 rounded-[16px] mb-6 border border-slate-100">
                <button
                  onClick={() => setMode('ai')}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-[14px] transition-all flex items-center justify-center gap-2 ${
                    mode === 'ai' 
                      ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Sparkles size={16} strokeWidth={2.5} /> ИИ
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-[14px] transition-all flex items-center justify-center gap-2 ${
                    mode === 'manual' 
                      ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <PenLine size={16} strokeWidth={2.5} /> Вручную
                </button>
        </div>
        
        {mode === 'ai' ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {previewTasks ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Проверь результат</h3>
                   <button onClick={() => setPreviewTasks(null)} className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-wider">Назад</button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                   {previewTasks.map((t, i) => (
                     <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-1 transition-all hover:bg-white">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t.subject}</span>
                           <span className="text-[10px] font-bold text-slate-400">{t.deadline}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-700">{t.task}</div>
                     </div>
                   ))}
                </div>
                <button 
                  onClick={confirmPreviewTasks}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-[20px] text-base py-4 mt-2 shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]"
                >
                  Добавить всё
                </button>
              </div>
            ) : (
              <>
                <div className="bg-emerald-50/30 border border-emerald-100 rounded-[28px] p-5">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Твой запрос</label>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-emerald-600 bg-white px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm">
                         Творчество: {100 - strictness}%
                       </span>
                    </div>
                  </div>
                  
                  <textarea 
                    rows={4} 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Пример: Завтра по алгебре сдать 10 номеров, а в пятницу стих по литературе..."
                    className="w-full bg-white border border-slate-200 rounded-[20px] px-4 py-4 text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 transition-all resize-none shadow-sm placeholder:text-slate-300 font-medium"
                  ></textarea>

                  <div className="mt-6 px-1">
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                      <span>Свободно</span>
                      <span>Точно</span>
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 w-full h-1 bg-slate-100 rounded-full"></div>
                      <div className="absolute left-0 h-1 bg-emerald-500 rounded-full" style={{ width: `${strictness}%` }}></div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={strictness}
                        onChange={(e) => setStrictness(parseInt(e.target.value))}
                        className="w-full h-4 bg-transparent appearance-none cursor-pointer accent-emerald-600 relative z-10 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-md"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                     <button 
                      type="button"
                      onClick={startListening}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 ${
                        isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white border border-slate-100 text-slate-500 hover:text-emerald-600 hover:border-emerald-200'
                      }`}
                     >
                       <Mic size={24} strokeWidth={2.5} />
                     </button>
                  </div>
                </div>
                <button 
                  onClick={handleAiParse}
                  disabled={isAiLoading}
                  className={`w-full font-black uppercase tracking-widest rounded-[20px] text-base py-4 mt-4 shadow-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${
                    isAiLoading ? 'bg-emerald-400 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                  }`}
                >
                  {isAiLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Анализирую...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} strokeWidth={2.5} />
                      Разобрать задачу
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        ) : (
          <form className="space-y-6 font-medium animate-in fade-in duration-200" onSubmit={handleSubmit}>
            {/* Subject Chips */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 text-center">Предмет</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all border shrink-0 ${
                      subject === sub
                        ? 'border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Description / Task Name */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Что нужно сделать?</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Например: подготовиться к контрольной..."
                required
                className="w-full border border-slate-100 bg-slate-50 rounded-[20px] px-5 py-4 text-slate-800 font-bold focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 transition-all outline-none shadow-sm placeholder:text-slate-300"
              />
            </div>

            {/* Date Picker */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Срок сдачи</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <CalendarIcon size={20} strokeWidth={2.5} className="text-slate-400" />
                  </div>
                  <input 
                    type="datetime-local" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-[20px] pl-14 pr-5 py-4 text-slate-800 font-bold focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100/50 transition-all outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Приоритет</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('low')}
                    className={`py-3.5 rounded-[18px] font-black text-[11px] uppercase tracking-wider transition-all border-2 ${
                      priority === 'low' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm' 
                        : 'border-slate-50 bg-slate-50 text-slate-400 opacity-60'
                    }`}
                  >
                    Легко
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('medium')}
                    className={`py-3.5 rounded-[18px] font-black text-[11px] uppercase tracking-wider transition-all border-2 ${
                      priority === 'medium' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm' 
                        : 'border-slate-50 bg-slate-50 text-slate-400 opacity-60'
                    }`}
                  >
                    Норм
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    className={`py-3.5 rounded-[18px] font-black text-[11px] uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-1 ${
                      priority === 'high' 
                        ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-lg shadow-rose-500/10' 
                        : 'border-slate-50 bg-slate-50 text-slate-400 opacity-60'
                    }`}
                  >
                    Hard!
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.15em] rounded-[24px] text-base py-5 mt-4 shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              Создать
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
