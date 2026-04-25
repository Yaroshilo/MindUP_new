import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Sparkles, PenLine, Mic } from 'lucide-react';
import { Priority } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: { subject: string; description: string; deadline: string; dateTimestamp: number; priority: Priority; points: number }) => void;
}

const SUBJECTS = [
  'Алгебра', 'Геометрия', 'Информатика', 'Робототехника',
  'Русский язык', 'Литература', 'Английский язык',
  'История', 'Обществознание', 
  'Физика', 'Химия', 'Биология', 'География'
];

export default function AddTaskModal({ isOpen, onClose, onAdd }: Props) {
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
      points: pointsCalc
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
      onAdd({
        subject: data.subject || 'Алгебра',
        description: data.task || aiPrompt,
        deadline: data.deadline || 'Завтра',
        dateTimestamp: Date.now() + 86400000,
        priority: data.priority || 'medium',
        points: 20
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
        <div className="flex bg-slate-100 p-1.5 rounded-[20px] mb-6">
                <button
                  onClick={() => setMode('ai')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-[16px] transition-all flex items-center justify-center gap-2 ${
                    mode === 'ai' 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Sparkles size={16} /> ИИ-Ассистент
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-[16px] transition-all flex items-center justify-center gap-2 ${
                    mode === 'manual' 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <PenLine size={16} /> Вручную
                </button>
        </div>
        
        {mode === 'ai' ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {previewTasks ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                   <h3 className="text-sm font-bold text-slate-500 uppercase">Проверь результат</h3>
                   <button onClick={() => setPreviewTasks(null)} className="text-[10px] font-bold text-emerald-600 hover:underline">Изменить запрос</button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                   {previewTasks.map((t, i) => (
                     <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase text-emerald-600">{t.subject}</span>
                           <span className="text-[10px] font-bold text-slate-400">{t.deadline}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-700">{t.task}</div>
                     </div>
                   ))}
                </div>
                <button 
                  onClick={confirmPreviewTasks}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[16px] text-lg py-4 mt-2 shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                >
                  Все верно, добавить
                </button>
              </div>
            ) : (
              <>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-[24px] p-5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-emerald-800">Напиши или продиктуй</label>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-100">
                         Строгость: {strictness}%
                       </span>
                    </div>
                  </div>
                  
                  <textarea 
                    rows={4} 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Пример: Завтра по алгебре сдать 10 номеров, а в пятницу стих по литре..."
                    className="w-full bg-white border border-slate-200 rounded-[16px] px-4 py-3.5 text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all resize-none shadow-sm"
                  ></textarea>

                  <div className="mt-4 px-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                      <span>Творчески</span>
                      <span>Точно</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={strictness}
                      onChange={(e) => setStrictness(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  <div className="flex justify-end mt-3">
                     <button 
                      type="button"
                      onClick={startListening}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300'
                      }`}
                     >
                       <Mic size={20} />
                     </button>
                  </div>
                </div>
                <button 
                  onClick={handleAiParse}
                  disabled={isAiLoading}
                  className={`w-full font-bold rounded-[16px] text-lg py-4 mt-2 shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${
                    isAiLoading ? 'bg-emerald-400 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                  }`}
                >
                  {isAiLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Думаю...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Разобрать текст
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-400 font-medium px-4 pt-2">
                  (Подготовка среды для Ollama: планируется локальный парсинг задач)
                </p>
              </>
            )}
          </div>
        ) : (
          <form className="space-y-5 font-medium animate-in fade-in duration-200" onSubmit={handleSubmit}>
            {/* Subject Chips */}
            <div>
              <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Предмет</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-colors border-2 shrink-0 ${
                      subject === sub
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Description / Task Name */}
            <div>
              <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Что нужно сделать?</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Например: подготовиться к контрольной..."
                required
                className="w-full border-2 border-slate-100 rounded-[20px] px-4 py-3.5 text-slate-800 font-semibold focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
              />
            </div>

            {/* Date Picker Mock */}
            <div>
              <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Срок сдачи</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <CalendarIcon size={20} className="text-slate-400" />
                </div>
                <input 
                  type="text" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Выберите дату"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[20px] pl-12 pr-4 py-3.5 text-slate-800 font-semibold focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Priority Buttons */}
            <div>
              <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Приоритет</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`py-3 rounded-[16px] font-bold text-sm transition-all border-2 ${
                    priority === 'low' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Низкий
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`py-3 rounded-[16px] font-bold text-sm transition-all border-2 ${
                    priority === 'medium' 
                      ? 'border-orange-500 bg-orange-50 text-orange-700' 
                      : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Средний
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`py-3 rounded-[16px] font-bold text-sm transition-all border-2 flex items-center justify-center gap-1 ${
                    priority === 'high' 
                      ? 'border-red-500 bg-red-100 text-red-600 shadow-[0_4px_15px_rgba(239,68,68,0.3)]' 
                      : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Огонь!
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[20px] text-lg py-4 mt-6 shadow-lg shadow-emerald-200 transition-transform active:scale-[0.98]"
            >
              Сохранить
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
