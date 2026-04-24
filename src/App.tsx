import { useState, useEffect } from 'react';
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
import { auth, db } from './services/firebase';
import { doc, getDoc, collection, onSnapshot, query, where, setDoc, updateDoc, addDoc } from 'firebase/firestore';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<FamilyGoal[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');

  const updateUserProfileInDB = async (updates: Partial<UserProfile>) => {
    if (!auth.currentUser) return;
    await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
  };

  const addTasksToDB = async (newTasks: Partial<Task>[]) => {
    try {
      for (const t of newTasks) {
        // Clean data for Firestore (remove undefined)
        const cleanTask = JSON.parse(JSON.stringify({
          ...t,
          status: t.status || 'active',
          classId: t.classId || userProfile?.classId || '9-A' // Ensure classId exists for filtering
        }));
        await addDoc(collection(db, 'tasks'), cleanTask);
      }
    } catch (error) {
      console.error("Error adding tasks:", error);
      showToast("Ошибка при добавлении задачи");
    }
  };

  const updateTaskInDB = async (id: string, updates: Partial<Task>) => {
    await updateDoc(doc(db, 'tasks', id), updates);
  };

  const addGoalToDB = async (reward: string, targetXP: number) => {
    await addDoc(collection(db, 'goals'), { reward, targetXP });
  };


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error("Failed to load user profile:", error);
          setIsLoggedIn(false);
          setUserProfile(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch tasks
  useEffect(() => {
    if (!isLoggedIn || !userProfile) return;

    let targetClassId = userProfile.classId || '9-A';
    if (userProfile.role === 'parent') {
      targetClassId = userProfile.studentId || '9-A'; // Fallback if parents track by student ID or class
    }

    let q;
    if (userProfile.role === 'teacher' && userProfile.subject) {
      // Teachers see tasks for their subject across all classes, OR if it's their class tasks
      q = query(collection(db, 'tasks'), where('subject', '==', userProfile.subject));
    } else {
      q = query(collection(db, 'tasks'), where('classId', '==', targetClassId));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbTasks: Task[] = [];
      snapshot.forEach((doc) => {
        dbTasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(dbTasks);
    });

    return () => unsubscribe();
  }, [isLoggedIn, userProfile]);

  // Fetch goals
  useEffect(() => {
    if (!isLoggedIn || !userProfile) return;
    const q = query(collection(db, 'goals')); // We'll just fetch all or filter by class/family later
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbGoals: FamilyGoal[] = [];
      snapshot.forEach((doc) => {
        dbGoals.push({ id: doc.id, ...doc.data() } as FamilyGoal);
      });
      setGoals(dbGoals);
    });

    return () => unsubscribe();
  }, [isLoggedIn, userProfile]);

  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClassTaskModalOpen, setIsClassTaskModalOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredTasks = tasks.filter(t => {
    if (userProfile?.role === 'student') {
      return t.classId === userProfile.classId;
    }
    if (userProfile?.role === 'teacher') {
      // Teachers see tasks for their subject OR for their own class, OR pending ones in their class
      return (t.subject === userProfile.subject) || (t.classId === userProfile.classId && t.status === 'pending');
    }
    return true; 
  });

  const handleGradeClick = (subject: string, grade: number) => {
    if (grade <= 3) {
      const confirm = window.confirm(`Низкая оценка по предмету ${subject}. Сгенерировать план по исправлению?`);
      if (confirm) {
        const classId = userProfile?.classId || '9-A';
        const newTasks: Partial<Task>[] = [
          { subject, description: `Повторить базовые темы по: ${subject}`, deadline: 'Завтра', status: 'active', priority: 'medium', points: 15, classId },
          { subject, description: `Решить 3 задачи повышенной сложности`, deadline: 'Через 2 дня', status: 'active', priority: 'medium', points: 20, classId },
          { subject, description: `Сдать мини-тест учителю`, deadline: 'Пятница', status: 'active', priority: 'high', points: 30, classId },
        ];
        addTasksToDB(newTasks);
        showToast(`Создан план спасения по предмету ${subject}!`);
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

  const handleLogin = (role: 'student' | 'teacher' | 'parent', name: string, profileData?: Partial<UserProfile>) => {
    setUserProfile(prev => ({ 
      ...prev, 
      name: profileData?.name || name, 
      role,
      classId: profileData?.classId,
      subject: profileData?.subject,
      points: profileData?.points || 0,
      totalXP: profileData?.totalXP || 0,
      level: profileData?.level || 'Новичок'
    }));
    
    // Set landing tab based on role
    if (role === 'student') setActiveTab('home');
    else if (role === 'teacher') setActiveTab('home');
    else if (role === 'parent') setActiveTab('radar');
    
    setIsLoggedIn(true);
  };

  // Student submits the task to "pending" state
  const handleSubmitForReview = (taskId: string, solution?: string) => {
    updateTaskInDB(taskId, { status: 'pending', solution });
    setSelectedTask(null);
    showToast(`Работа отправлена на проверку!`);
  };

  // Student sends an SOS
  const handleSos = (taskId: string, message: string) => {
    updateTaskInDB(taskId, { hasSos: true, sosMessage: message });
    setSelectedTask(null);
    showToast("🆘 Сигнал SOS отправлен учителю!");
  };

  // Teacher actions
  const handleTeacherApprove = (taskId: string, rating: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !userProfile) return;

    if (userProfile.role === 'teacher' && task.classId !== userProfile.classId) {
       showToast("Ошибка доступа: Это не ваш класс!");
       return;
    }

    updateTaskInDB(taskId, { status: 'completed' });
    
    // In a real app we'd update the student's profile, not the teacher's profile.
    showToast(`Работа оценена на ${rating}! Ученику отправлено +${task.points} XP`);
  };

  const handleTeacherReturn = (taskId: string) => {
    updateTaskInDB(taskId, { status: 'active' });
    showToast('Работа отправлена на доработку');
  };

  const handleTeacherReplySos = (taskId: string) => {
    updateTaskInDB(taskId, { hasSos: false, sosMessage: '' });
    showToast('Вы ответили ученику (Сигнал снят)');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center font-sans">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn || !userProfile) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center font-sans sm:p-4 selection:bg-emerald-200">
      <div className="w-full sm:w-[400px] h-[100dvh] sm:h-[800px] bg-emerald-50 sm:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col sm:border-[8px] border-emerald-900">
        
        {/* Dynamic content area */}
        <main className="flex-1 overflow-y-auto pb-24 w-full relative">
          
          {/* STUDENT VIEWS */}
          {userProfile.role === 'student' && activeTab === 'home' && (
            <HomeScreen profile={userProfile} tasks={filteredTasks} goals={goals} onChangeTab={(tab) => setActiveTab(tab)} onTaskClick={setSelectedTask} />
          )}
          {userProfile.role === 'student' && activeTab === 'tasks' && (
            <TasksScreen tasks={filteredTasks} onTaskClick={setSelectedTask} />
          )}
          {activeTab === 'calendar' && (
            <CalendarScreen role={userProfile.role} tasks={filteredTasks} goals={goals} />
          )}

          {/* PARENT VIEWS */}
          {userProfile.role === 'parent' && activeTab === 'radar' && (
            <ParentRadarScreen 
              tasks={filteredTasks} 
              profilePoints={userProfile.totalXP} 
              goals={goals} 
              onAddGoal={(reward, xp) => addGoalToDB(reward, xp)} 
            />
          )}
          {userProfile.role === 'parent' && activeTab === 'goals' && (
            <ParentGoalsScreen 
              goals={goals} 
              profile={userProfile} 
              onAddGoal={(reward, xp) => addGoalToDB(reward, xp)} 
            />
          )}

          {/* TEACHER VIEWS */}
          {userProfile.role === 'teacher' && activeTab === 'home' && (
            <TeacherWorkspaceScreen 
              tasks={filteredTasks} 
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
              onLogout={() => {
                setIsLoggedIn(false);
                setUserProfile(null);
                auth.signOut();
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
            currentUser={userProfile}
            onAdd={(t) => {
              addTasksToDB([t]);
            }}
          />
        )}

        {isClassTaskModalOpen && (
          <AddClassTaskModal
            isOpen={isClassTaskModalOpen}
            onClose={() => setIsClassTaskModalOpen(false)}
            currentTeacher={userProfile}
            onAssign={(t) => {
              addTasksToDB([t]);
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
