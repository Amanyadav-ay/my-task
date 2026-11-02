import prisma from '../config/database.js';

export const getCalendarEvents = async (userId, start, end) => {
  const where = { userId };
  if (start && end) {
    where.start = {
      gte: new Date(start),
      lte: new Date(end),
    };
  }

  const events = await prisma.calendarEvent.findMany({
    where,
    include: {
      task: {
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          categoryId: true,
          category: true,
        },
      },
    },
    orderBy: { start: 'asc' },
  });

  // Map to FullCalendar format
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start.toISOString(),
    end: event.end ? event.end.toISOString() : null,
    allDay: event.allDay,
    backgroundColor: event.color || '#6C4DE6',
    borderColor: event.color || '#6C4DE6',
    extendedProps: {
      taskId: event.taskId,
      description: event.description,
      priority: event.task?.priority || 'MEDIUM',
      status: event.task?.status || 'PENDING',
      category: event.task?.category?.name || 'General',
    },
  }));
};

export const createCalendarEvent = async (userId, data) => {
  const { title, description, start, end, allDay = false, color = '#6C4DE6', taskId } = data;

  const event = await prisma.calendarEvent.create({
    data: {
      userId,
      taskId: taskId || null,
      title,
      description: description || null,
      start: new Date(start),
      end: end ? new Date(end) : null,
      allDay: Boolean(allDay),
      color,
    },
    include: { task: true },
  });

  return event;
};

export const updateCalendarEvent = async (userId, eventId, data) => {
  const existing = await prisma.calendarEvent.findFirst({
    where: { id: eventId, userId },
  });

  if (!existing) {
    const error = new Error('Calendar event not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  const { title, description, start, end, allDay, color } = data;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (start !== undefined) updateData.start = new Date(start);
  if (end !== undefined) updateData.end = end ? new Date(end) : null;
  if (allDay !== undefined) updateData.allDay = Boolean(allDay);
  if (color !== undefined) updateData.color = color;

  const updated = await prisma.calendarEvent.update({
    where: { id: eventId },
    data: updateData,
    include: { task: true },
  });

  // If this event is linked to a task, synchronize the task's due date!
  if (existing.taskId && start !== undefined) {
    const newDueDate = new Date(start);
    const hours = String(newDueDate.getHours()).padStart(2, '0');
    const minutes = String(newDueDate.getMinutes()).padStart(2, '0');
    const dueTime = allDay ? null : `${hours}:${minutes}`;

    await prisma.task.update({
      where: { id: existing.taskId },
      data: {
        dueDate: newDueDate,
        dueTime,
      },
    }).catch(() => {});
  }

  return updated;
};

export const deleteCalendarEvent = async (userId, eventId) => {
  const existing = await prisma.calendarEvent.findFirst({
    where: { id: eventId, userId },
  });

  if (!existing) {
    const error = new Error('Calendar event not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  await prisma.calendarEvent.delete({
    where: { id: eventId },
  });

  return true;
};
