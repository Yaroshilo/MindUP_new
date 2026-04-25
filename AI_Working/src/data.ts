import { UserProfile, Task } from './types';

export const mockProfile: UserProfile = {
  name: 'Алексей',
  level: 'Ученик',
  points: 1540,
  totalXP: 1540,
  nextLevelPoints: 2000,
  role: 'student'
};

const now = Date.now();
const ONE_DAY = 1000 * 60 * 60 * 24;

export const mockTasks: Task[] = [
  {
    id: '1',
    subject: 'Математика',
    description: 'Подготовиться к МЦКО по математике',
    deadline: 'Завтра',
    dateTimestamp: now + ONE_DAY,
    points: 150,
    priority: 'high',
    status: 'active',
    steps: [
      { id: 's1', title: 'Разобрать демоверсию теста на сайте', isCompleted: false },
      { id: 's2', title: 'Повторить формулы (Теорема Пифагора, площади)', isCompleted: false },
      { id: 's3', title: 'Решить 5 сложных заданий из второй части', isCompleted: false }
    ]
  },
  {
    id: '2',
    subject: 'История',
    description: 'Подготовить доклад по эпохе Петра I',
    deadline: 'Среда, 09:00',
    dateTimestamp: now + ONE_DAY * 2,
    points: 40,
    priority: 'medium',
    status: 'active',
    steps: [
      { id: 's4', title: 'Прочитать параграфы 15-16', isCompleted: false },
      { id: 's5', title: 'Составить краткий план доклада', isCompleted: false },
      { id: 's6', title: 'Оформить презентацию в PowerPoint', isCompleted: false }
    ]
  },
  {
    id: '3',
    subject: 'Литература',
    description: 'Выучить наизусть отрывок "Письмо Татьяны"',
    deadline: 'Четверг, 12:00',
    dateTimestamp: now + ONE_DAY * 3,
    points: 60,
    priority: 'medium',
    status: 'active',
    steps: [
       { id: 's7', title: 'Прочитать отрывок 3 раза вслух', isCompleted: false },
       { id: 's8', title: 'Выучить первую половину', isCompleted: false },
       { id: 's9', title: 'Рассказать перед зеркалом без запинки', isCompleted: false }
    ]
  },
  {
    id: '4',
    subject: 'Физика',
    description: 'Лабораторная работа "Измерение напряжения"',
    deadline: 'Пятница, 10:00',
    dateTimestamp: now + ONE_DAY * 4,
    points: 30,
    priority: 'low',
    status: 'active',
    steps: [
      { id: 's10', title: 'Начертить схему цепи', isCompleted: false },
      { id: 's11', title: 'Записать итоговый вывод', isCompleted: false }
    ]
  }
];
