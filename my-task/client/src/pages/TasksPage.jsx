import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api.js';
import TaskModal from '../components/TaskModal.jsx';
import RescheduleModal from '../components/RescheduleModal.jsx';
import confetti from 'canvas-confetti';

export default function TasksPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || 'ALL';
  const initialSearch = queryParams.get('search') || '';
  const initialTaskId = queryParams.get('id');

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate | priority | createdAt

  // Modals & Selected items
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [reschedulingTask, setReschedulingTask] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState({});

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (categoryFilter !== 'ALL') params.categoryId = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const [tasksRes, catRes, goalRes] = await Promise.all([
        api.get('/tasks', { params }),
        api.get('/users/categories'),
        api.get('/goals'),
      ]);

      if (tasksRes.data?.success) {
        let sorted = tasksRes.data.data;
        if (sortBy === 'priority') {
          const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          sorted.sort((a, b) => (order[b.priority] || 0) - (order[a.priority] || 0));
        }
        setTasks(sorted);

        // If URL had id param, open that task for editing
        if (initialTaskId) {
          const target = sorted.find((t) => t.id === initialTaskId);
          if (target) {
            setEditingTask(target);
            setIsModalOpen(true);
          }
        }
      }
      if (catRes.data?.success) setCategories(catRes.data.data);
      if (goalRes.data?.success) setGoals(goalRes.data.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, categoryFilter, search, sortBy, initialTaskId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleComplete = async (taskId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/complete`);
      if (res.data?.success) {
        if (res.data.data.status === 'COMPLETED') {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
      setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    try {
      await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (!selectedTaskIds.length) return;
    try {
      await api.post('/tasks/bulk', {
        taskIds: selectedTaskIds,
        action,
      });
      setSelectedTaskIds([]);
      fetchTasks();
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Tasks Management
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
              {tasks.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, prioritize, and track all your tasks with subtasks and recurrence.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white dark:bg-card-darkBg p-4 rounded-3xl border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-3">
        {/* Top search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none font-medium"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="createdAt">Sort by Created</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none font-medium"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          {[
            { id: 'ALL', label: 'All Tasks' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'OVERDUE', label: 'Overdue ⚠️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Bulk Actions Toolbar (Visible when items selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-primary">
            {selectedTaskIds.length} tasks selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('COMPLETE')}
              className="px-3 py-1.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
            >
              Mark Completed
            </button>
            <button
              onClick={() => handleBulkAction('DELETE')}
              className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedTaskIds([])}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 4. Tasks List */}
      <div className="bg-white dark:bg-card-darkBg rounded-3xl border border-slate-200/80 dark:border-card-darkBorder shadow-card divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              No tasks found
            </h3>
            <p className="text-xs text-slate-400">
              Try adjusting your filter or search criteria, or create a new task.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const isSubtasksOpen = !!expandedSubtasks[task.id];
            const isSelected = selectedTaskIds.includes(task.id);
            const isOverdue = task.status === 'OVERDUE';

            return (
              <div key={task.id} className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-start gap-3.5">
                  {/* Checkbox for bulk actions */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTaskIds((prev) => [...prev, task.id]);
                      } else {
                        setSelectedTaskIds((prev) => prev.filter((id) => id !== task.id));
                      }
                    }}
                    className="mt-1 rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    title="Select task for bulk actions"
                  />

                  {/* Complete toggle checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-primary transition-colors"
                    title={task.status === 'COMPLETED' ? 'Reopen task' : 'Mark task complete'}
                  >
                    {task.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500/20" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-primary" />
                    )}
                  </button>

                  {/* Main Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        onClick={() => {
                          setEditingTask(task);
                          setIsModalOpen(true);
                        }}
                        className={`text-sm sm:text-base font-bold truncate cursor-pointer hover:text-primary transition-colors ${
                          task.status === 'COMPLETED'
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </h3>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                            OVERDUE
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'HIGH'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                              : task.priority === 'LOW'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {new Date(task.dueDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {task.dueTime && ` at ${task.dueTime}`}
                        </span>
                      )}

                      {task.category && (
                        <span
                          className="px-2 py-0.5 rounded-md font-semibold text-[10px]"
                          style={{
                            backgroundColor: `${task.category.color}15`,
                            color: task.category.color,
                          }}
                        >
                          {task.category.name}
                        </span>
                      )}

                      {task.goal && (
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          🎯 {task.goal.title}
                        </span>
                      )}

                      {hasSubtasks && (
                        <button
                          onClick={() =>
                            setExpandedSubtasks((prev) => ({
                              ...prev,
                              [task.id]: !prev[task.id],
                            }))
                          }
                          className="flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          {task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length} subtasks
                          {isSubtasksOpen ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Subtasks Expanded Checklist */}
                    {hasSubtasks && isSubtasksOpen && (
                      <div className="mt-3 pl-4 border-l-2 border-primary/30 space-y-2">
                        {task.subtasks.map((st) => (
                          <label
                            key={st.id}
                            className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={st.isCompleted}
                              onChange={() => handleToggleSubtask(task.id, st.id)}
                              className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                            />
                            <span className={st.isCompleted ? 'line-through text-slate-400' : ''}>
                              {st.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Dropdown / Quick Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isOverdue && (
                      <button
                        onClick={() => setReschedulingTask(task)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                        title="Smart Reschedule"
                      >
                        Reschedule
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit task"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSaved={() => fetchTasks()}
        categories={categories}
        goals={goals}
      />

      {/* Reschedule Modal */}
      {reschedulingTask && (
        <RescheduleModal
          isOpen={!!reschedulingTask}
          task={reschedulingTask}
          onClose={() => setReschedulingTask(null)}
          onRescheduled={() => fetchTasks()}
        />
      )}
    </div>
  );
}
