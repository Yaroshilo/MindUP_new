import React, { useState, useRef } from 'react';
import { Task } from '../types';
import { ArrowLeft, CheckCircle2, Clock, Star, Flame, LifeBuoy, X, Send, Camera, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  task: Task;
  onBack: () => void;
  onComplete: (id: string, solution: string) => void;
  onSos?: (id: string, message: string) => void;
}

export default function TaskDetailScreen({ task, onBack, onComplete, onSos }: Props) {
  const [steps, setSteps] = useState(task.steps || []);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosReason, setSosReason] = useState("");
  
  const [isChecking, setIsChecking] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [solutionText, setSolutionText] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<{ grade: string; feedback: string } | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [strictness, setStrictness] = useState(50);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleStep = (stepId: string) => {
    setSteps(current => current.map(s => 
      s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
    ));
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setCheckError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAiCheck = async () => {
    if (!capturedImage && !solutionText.trim()) return;
    setIsChecking(true);
    setAiAnalysis(null);
    setCheckError(null);

    try {
      const response = await fetch('/api/ai-check-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          solution: capturedImage || solutionText,
          taskContext: task.description,
          isImage: !!capturedImage,
          strictness
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setCheckError(data.feedback || 'Ошибка связи с ИИ');
        return;
      }

      setAiAnalysis({
        grade: data.grade || '5',
        feedback: data.feedback || 'Отличная работа! Все решено верно.'
      });
    } catch (err) {
      console.error('AI Check Error:', err);
      setCheckError('Не удалось подключиться к серверу проверки (Ollama). Убедитесь, что сервер запущен локально.');
    } finally {
      setIsChecking(false);
    }
  };

  const isUrgent = task.priority === 'high' && task.status === 'active';
  const isCompleted = task.status === 'completed';
  const allStepsCompleted = steps.length > 0 && steps.every(s => s.isCompleted);

  return (
    <div className="absolute inset-0 z-50 bg-emerald-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-emerald-50 px-4 py-4 border-b border-emerald-100 flex items-center shadow-sm shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800 ml-2">Детали задачи</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 p-4 sm:p-6 space-y-6">
        {/* Task Info block */}
        <div className={`bg-emerald-100/40 rounded-[28px] p-6 shadow-sm border-2 ${isUrgent ? 'border-red-400 shadow-red-100' : 'border-emerald-100/50'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-[10px] inline-flex items-center gap-1.5 ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
               {isUrgent ? <><Flame size={14} className="fill-red-500" /> Горящая задача</> : task.subject}
            </div>
            <div className="flex items-center gap-1 text-[13px] font-bold text-lime-700 bg-lime-100 px-3 py-1 rounded-[10px]">
              <Star size={14} className="fill-lime-500 text-lime-500" />
              +{task.points} ХР
            </div>
          </div>

          <h2 className={`text-2xl sm:text-3xl font-extrabold leading-tight mb-4 ${isUrgent ? 'text-red-500' : 'text-slate-800'}`}>
            {task.description}
          </h2>

          <div className="flex items-center gap-2 text-slate-500 font-bold text-[15px]">
            <Clock size={18} strokeWidth={2.5} className="text-emerald-500" />
            Срок: {task.deadline}
          </div>
        </div>

        {/* Decomposition Block */}
        {steps.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
            <h3 className="font-bold text-slate-800 text-xl px-1">
              Шаги для выполнения 
              <span className="block text-[13px] text-slate-400 font-bold uppercase tracking-wider mt-1 opacity-80">
                ⚡️ План от наставника
              </span>
            </h3>
            
            <div className="bg-white rounded-[28px] shadow-sm overflow-hidden p-2 border border-slate-100">
              {steps.map(step => (
                <label key={step.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-[20px] cursor-pointer transition-colors group">
                  <div className="mt-0.5 relative flex items-center justify-center shrink-0">
                    <input 
                      type="checkbox" 
                      checked={step.isCompleted || isCompleted} 
                      onChange={() => toggleStep(step.id)}
                      disabled={isCompleted}
                      className="peer appearance-none w-7 h-7 border-2 border-slate-300 rounded-[10px] checked:bg-lime-500 checked:border-lime-500 disabled:opacity-50 transition-all cursor-pointer"
                    />
                    <CheckCircle2 size={18} strokeWidth={3} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className={`flex-1 text-[17px] font-bold leading-snug transition-all ${(step.isCompleted || isCompleted) ? 'text-slate-400 line-through decoration-2' : 'text-slate-700 group-hover:text-slate-900'}`}>
                    {step.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom sticky action */}
      {!isCompleted && (
        <div className="absolute bottom-0 w-full bg-white p-4 pb-8 sm:pb-4 border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-500 flex gap-3">
          <button 
            onClick={() => setIsSosModalOpen(true)} 
            className="bg-orange-100 text-orange-600 p-4 rounded-[22px] shadow-sm hover:bg-orange-200 transition-colors flex items-center justify-center shrink-0 active:scale-95"
            aria-label="Попросить помощи"
          >
             <LifeBuoy size={26} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setShowPhotoModal(true)}
            className={`flex-1 py-4 text-lg font-bold rounded-[22px] transition-all flex justify-center items-center gap-2 shadow-lg active:scale-[0.98] ${
              allStepsCompleted 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.4)] tracking-wide scale-[1.02]' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
            }`}
          >
            <Camera size={26} strokeWidth={2.5} /> 
            Проверить и сдать
          </button>
        </div>
      )}

      {/* Photo AI Check Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Sparkles size={24} className="text-emerald-500" />
                  ИИ-Проверка
                </h2>
                <button 
                  onClick={() => { setShowPhotoModal(false); setCapturedImage(null); setAiAnalysis(null); setCheckError(null); }}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Result Block */}
                {aiAnalysis ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-2"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-lime-100 text-lime-600 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0 shadow-inner">
                          {aiAnalysis.grade}
                       </div>
                       <div className="p-4 bg-emerald-50 rounded-[20px] border border-emerald-100 text-sm font-bold text-emerald-800 flex-1 leading-snug">
                          {aiAnalysis.feedback}
                       </div>
                    </div>

                    <button 
                      onClick={() => onComplete(task.id, capturedImage || solutionText)}
                      className="w-full py-4 bg-lime-500 text-white rounded-[20px] font-black shadow-lg shadow-lime-200 flex items-center justify-center gap-2"
                    >
                      Завершить квест <CheckCircle2 size={20} />
                    </button>
                    <button 
                      onClick={() => { setAiAnalysis(null); setCheckError(null); }}
                      className="w-full py-2 text-slate-400 font-bold text-xs uppercase"
                    >
                       Вернуться к редактированию
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {/* Error Block */}
                    {checkError && (
                      <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-xs font-bold leading-relaxed">
                         ⚠️ {checkError}
                      </div>
                    )}

                    {/* Image Placeholder or Result */}
                    {capturedImage ? (
                      <div className="relative rounded-[24px] overflow-hidden shadow-lg border-2 border-emerald-100">
                        <img src={capturedImage} alt="Solution" className="w-full h-auto" />
                        {isChecking && (
                          <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                             <Loader2 size={48} className="animate-spin mb-4" />
                             <span className="font-black text-lg text-center px-4">MindUp ИИ проверяет...</span>
                          </div>
                        )}
                        <button 
                          onClick={() => setCapturedImage(null)}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        {!aiAnalysis && !isChecking && (
                          <div className="space-y-4">
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-[4/3] border-4 border-dashed border-emerald-100 rounded-[24px] flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all cursor-pointer bg-emerald-50/30"
                            >
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                                <Camera size={32} />
                              </div>
                              <span className="font-bold text-center px-4 text-sm">Сфотографировать решение</span>
                            </div>

                            <div className="relative flex items-center gap-3 py-2 text-slate-400">
                              <div className="h-px bg-slate-100 flex-1"></div>
                              <span className="text-[10px] font-bold uppercase tracking-wider">Или введи текст</span>
                              <div className="h-px bg-slate-100 flex-1"></div>
                            </div>

                            <div className="relative">
                              <textarea
                                value={solutionText}
                                onChange={(e) => setSolutionText(e.target.value)}
                                placeholder="Введи свое решение здесь..."
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[20px] p-4 text-sm font-semibold focus:border-emerald-400 focus:bg-white transition-all outline-none resize-none h-32"
                              />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Строгость ИИ</span>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg">{strictness}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" max="100" 
                                value={strictness}
                                onChange={(e) => setStrictness(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                              />
                              <p className="text-[9px] text-slate-400 font-bold mt-1 leading-tight">
                                {strictness > 70 ? '🐢 Максимально строго: ИИ будет придираться к мелочам.' : strictness < 30 ? '🦄 Творчески: ИИ приветствует нестандартный подход.' : '⚖️ Сбалансированный режим.'}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {isChecking && !capturedImage && (
                       <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 flex flex-col items-center justify-center gap-3 animate-pulse">
                          <Loader2 size={32} className="text-emerald-500 animate-spin" />
                          <span className="font-black text-emerald-600">ИИ анализирует текст...</span>
                       </div>
                    )}

                    {!isChecking && (capturedImage || solutionText.trim()) && (
                      <button 
                        onClick={startAiCheck}
                        className="w-full py-4 bg-emerald-600 text-white rounded-[20px] font-black shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Sparkles size={20} /> Проверить решение
                      </button>
                    )}
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={fileInputRef} 
                  onChange={handleCapture}
                  className="hidden" 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOS Modal */}
      {isSosModalOpen && (
        <AnimatePresence>
          <div className="absolute inset-0 z-[60] flex items-end justify-center bg-slate-900/70 backdrop-blur-md transition-opacity">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-white rounded-t-[32px] p-6 pb-12 sm:pb-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-orange-500">
                  <LifeBuoy size={24} />
                  <h2 className="text-xl font-bold text-slate-800">Запрос помощи</h2>
                </div>
                <button onClick={() => setIsSosModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-sm font-semibold text-slate-500 mb-4">Что именно не получается?</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {['Не понимаю формулу', 'Не могу найти материал', 'Нужен пример', 'Сложно начать'].map(hint => (
                  <button 
                    key={hint} 
                    onClick={() => setSosReason(hint)}
                    className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full font-semibold text-sm hover:bg-orange-100 transition-colors border border-orange-100"
                  >
                    {hint}
                  </button>
                ))}
              </div>

              <textarea 
                rows={3} 
                value={sosReason}
                onChange={(e) => setSosReason(e.target.value)}
                placeholder="Опиши свою проблему здесь..."
                className="w-full border-2 border-slate-100 rounded-[20px] px-4 py-3.5 text-slate-800 font-semibold focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none resize-none mb-6"
              ></textarea>

              <button 
                onClick={() => { setIsSosModalOpen(false); onSos?.(task.id, sosReason); }}
                disabled={!sosReason.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:shadow-none text-white font-bold rounded-[20px] text-lg py-4 shadow-lg shadow-orange-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Отправить учителю
              </button>
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
