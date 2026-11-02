import React, { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api.js';
import TaskModal from '../components/TaskModal.jsx';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const calendarRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    try {
      const [eventsRes, catRes, goalRes] = await Promise.all([
        api.get('/calendar/events'),
        api.get('/users/categories'),
        api.get('/goals'),
      ]);

      if (eventsRes.data?.success) {
        setEvents(eventsRes.data.data);
      }
      if (catRes.data?.success) setCategories(catRes.data.data);
      if (goalRes.data?.success) setGoals(goalRes.data.data);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle Event Drop (Drag-and-Drop Rescheduling)
  const handleEventDrop = async (info) => {
    const { event } = info;
    const eventId = event.id;
    const newStart = event.startStr;
    const newEnd = event.endStr;

    try {
      await api.patch(`/calendar/events/${eventId}`, {
        start: newStart,
        end: newEnd || null,
      });
      // Synchronized in backend database
    } catch (err) {
      console.error('Failed to reschedule event:', err);
      info.revert();
    }
  };

  // Handle Date Click (Quick schedule task on clicked day)
  const handleDateClick = (info) => {
    setSelectedTask({
      dueDate: info.dateStr,
      dueTime: '12:00',
    });
    setIsTaskModalOpen(true);
  };

  // Handle Event Click (Open Task details)
  const handleEventClick = async (info) => {
    const taskId = info.event.extendedProps?.taskId;
    if (taskId) {
      try {
        const res = await api.get(`/tasks/${taskId}`);
        if (res.data?.success) {
          setSelectedTask(res.data.data);
          setIsTaskModalOpen(true);
        }
      } catch (err) {
        console.error('Error opening task from calendar:', err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Interactive Calendar
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
              FullCalendar
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drag-and-drop tasks to reschedule deadlines. Click any date to schedule instantly.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Scheduled Task</span>
        </button>
      </div>

      {/* 2. Calendar Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          editable={true}
          droppable={true}
          selectable={true}
          events={events}
          eventDrop={handleEventDrop}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={3}
        />
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSaved={() => fetchEvents()}
        categories={categories}
        goals={goals}
      />
    </div>
  );
}
