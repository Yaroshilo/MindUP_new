import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Mock Database
  let tasks: any[] = [];

  // API routes
  app.post("/api/ai-parse", async (req, res) => {
    const { prompt, strictness = 30 } = req.body;
    
    // Map strictness (0-100) to temperature (1.0 - 0.0)
    // 0 strictness = 1.0 temp (creative), 100 strictness = 0.0 temp (focused)
    const temperature = (100 - strictness) / 100;

    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';

    try {
      console.log(`Sending prompt to Ollama (Temp: ${temperature.toFixed(2)}):`, prompt);
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama3.1", 
          prompt: `Ты — продвинутый планировщик школьных задач.
            Текст пользователя: "${prompt}"
            
            Твоя цель: разбить сообщение на ОТДЕЛЬНЫЕ задачи и перефразировать их.
            
            Правила:
            1. Если в тексте несколько предметов или дел, создай отдельный объект для каждого.
            2. Перефразируй описание, чтобы оно начиналось с глагола (например, "Решить", "Прочитать", "Сдать").
            3. Срок сдачи (deadline) ВСЕГДА должен быть в формате ДД.ММ.ГГГГ. Если дата не ясна, используй сегодняшнюю дату (${new Date().toLocaleDateString('ru-RU')}).
            
            Верни СТРОГО массив JSON объектов. Каждая задача должна иметь поля: "subject", "task", "deadline", "priority" (low, medium, high).
            
            Пример вывода:
            [
              {"subject": "Алгебра", "task": "Решить №45", "deadline": "24.04.2026", "priority": "high"}
            ]`,
          format: "json",
          stream: false,
          options: {
            temperature: temperature
          }
        }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
      
      const data = await response.json();
      console.log('Ollama raw response:', data.response);
      
      let tasksArray;
      try {
        // Try parsing the response directly
        tasksArray = JSON.parse(data.response);
      } catch (e) {
        // Fallback to regex if parsing fails (Ollama might sometimes wrap JSON in text even with format: json)
        const jsonMatch = data.response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON array found in AI response');
        tasksArray = JSON.parse(jsonMatch[0]);
      }
      
      if (!Array.isArray(tasksArray)) tasksArray = [tasksArray];
      
      res.json(tasksArray);
      
    } catch (error) {
      console.error('Detailed AI Error:', error);
      res.json([{
          subject: "Школа",
          task: prompt,
          deadline: "Скоро",
          priority: "medium"
      }]);
    }
  });

  app.post("/api/ai-check-solution", async (req, res) => {
    const { taskContext, solution, isImage = false, strictness = 50 } = req.body;
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
    
    // Map strictness (0-100) to temperature (1.0 - 0.0)
    const temperature = (100 - strictness) / 100;

    try {
      const prompt = `Ты — строгий, но справедливый школьный учитель. Твоя задача — проверить решение ученика.
        
        ЗАДАНИЕ: "${taskContext}"
        ${isImage ? 'ПРОАНАЛИЗИРУЙ ПРИКРЕПЛЕННОЕ ИЗОБРАЖЕНИЕ РЕШЕНИЯ.' : `РЕШЕНИЕ УЧЕНИКА: "${solution}"`}
        
        Проанализируй решение и дай оценку по 5-балльной шкале. 
        Напиши краткий, мотивирующий комментарий (feedback) на 1-2 предложения.
        
        Верни ответ СТРОГО в формате JSON:
        {"grade": "Оценка (например 4 или 5-)", "feedback": "Твой комментарий"}
      `;

      const requestBody: any = {
        model: isImage ? "llava" : "llama3.1",
        prompt,
        stream: false,
        format: "json",
        options: {
          temperature: temperature
        }
      };

      if (isImage) {
        // Ollama expects images as an array of base64 strings (without the data:image/... prefix)
        const base64Data = solution.replace(/^data:image\/\w+;base64,/, "");
        requestBody.images = [base64Data];
      }

      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
      
      const data = await response.json();
      let checkResult;
      
      try {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        checkResult = JSON.parse(jsonMatch ? jsonMatch[0] : data.response);
      } catch (e) {
        throw new Error('Failed to parse JSON from AI response');
      }
      
      res.json(checkResult);
      
    } catch (error) {
      console.error('AI Check Error:', error);
      res.status(500).json({ 
        grade: '?', 
        feedback: 'ИИ не смог проверить решение (Ошибка связи с Ollama). Проверьте запущен ли сервер локально и установлена ли модель llava для проверки фото.' 
      });
    }
  });

  app.get("/api/tasks", (req, res) => {
    res.json(tasks);
  });

  app.post("/api/tasks/save", (req, res) => {
    const taskData = req.body;
    const index = tasks.findIndex(t => t.id === taskData.id);
    if(index > -1) {
        tasks[index] = taskData;
    } else {
        tasks.push(taskData);
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
