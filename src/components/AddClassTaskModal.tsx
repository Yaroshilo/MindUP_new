import React, { useState, useEffect } from 'react';
import { X, Send, Users, BookOpen, Calendar, AlignLeft, Sparkles, Loader2 } from 'lucide-react';
import { Task, UserProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (task: Partial<Task>) => void;
  currentTeacher?: UserProfile;
}

const SUBJECTS = ['Математика', 'Русский язык', 'Физика', 'Химия', 'Биология', 'История'];

export default function AddClassTaskModal({ isOpen, onClose, onAssign, currentTeacher }: Props) {
  const [subject, setSubject] = useState(currentTeacher?.subject || SUBJECTS[0]);
  const [targetClass, setTargetClass] = useState(currentTeacher?.classId || '9-A');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentTeacher) {
      if (currentTeacher.subject) setSubject(currentTeacher.subject);
      if (currentTeacher.classId) setTargetClass(currentTeacher.classId);
    }
  }, [isOpen, currentTeacher]);

  if (!isOpen) return null;

  const handleAiParse = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    
    try {
      const response = await fetch('/api/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, strictness: 50 }),
      });

      if (!response.ok) throw new Error('AI parse failed');
      const dataArray = await response.json();
      
      const tasksToProcess = Array.isArray(dataArray) ? dataArray : [dataArray];
      
      tasksToProcess.forEach(item => {
        let dateObj = new Date();
        if (item.deadline) {
          const parts = item.deadline.split('.');
          if (parts.length === 3) {
            dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 9, 0);
          }
        }

        onAssign({
          subject: item.subject || subject,
          description: item.task || aiPrompt,
          classId: targetClass,
          deadline: dateObj.toLocaleDateString('ru-RU') + ', 09:00',
          dateTimestamp: isNaN(dateObj.getTime()) ? Date.now() + 86400000 : dateObj.getTime(),
          points: 500,
          priority: item.priority || 'high',
          status: 'active',
          studentName: 'Класс ' + targetClass
        });
      });
      
      setIsAiLoading(false);
      setAiPrompt('');
      onClose();
    } catch (error) {
      console.error('AI Error:', error);
      setIsAiLoading(false);
      alert('Ошибка ИИ. Проверьте подключение к Ollama.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDeadline = deadline ? new Date(deadline).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'До конца урока';
    const timestamp = deadline ? new Date(deadline).getTime() : Date.now() + 1000 * 60 * 60; // 1 hour

    onAssign({
      subject,
      description,
      classId: targetClass,
      deadline: formattedDeadline,
      dateTimestamp: timestamp,
      points: 500,
      priority: 'high',
      status: 'active',
      studentName: 'Класс ' + targetClass
    });
    
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-900/70 backdrop-blur-md transition-opacity">
      <div className="w-full bg-white rounded-t-[32px] p-6 pb-12 sm:pb-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Задание классу</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 focus:outline-none">
            <X size={20} />
          </button>
        </div>

        {/* AI Input for Teacher */}
        <div className="mb-6 bg-indigo-50/50 p-4 rounded-[24px] border border-indigo-100 shadow-sm border-dashed">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-indigo-500 fill-indigo-500/20" />
            <span className="text-sm font-bold text-indigo-700">MindUp ИИ Учитель (Beta)</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Напишите план урока..."
              className="flex-1 bg-white border-2 border-indigo-100 rounded-[14px] px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-400"
            />
            <button 
              onClick={handleAiParse}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white w-11 h-11 flex items-center justify-center rounded-[14px] transition-all shadow-md shadow-indigo-100"
            >
              {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            </button>
          </div>
          <p className="text-[10px] text-indigo-400 mt-2 font-bold uppercase tracking-wider ml-1">ИИ разберет текст и заполнит поля за вас</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Предмет</label>
              <div className="relative">
                <BookOpen size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[16px] pl-10 pr-4 py-3 text-slate-700 font-bold outline-none focus:border-emerald-400 focus:bg-white appearance-none">
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Кому (Класс)</label>
              <div className="relative">
                <Users size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[16px] pl-10 pr-4 py-3 text-slate-700 font-bold outline-none focus:border-emerald-400 focus:bg-white appearance-none">
                  <option value="9-A">9-A</option>
                  <option value="9-B">9-B</option>
                  <option value="10-A">10-A</option>
                  <option value="10-B">10-B</option>
                  <option value="11-A">11-A</option>
                </select>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Что нужно сделать</label>
             <div className="relative">
               <AlignLeft size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
               <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Например: решить тест №10..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-[16px] pl-10 pr-4 py-3 text-slate-700 font-bold outline-none focus:border-emerald-400 focus:bg-white resize-none"></textarea>
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Дедлайн</label>
             <div className="relative">
               <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-[16px] pl-10 pr-4 py-3 text-slate-700 font-bold outline-none focus:border-emerald-400 focus:bg-white" />
             </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-[16px] text-lg py-4 mt-4 shadow-lg shadow-indigo-100 transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
            <Send size={20} /> Выдать задание
          </button>
        </form>
      </div>
    </div>
  );
}
