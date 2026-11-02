import { config } from '../config/env.js';
import prisma from '../config/database.js';

export const breakdownTaskWithAI = async (prompt, days = 7) => {
  const targetDays = Math.min(Math.max(parseInt(days, 10) || 7, 3), 30);

  // If Gemini or OpenAI API key is configured, invoke the provider
  if (config.ai.apiKey && config.ai.provider !== 'heuristic') {
    try {
      if (config.ai.provider === 'gemini') {
        const response = await callGeminiAPI(
          `You are an expert productivity coach. Break down this goal or complex project into a day-by-day actionable task plan for ${targetDays} days.
Goal/Project: "${prompt}".
Respond with ONLY valid JSON with this exact structure:
{
  "title": "Short title for the project",
  "summary": "Brief encouraging summary",
  "dailyPlan": [
    {
      "day": 1,
      "title": "Actionable task title",
      "description": "Details on what to do",
      "priority": "HIGH",
      "estimatedDuration": 60,
      "subtasks": ["Step 1", "Step 2"]
    }
  ]
}`
        );
        return JSON.parse(response);
      }
    } catch (err) {
      console.warn('AI API call failed or timed out, falling back to smart heuristic engine:', err.message);
    }
  }

  // Smart Heuristic Engine (Fallback): Always available, reliable, zero external dependencies required
  return generateHeuristicBreakdown(prompt, targetDays);
};

export const suggestSmartSchedule = async (userId) => {
  // Analyze user's pending and overdue tasks
  const pendingTasks = await prisma.task.findMany({
    where: {
      userId,
      status: { in: ['PENDING', 'IN_PROGRESS'] },
    },
    include: { category: true },
    orderBy: [
      { priority: 'desc' },
      { dueDate: 'asc' },
    ],
    take: 10,
  });

  const now = new Date();
  const suggestions = [];

  pendingTasks.forEach((task, index) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < now;
    const suggestedDate = new Date(now);

    // Spread tasks across coming days based on priority
    if (task.priority === 'HIGH' || isOverdue) {
      suggestedDate.setDate(now.getDate() + (index % 2));
      suggestedDate.setHours(10, 0, 0, 0);
    } else if (task.priority === 'MEDIUM') {
      suggestedDate.setDate(now.getDate() + 1 + Math.floor(index / 2));
      suggestedDate.setHours(14, 0, 0, 0);
    } else {
      suggestedDate.setDate(now.getDate() + 3 + Math.floor(index / 2));
      suggestedDate.setHours(16, 0, 0, 0);
    }

    suggestions.push({
      taskId: task.id,
      title: task.title,
      currentDueDate: task.dueDate ? task.dueDate.toISOString() : null,
      suggestedDueDate: suggestedDate.toISOString(),
      reason: isOverdue
        ? 'Overdue item. Rescheduled into your next high-energy morning slot.'
        : `Prioritized as ${task.priority.toLowerCase()} task with optimal focus duration.`,
      estimatedDuration: task.estimatedDuration || 45,
    });
  });

  return {
    analysis: `Analyzed ${pendingTasks.length} pending items. Optimized slots based on task priority, estimated duration, and peak productivity windows.`,
    suggestions,
  };
};

export const getProductivitySuggestions = async (userId) => {
  const [totalCompleted, overdueCount, focusSessions] = await Promise.all([
    prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.task.count({ where: { userId, status: { in: ['PENDING', 'IN_PROGRESS'] }, dueDate: { lt: new Date() } } }),
    prisma.focusSession.count({ where: { userId, completed: true } }),
  ]);

  const suggestions = [];

  if (overdueCount > 0) {
    suggestions.push({
      type: 'RESCHEDULE',
      title: `Clear ${overdueCount} Overdue Tasks`,
      description: 'You have tasks past their deadline. Use Smart Rescheduling to assign realistic deadlines without feeling overwhelmed.',
      actionUrl: '/tasks?status=OVERDUE',
    });
  }

  if (focusSessions === 0) {
    suggestions.push({
      type: 'FOCUS',
      title: 'Boost Focus with Pomodoro Sessions',
      description: 'Try working in 25-minute sprints with 5-minute rest breaks to improve focus and prevent fatigue.',
      actionUrl: '/focus',
    });
  } else {
    suggestions.push({
      type: 'FOCUS',
      title: 'Deep Work Consistency',
      description: 'Great job maintaining focus sessions! Aim for at least two 25-minute Pomodoro sessions today.',
      actionUrl: '/focus',
    });
  }

  if (totalCompleted < 5) {
    suggestions.push({
      type: 'GOAL',
      title: 'Break Large Goals into Bite-Sized Milestones',
      description: 'Big tasks feel daunting. Deconstruct your main goals into daily 30-minute milestones for consistent momentum.',
      actionUrl: '/goals',
    });
  } else {
    suggestions.push({
      type: 'MOMENTUM',
      title: 'Protect Your Peak Hours',
      description: 'Schedule your highest-priority tasks between 9:00 AM and 11:30 AM when cognitive energy is highest.',
      actionUrl: '/my-day',
    });
  }

  return {
    timestamp: new Date().toISOString(),
    suggestions,
  };
};

// Heuristic Generator
function generateHeuristicBreakdown(prompt, days) {
  const cleanPrompt = prompt.trim();
  const title = `Action Plan: ${cleanPrompt}`;

  const plan = [];
  const milestones = [
    { phase: 'Foundations & Setup', focus: 'Understand core concepts, install tools, define scope.' },
    { phase: 'Core Mechanics & Practice', focus: 'Dive into fundamental patterns, build mini-exercises.' },
    { phase: 'Practical Implementation', focus: 'Apply learnings to concrete modules and real problems.' },
    { phase: 'Advanced Features & Polish', focus: 'Refine edge cases, test thoroughly, optimize workflow.' },
    { phase: 'Final Review & Synthesis', focus: 'Consolidate takeaways, document work, celebrate achievement.' },
  ];

  for (let d = 1; d <= days; d++) {
    const phaseIndex = Math.min(Math.floor(((d - 1) / days) * milestones.length), milestones.length - 1);
    const phase = milestones[phaseIndex];

    let taskTitle = `Day ${d}: ${cleanPrompt} - Step ${d}`;
    let subtasks = [
      `Review concepts for ${cleanPrompt} (Day ${d})`,
      `Hands-on practice & implementation`,
      `Log notes and track progress in My Task`,
    ];

    if (d === 1) {
      taskTitle = `Day 1: Setup & Kickoff for ${cleanPrompt}`;
      subtasks = ['Define objectives and success criteria', 'Set up workspace and resources', 'Complete introductory overview'];
    } else if (d === days) {
      taskTitle = `Day ${days}: Final Review, Milestone Check & Wrap-up`;
      subtasks = ['Review completed work', 'Self-evaluation and knowledge audit', 'Archive project and mark goal complete'];
    }

    plan.push({
      day: d,
      title: taskTitle,
      description: `Focus on ${phase.phase.toLowerCase()}: ${phase.focus}`,
      priority: d <= 2 ? 'HIGH' : 'MEDIUM',
      estimatedDuration: 45,
      subtasks,
    });
  }

  return {
    title,
    summary: `Structured ${days}-day milestone breakdown for "${cleanPrompt}". Each day includes clear action items and estimated focus duration.`,
    dailyPlan: plan,
  };
}

async function callGeminiAPI(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.ai.apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
