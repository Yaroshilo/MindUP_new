import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import TasksScreen from './screens/TasksScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddTaskModal from './components/AddTaskModal';
import TaskDetailScreen from './screens/TaskDetailScreen';
import CalendarScreen from './screens/CalendarScreen';
import AuthScreen from './screens/AuthScreen';
import ParentRadarScreen from './screens/ParentRadarScreen';
import ParentGoalsScreen from './screens/ParentGoalsScreen';
import TeacherWorkspaceScreen from './screens/TeacherWorkspaceScreen';
import TeacherClassesScreen from './screens/TeacherClassesScreen';
import AddClassTaskModal from './components/AddClassTaskModal';
import { Task, UserProfile, FamilyGoal, Priority } from './types';
import { mockTasks, mockProfile } from './data';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(mockProfile);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [goals, setGoals] = useState<FamilyGoal[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClassTaskModalOpen, setIsClassTaskModalOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleGradeClick = (subject: string, grade: number) => {
    if (grade <= 3) {
      const confirm = window.confirm(`Низкая оценка по предмету ${subject}. Сгенерировать план по исправлению?`);
      if (confirm) {
        const newTasks: Task[] = [
          { id: Date.now().toString() + '1', subject, description: `Повторить базовые темы по: ${subject}`, deadline: 'Завтра', status: 'active', priority: 'medium', points: 15 },
          { id: Date.now().toString() + '2', subject, description: `Решить 3 задачи повышенной сложности`, deadline: 'Через 2 дня', status: 'active', priority: 'medium', points: 20 },
          { id: Date.now().toString() + '3', subject, description: `Сдать мини-тест учителю`, deadline: 'Пятница', status: 'active', priority: 'high', points: 30 },
        ];
        setTasks(prev => [...prev, ...newTasks]);
        showToast(`План исправления оценки по предмету ${subject} создан!`);
        setActiveTab('tasks');
      }
    }
  };

  // Expose to window for ProfileScreen buttons
  (window as any).handleGradeClick = handleGradeClick;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogin = (role: 'student' | 'teacher' | 'parent', name: string) => {
    setUserProfile(prev => ({ 
      ...prev, 
      name, 
      role,
      // Reset some stats for a fresh feel
      points: role === 'student' ? 45 : 0,
      totalXP: role === 'student' ? 1245 : 0
    }));
    
    // Set landing tab based on role
    if (role === 'student') setActiveTab('home');
    else if (role === 'teacher') setActiveTab('home');
    else if (role === 'parent') setActiveTab('radar');
    
    setIsLoggedIn(true);
  };

  // Student submits the task to "pending" state
  const handleSubmitForReview = (taskId: string, solution?: string) => {
    setTasks(current => current.map(t => 
      t.id === taskId ? { ...t, status: 'pending', solution } : t
    ));
    setSelectedTask(null);
    showToast(`Работа отправлена на проверку!`);
  };

  // Student sends an SOS
  const handleSos = (taskId: string, message: string) => {
    setTasks(current => current.map(t => 
      t.id === taskId ? { ...t, hasSos: true, sosMessage: message } : t
    ));
    setSelectedTask(null);
    showToast("🆘 Сигнал SOS отправлен учителю!");
  };

  // Teacher actions
  const handleTeacherApprove = (taskId: string, rating: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // Find the task and mark it completed
      setTasks(current => current.map(t => 
        t.id === taskId ? { ...t, status: 'completed' } : t
      ));
      
      const prevTotal = userProfile.totalXP;
      const newTotalRaw = prevTotal + task.points;

      // Check if any goals were just reached based on ALL-TIME XP
      goals.forEach(goal => {
         if (prevTotal < goal.targetXP && newTotalRaw >= goal.targetXP) {
            setTimeout(() => {
              showToast(`🎉 Совместная цель "${goal.reward}" достигнута!`);
            }, 500); // Slight delay for second toast
         }
      });
      
      // Simulate adding points to the student profile 
      setUserProfile(prev => {
        let newPoints = prev.points + task.points;
        let newTotal = prev.totalXP + task.points;
        let newLevel = prev.level;
        let newNext = prev.nextLevelPoints;
  
        if (newPoints >= newNext) {
          newPoints = newPoints - newNext; 
          newNext = Math.floor(newNext * 1.5); 
          
          const levels = ['Новичок', 'Ученик', 'Бывалый', 'Ударник', 'Отличник', 'Гений', 'Магистр'];
          const currIdx = levels.indexOf(newLevel);
          if (currIdx !== -1 && currIdx < levels.length - 1) {
            newLevel = levels[currIdx + 1];
          }
        }
        return { ...prev, points: newPoints, totalXP: newTotal, nextLevelPoints: newNext, level: newLevel };
      });
      showToast(`Работа оценена на ${rating}! Ученик получил +${task.points} XP`);
    }
  };

  const handleTeacherReturn = (taskId: string) => {
    setTasks(current => current.map(t => 
      t.id === taskId ? { ...t, status: 'active' } : t
    ));
    showToast('Работа отправлена на доработку');
  };

  const handleTeacherReplySos = (taskId: string) => {
    setTasks(current => current.map(t => 
      t.id === taskId ? { ...t, hasSos: false, sosMessage: undefined } : t
    ));
    showToast('Вы ответили ученику (Сигнал снят)');
  };

  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center font-sans sm:p-4 selection:bg-emerald-200">
      <div className="w-full sm:w-[400px] h-[100dvh] sm:h-[800px] bg-emerald-50 sm:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col sm:border-[8px] border-emerald-900">
        
        {/* Dynamic content area */}
        <main className="flex-1 overflow-y-auto pb-24 w-full relative">
          
          {/* STUDENT VIEWS */}
          {userProfile.role === 'student' && activeTab === 'home' && (
            <HomeScreen profile={userProfile} tasks={tasks} goals={goals} onChangeTab={(tab) => setActiveTab(tab)} onTaskClick={setSelectedTask} />
          )}
          {userProfile.role === 'student' && activeTab === 'tasks' && (
            <TasksScreen tasks={tasks} onTaskClick={setSelectedTask} />
          )}
          {activeTab === 'calendar' && (
            <CalendarScreen role={userProfile.role} tasks={tasks} goals={goals} />
          )}

          {/* PARENT VIEWS */}
          {userProfile.role === 'parent' && activeTab === 'radar' && (
            <ParentRadarScreen tasks={tasks} profilePoints={userProfile.totalXP} goals={goals} onAddGoal={(reward, xp) => setGoals([...goals, { id: Date.now().toString(), reward, targetXP: xp }])} />
          )}
          {userProfile.role === 'parent' && activeTab === 'goals' && (
            <ParentGoalsScreen goals={goals} profile={userProfile} onAddGoal={(reward, xp) => setGoals([...goals, { id: Date.now().toString(), reward, targetXP: xp }])} />
          )}

          {/* TEACHER VIEWS */}
          {userProfile.role === 'teacher' && activeTab === 'home' && (
            <TeacherWorkspaceScreen 
              tasks={tasks} 
              onAcceptTask={handleTeacherApprove}
              onReturnTask={handleTeacherReturn}
              onReplySos={handleTeacherReplySos}
            />
          )}
          {userProfile.role === 'teacher' && activeTab === 'classes' && (
            <TeacherClassesScreen />
          )}

          {/* COMMON VIEWS */}
          {activeTab === 'profile' && (
            <ProfileScreen 
              profile={userProfile} 
              onLogout={() => setIsLoggedIn(false)} 
              onRoleChange={(role) => {
                // Students cannot switch roles
                if (userProfile.role === 'student') {
                  showToast('Ученики не могут менять свою роль.');
                  return;
                }
                setUserProfile(prev => ({ ...prev, role }));
                if (role === 'student') setActiveTab('home');
                if (role === 'parent') setActiveTab('radar');
                if (role === 'teacher') setActiveTab('home');
              }}
              onBuyReward={(price, name) => {
                if (userProfile.points >= price) {
                  setUserProfile(prev => ({ ...prev, points: prev.points - price }));
                  showToast(`🎁 Успешно куплено: ${name}!`);
                } else {
                  showToast(`Недостаточно XP для покупки!`);
                }
              }}
            />
          )}
        </main>

        {/* Floating Action Buttons */}
        {userProfile.role === 'student' && (activeTab === 'home' || activeTab === 'tasks') && !selectedTask && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="absolute bottom-24 right-6 w-14 h-14 bg-lime-400 hover:bg-lime-500 rounded-2xl shadow-lg flex items-center justify-center text-blue-900 transition-transform active:scale-95 z-20"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        )}

        {userProfile.role === 'teacher' && (activeTab === 'home' || activeTab === 'classes') && (
          <button
             onClick={() => setIsClassTaskModalOpen(true)}
             className="absolute bottom-24 right-4 flex items-center gap-2 px-5 h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-600/30 text-white transition-transform active:scale-95 z-20 font-bold"
          >
             <Plus size={24} strokeWidth={2.5} />
             Выдать задание
          </button>
        )}

        {/* Task Details Overlay (For student) */}
        {selectedTask && userProfile.role === 'student' && (
           <TaskDetailScreen 
             task={selectedTask} 
             onBack={() => setSelectedTask(null)}
             onComplete={(id, solution) => handleSubmitForReview(id, solution)}
             onSos={(id, reason) => handleSos(id, reason)}
           />
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onChange={setActiveTab} role={userProfile.role} />

        {/* Modals */}
        {isAddModalOpen && (
          <AddTaskModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={(t) => {
              // Добавляем случайное число к ID, чтобы избежать дубликатов при создании пачки задач через ИИ
              setTasks(prev => [...prev, { ...t, id: Date.now().toString() + Math.random().toString(36).substr(2, 5), status: 'active' }]);
            }}
          />
        )}

        {isClassTaskModalOpen && (
          <AddClassTaskModal
            isOpen={isClassTaskModalOpen}
            onClose={() => setIsClassTaskModalOpen(false)}
            onAssign={(t) => {
              setTasks(prev => [...prev, { ...t, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) } as Task]);
              showToast('Задание успешно отправлено классу!');
            }}
          />
        )}
        
        {/* Custom Toast Snackbar */}
        {toastMessage && (
          <div className="absolute top-4 left-4 right-4 z-[100] bg-lime-400 text-lime-950 font-bold p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-10 duration-500">
            <span className="text-3xl">🎯</span>
            <span className="leading-snug flex-1">{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
