import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStep, UserProfile } from "../types";

const aiApiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
const ai = aiApiKey ? new GoogleGenAI({ apiKey: aiApiKey }) : null;

/**
 * PARSING: Create a task from voice or text input
 * (Slide Point: "Создание задания: Ученик/учитель передает задание голосом или текстом")
 */
export async function parseTaskFromAI(prompt: string): Promise<Partial<Task>> {
  if (!ai) {
    console.warn("GEMINI_API_KEY not found. Using fallback mock data.");
    return { description: prompt, subject: 'Другое', priority: 'medium', points: 15, deadline: 'Завтра' };
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Разбери следующий текст задания и верни JSON объект. 
    Текст: "${prompt}"
    
    Верни ПОЖАЛУЙСТА строго JSON с полями:
    - subject: название предмета (например: Математика, Английский)
    - description: краткое описание сути задания
    - priority: 'high', 'medium', или 'low'
    - deadline: строка (например: 'Завтра', 'Через 3 дня')
    - points: число от 10 до 50 в зависимости от сложности
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          deadline: { type: Type.STRING },
          points: { type: Type.NUMBER }
        },
        required: ["subject", "description", "priority", "deadline", "points"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("AI Parse Error:", e);
    return { description: prompt, subject: 'Другое', priority: 'medium', points: 15, deadline: 'Завтра' };
  }
}

/**
 * SUPPORT: Breakdown complex tasks into steps
 * (Slide Point: "Поддержка ученика: разбивает задание на этапы")
 */
export async function generateTaskSteps(task: Task): Promise<TaskStep[]> {
  if (!ai) {
    return [
      { id: 'mock-1', title: 'Внимательно прочитать задание', isCompleted: false },
      { id: 'mock-2', title: 'Написать черновик', isCompleted: false },
      { id: 'mock-3', title: 'Проверить и сдать', isCompleted: false }
    ];
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Ты помощник ученика. Составь пошаговый план выполнения задания: "${task.description}" (Предмет: ${task.subject}).
    Верни строго массив объектов JSON. Каждое название шага должно быть понятным и мотивирующим.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            isCompleted: { type: Type.BOOLEAN }
          },
          required: ["title", "isCompleted"]
        }
      }
    }
  });

  try {
    const steps = JSON.parse(response.text || '[]');
    return steps.map((s: any, i: number) => ({ ...s, id: `ai-step-${i}`, isCompleted: false }));
  } catch (e) {
    return [];
  }
}

/**
 * MOTIVATION: Personalized cheers
 * (Slide Point: "Мотивация и достижение: уведомляет родителей о целях, предлагает рекомендации")
 */
export async function getAIMotivation(profile: UserProfile, tasks: Task[]): Promise<string> {
  if (!ai) return "Твоя эффективность растет. Продолжай движение.";

  const activeTasksCount = tasks.filter(t => t.status === 'active').length;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Ученик ${profile.name} (Уровень: ${profile.level}). У него ${activeTasksCount} активных задач. 
    Напиши ОДНО короткое, крутое и современное сообщение-мотивацию для главного экрана. 
    Используй стиль "киберпанк-наставник". Без смайликов. Максимум 10 слов.`,
  });

  return response.text || "Твоя эффективность растет. Продолжай движение.";
}

/**
 * PLANNING: Optimal time suggestion
 * (Slide Point: "Планирование выполнения: ИИ анализирует загрузку, предлагает оптимальное время")
 */
export async function getAIPlanning(tasks: Task[]): Promise<string> {
  if (!ai) return "Начни с самых сложных бизнес-задач сегодня.";

  const urgentCount = tasks.filter(t => t.priority === 'high').length;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `У ученика ${tasks.length} задач, из них ${urgentCount} срочных. 
    Дай краткую рекомендацию по планированию на сегодня (например: "Начни с математики в 16:00"). 
    Только ТЕКСТ, без пояснений.`,
  });

  return response.text || "Начни с самых сложных узлов системы сегодня.";
}

/**
 * ANALYTICS: Identify difficult topics for teachers
 * (Slide Point: "Аналитика и рекомендации: выявляет сложные темы, формирует рекомендации")
 */
export async function analyzeDifficulties(tasks: Task[]): Promise<{ topic: string, advice: string }> {
  if (!ai) return { topic: "Общая успеваемость", advice: "Продолжайте мониторинг активности учеников." };

  const sosMessages = tasks.filter(t => t.hasSos).map(t => `${t.subject}: ${t.sosMessage}`).join("\n");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Проанализируй список проблем учеников и выяви один самый сложный предмет/тему. 
    Дай краткую рекомендацию учителю, что сделать.
    Проблемы:
    ${sosMessages || "Проблем нет, но есть невыполненные задачи."}
    
    Верни строго JSON: { "topic": "Предмет", "advice": "Специфичный совет" }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          advice: { type: Type.STRING }
        },
        required: ["topic", "advice"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { topic: "Общая успеваемость", advice: "Продолжайте мониторинг активности учеников." };
  }
}
