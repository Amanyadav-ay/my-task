import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  {
    code: 'FIRST_TASK',
    title: 'First Step Forward',
    description: 'Complete your first task on My Task.',
    icon: 'check-circle',
    category: 'TASK',
    badgeLevel: 'BRONZE',
    points: 10,
    requirementCount: 1,
  },
  {
    code: 'TASK_MASTER_10',
    title: 'Productive Momentum',
    description: 'Complete 10 tasks successfully.',
    icon: 'zap',
    category: 'TASK',
    badgeLevel: 'SILVER',
    points: 25,
    requirementCount: 10,
  },
  {
    code: 'TASK_CENTURION',
    title: 'Master of Execution',
    description: 'Complete 50 tasks across your projects.',
    icon: 'award',
    category: 'TASK',
    badgeLevel: 'GOLD',
    points: 100,
    requirementCount: 50,
  },
  {
    code: 'GOAL_SETTER',
    title: 'Visionary',
    description: 'Create your first long-term goal.',
    icon: 'target',
    category: 'GOAL',
    badgeLevel: 'BRONZE',
    points: 15,
    requirementCount: 1,
  },
  {
    code: 'MILESTONE_CRUSHER',
    title: 'Milestone Conqueror',
    description: 'Reach and complete your first goal milestone.',
    icon: 'flag',
    category: 'GOAL',
    badgeLevel: 'SILVER',
    points: 30,
    requirementCount: 1,
  },
  {
    code: 'GOAL_ACHIEVER',
    title: 'Goal Champion',
    description: 'Reach 100% completion on a long-term goal.',
    icon: 'trophy',
    category: 'GOAL',
    badgeLevel: 'GOLD',
    points: 150,
    requirementCount: 1,
  },
  {
    code: 'FOCUS_INITIATE',
    title: 'Deep Work Initiate',
    description: 'Complete your first Pomodoro focus session.',
    icon: 'clock',
    category: 'FOCUS',
    badgeLevel: 'BRONZE',
    points: 15,
    requirementCount: 1,
  },
  {
    code: 'FOCUS_CHAMPION',
    title: 'Focus Champion',
    description: 'Complete 10 focused work sessions without interruptions.',
    icon: 'shield',
    category: 'FOCUS',
    badgeLevel: 'SILVER',
    points: 50,
    requirementCount: 10,
  },
];

async function main() {
  console.log('🌱 Seeding MY TASK database...');

  // 1. Seed Achievements
  console.log('🏆 Seeding Achievements...');
  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      create: ach,
      update: ach,
    });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 2. Seed Student User
  console.log('🎓 Seeding Student User...');
  const student = await prisma.user.upsert({
    where: { email: 'student@mytask.local' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'student@mytask.local',
      passwordHash,
      userType: 'student',
      isVerified: true,
      preferences: {
        create: {
          theme: 'light',
          pomodoroWorkDuration: 25,
          pomodoroShortBreak: 5,
          pomodoroLongBreak: 15,
        },
      },
    },
  });

  // Student Categories
  const catStudy = await prisma.taskCategory.create({
    data: { userId: student.id, name: 'Computer Science', color: '#6C4DE6', icon: 'code', isSystem: true },
  });
  const catMath = await prisma.taskCategory.create({
    data: { userId: student.id, name: 'Calculus III', color: '#3B82F6', icon: 'divide', isSystem: true },
  });
  const catExam = await prisma.taskCategory.create({
    data: { userId: student.id, name: 'Final Exams', color: '#EF4444', icon: 'alert-circle', isSystem: true },
  });

  // Student Goal
  const studentGoal = await prisma.goal.create({
    data: {
      userId: student.id,
      title: 'Ace Fall Semester with 3.8+ GPA',
      description: 'Master data structures, algorithms, and advanced multivariable calculus.',
      category: 'Academic',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      progressPercentage: 40,
      milestones: {
        create: [
          { title: 'Complete Dynamic Programming problem set', isCompleted: true, sortOrder: 0 },
          { title: 'Submit Midterm Project on Graph Algorithms', isCompleted: true, sortOrder: 1 },
          { title: 'Review Calculus chapters 8-12 and formula sheet', isCompleted: false, sortOrder: 2 },
          { title: 'Participate in peer study group sessions', isCompleted: false, sortOrder: 3 },
        ],
      },
    },
  });

  // Student Tasks
  const today = new Date();
  await prisma.task.create({
    data: {
      userId: student.id,
      title: 'Implement Dijkstra and A* Algorithms in Python',
      description: 'Code pathfinding algorithms and visualize shortest paths on grid maps.',
      categoryId: catStudy.id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0),
      dueTime: '18:00',
      estimatedDuration: 90,
      progressPercentage: 50,
      goalId: studentGoal.id,
      subtasks: {
        create: [
          { title: 'Set up priority queue data structure', isCompleted: true, sortOrder: 0 },
          { title: 'Implement Dijkstra relaxation function', isCompleted: true, sortOrder: 1 },
          { title: 'Add Manhattan distance heuristic for A*', isCompleted: false, sortOrder: 2 },
          { title: 'Write unit tests on test graphs', isCompleted: false, sortOrder: 3 },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      userId: student.id,
      title: 'Calculus Problem Set: Vector Fields & Green’s Theorem',
      description: 'Solve textbook problems 14.1 through 14.4 before Wednesday recitation.',
      categoryId: catMath.id,
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      dueTime: '14:30',
      estimatedDuration: 60,
    },
  });

  // 3. Seed Professional User
  console.log('💼 Seeding Working Professional User...');
  const pro = await prisma.user.upsert({
    where: { email: 'pro@mytask.local' },
    update: {},
    create: {
      name: 'Sarah Chen',
      email: 'pro@mytask.local',
      passwordHash,
      userType: 'professional',
      isVerified: true,
      preferences: {
        create: {
          theme: 'dark',
          pomodoroWorkDuration: 30,
          pomodoroShortBreak: 5,
          pomodoroLongBreak: 20,
        },
      },
    },
  });

  const catWork = await prisma.taskCategory.create({
    data: { userId: pro.id, name: 'Product Engineering', color: '#6C4DE6', icon: 'layers', isSystem: true },
  });
  const catMeeting = await prisma.taskCategory.create({
    data: { userId: pro.id, name: 'Executive Syncs', color: '#F59E0B', icon: 'users', isSystem: true },
  });

  const proGoal = await prisma.goal.create({
    data: {
      userId: pro.id,
      title: 'Q4 Enterprise Cloud Migration',
      description: 'Migrate legacy microservices to Kubernetes clusters with zero downtime.',
      category: 'Engineering',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      progressPercentage: 65,
      milestones: {
        create: [
          { title: 'Audit AWS infrastructure & cost estimation', isCompleted: true, sortOrder: 0 },
          { title: 'Containerize authentication and billing services', isCompleted: true, sortOrder: 1 },
          { title: 'Perform load testing and automated failover simulations', isCompleted: false, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      userId: pro.id,
      title: 'Prepare Slide Deck for Architecture Review Board',
      description: 'Present latency benchmarks and cluster auto-scaling topology to VP of Eng.',
      categoryId: catWork.id,
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
      dueTime: '16:00',
      estimatedDuration: 45,
      goalId: proGoal.id,
    },
  });

  // Focus sessions for seed users
  await prisma.focusSession.create({
    data: {
      userId: student.id,
      durationMinutes: 25,
      type: 'WORK',
      completed: true,
      startedAt: new Date(Date.now() - 3600000),
      endedAt: new Date(Date.now() - 3600000 + 25 * 60000),
    },
  });

  await prisma.focusSession.create({
    data: {
      userId: pro.id,
      durationMinutes: 30,
      type: 'WORK',
      completed: true,
      startedAt: new Date(Date.now() - 7200000),
      endedAt: new Date(Date.now() - 7200000 + 30 * 60000),
    },
  });

  console.log('✅ MY TASK Database seeded successfully with demo users!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
