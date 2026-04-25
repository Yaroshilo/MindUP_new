import { Camera, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useState } from 'react';

interface Props {
  taskInfo: { id: string; subject: string } | null;
  onClose: () => void;
  onSubmit: (id: string) => void;
}

export default function SubmitWorkModal({ taskInfo, onClose, onSubmit }: Props) {
  const [isPhotoSelected, setIsPhotoSelected] = useState(false);

  if (!taskInfo) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="w-full bg-white rounded-t-[32px] p-6 pb-12 sm:pb-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Сдача работы</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">{taskInfo.subject}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] p-8 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-100 cursor-pointer"
               onClick={() => setIsPhotoSelected(true)}
          >
            {isPhotoSelected ? (
              <div className="text-lime-600 flex flex-col items-center">
                <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mb-3">
                  <Camera size={32} />
                </div>
                <span className="font-bold text-lg">Фото прикреплено!</span>
                <span className="text-sm font-medium text-slate-500 mt-1">Ожидает отправки на проверку</span>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Upload size={28} />
                </div>
                <span className="font-bold text-slate-700 text-lg mb-1">Загрузи решение</span>
                <span className="text-sm font-medium text-slate-500">Сфотографируй тетрадь или загрузи картинку, чтобы ИИ мог её проверить</span>
                
                <div className="flex gap-2 mt-6 w-full">
                  <div className="flex-1 bg-white border border-emerald-100 py-2.5 rounded-[12px] flex flex-col items-center justify-center text-emerald-800 font-bold text-sm shadow-sm">
                    <Camera size={20} className="mb-1" />
                    Камера
                  </div>
                  <div className="flex-1 bg-white border border-emerald-100 py-2.5 rounded-[12px] flex flex-col items-center justify-center text-emerald-800 font-bold text-sm shadow-sm">
                    <ImageIcon size={20} className="mb-1" />
                    Галерея
                  </div>
                </div>
              </>
            )}
          </div>

          <button 
            onClick={() => {
              if (!isPhotoSelected) setIsPhotoSelected(true);
              else onSubmit(taskInfo.id);
            }} 
            className={`w-full font-bold rounded-[16px] text-lg py-4 mt-2 shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${
              isPhotoSelected ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            Отправить на проверку ИИ
          </button>
        </div>
      </div>
    </div>
  );
}
