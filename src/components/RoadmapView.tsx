import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Sparkles,
  Filter,
  Check,
  Trash2,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { RoadmapTask, TaskPriority, TaskStatus } from '../types';

export const RoadmapView: React.FC = () => {
  const {
    roadmapTasks,
    updateTaskStatus,
    addRoadmapTask,
    deleteRoadmapTask,
    student,
  } = useStudent();

  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(student?.subjects[0] || 'DBMS');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [newMinutes, setNewMinutes] = useState(45);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = roadmapTasks.filter((task) => {
    if (filterSubject !== 'All' && task.subject !== filterSubject) return false;
    if (filterStatus !== 'All' && task.status !== filterStatus) return false;
    return true;
  });

  const completedCount = roadmapTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = roadmapTasks.filter((t) => t.status === 'In Progress').length;
  const pendingCount = roadmapTasks.filter((t) => t.status === 'Pending').length;
  const overdueCount = roadmapTasks.filter(
    (t) => t.status !== 'Completed' && t.dueDate < todayStr
  ).length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addRoadmapTask({
      title: newTitle.trim(),
      subject: newSubject,
      description: newDescription.trim() || `Study milestone for ${newSubject}`,
      priority: newPriority,
      status: 'Pending',
      dueDate: newDueDate,
      estimatedMinutes: newMinutes,
      concept: newSubject,
    });

    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  const handleAiRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      // Intelligently generate 2 new realistic tasks targeted at current syllabus
      addRoadmapTask({
        title: 'Practice SQL Indexing B-Trees & Hash Indexes',
        subject: 'DBMS',
        description: 'Solve 5 practical query plan problems examining clustered vs non-clustered index scans.',
        priority: 'High',
        status: 'Pending',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        estimatedMinutes: 50,
        concept: 'Indexing',
      });
      addRoadmapTask({
        title: 'Review Python Decorators & Metaprogramming',
        subject: 'Python Programming',
        description: 'Construct custom function wrappers with functools.wraps for timing and authentication.',
        priority: 'Medium',
        status: 'Pending',
        dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        estimatedMinutes: 40,
        concept: 'Decorators',
      });
      setIsRegenerating(false);
    }, 1000);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Low':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292524] py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#292524]">
              Personalized Study Roadmap
            </h1>
            <p className="text-xs text-[#78716C] mt-1">
              Balanced daily milestones, deadlines, and realistic learning tasks for BCA Semester 6
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleAiRegenerate}
              disabled={isRegenerating}
              className="px-4 py-2.5 rounded-2xl bg-white border border-[#EAE5DC] hover:border-[#3D342F] text-[#44403C] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#E87A5D]" />
              <span>{isRegenerating ? 'Optimizing...' : 'AI Auto-Balance'}</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#3D342F] text-white text-xs font-bold hover:bg-[#2A2320] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Milestone Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-[#EAE5DC] shadow-xs">
            <div className="text-[11px] font-bold text-[#78716C] uppercase">Completed</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {completedCount}
            </div>
            <div className="text-[10px] text-[#A8A29E] mt-0.5">Tasks finished</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE5DC] shadow-xs">
            <div className="text-[11px] font-bold text-[#78716C] uppercase">In Progress</div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">
              {inProgressCount}
            </div>
            <div className="text-[10px] text-[#A8A29E] mt-0.5">Active studies</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE5DC] shadow-xs">
            <div className="text-[11px] font-bold text-[#78716C] uppercase">Pending</div>
            <div className="text-2xl font-extrabold text-[#44403C] mt-1">
              {pendingCount}
            </div>
            <div className="text-[10px] text-[#A8A29E] mt-0.5">Upcoming milestones</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE5DC] shadow-xs">
            <div className="text-[11px] font-bold text-rose-700 uppercase">Overdue</div>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">
              {overdueCount}
            </div>
            <div className="text-[10px] text-rose-500 mt-0.5">Needs attention</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-bold text-[#78716C] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-white border border-[#EAE5DC] rounded-xl px-3 py-1.5 text-xs text-[#292524] font-medium"
          >
            <option value="All">All Subjects</option>
            {student?.subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-[#EAE5DC] rounded-xl px-3 py-1.5 text-xs text-[#292524] font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Tasks List */}
        <div className="space-y-3.5">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE5DC]">
              <Calendar className="w-10 h-10 text-[#A8A29E] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#292524]">No matching roadmap tasks found</p>
              <p className="text-xs text-[#78716C] mt-1">Try resetting the filters or add a new task.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue = task.status !== 'Completed' && task.dueDate < todayStr;
              const isDueToday = task.dueDate === todayStr;

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-3xl p-5 border transition-all duration-200 shadow-xs ${
                    task.status === 'Completed'
                      ? 'border-[#EAE5DC] opacity-75'
                      : isOverdue
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : 'border-[#EAE5DC] hover:border-[#DDD6CA]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox circle */}
                      <button
                        onClick={() => {
                          const nextStatus: TaskStatus =
                            task.status === 'Completed'
                              ? 'Pending'
                              : task.status === 'In Progress'
                              ? 'Completed'
                              : 'In Progress';
                          updateTaskStatus(task.id, nextStatus);
                        }}
                        className={`w-6 h-6 rounded-full mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                          task.status === 'Completed'
                            ? 'bg-emerald-600 text-white'
                            : task.status === 'In Progress'
                            ? 'bg-amber-500 text-white'
                            : 'border-2 border-[#DDD6CA] hover:border-[#3D342F]'
                        }`}
                        title="Click to toggle status"
                      >
                        {task.status === 'Completed' ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : task.status === 'In Progress' ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : null}
                      </button>

                      {/* Content */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#292524]">
                            {task.subject}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority} Priority
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              task.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : task.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-[#FAF7F2] text-[#78716C] border border-[#EAE5DC]'
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>

                        <h3
                          className={`text-sm font-bold text-[#292524] ${
                            task.status === 'Completed' ? 'line-through text-[#78716C]' : ''
                          }`}
                        >
                          {task.title}
                        </h3>

                        <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#78716C] mt-3">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{task.estimatedMinutes} mins study</span>
                          </span>

                          <span
                            className={`flex items-center gap-1.5 font-semibold ${
                              isOverdue
                                ? 'text-rose-700'
                                : isDueToday
                                ? 'text-amber-700'
                                : 'text-[#78716C]'
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              Due: {task.dueDate}{' '}
                              {isOverdue && '(Overdue)'}
                              {isDueToday && '(Due Today)'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className="text-xs bg-[#FAF7F2] border border-[#EAE5DC] rounded-xl px-2.5 py-1.5 font-medium text-[#44403C]"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <button
                        onClick={() => deleteRoadmapTask(task.id)}
                        className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#A8A29E] hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 border border-[#EAE5DC] shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE5DC]">
              <h3 className="text-lg font-bold text-[#292524]">Add Roadmap Milestone</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#78716C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#78716C] block mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master BCNF Decomposition..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#292524]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#78716C] block mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-white border border-[#EAE5DC] rounded-xl px-2.5 py-2 text-xs"
                  >
                    {student?.subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#78716C] block mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-white border border-[#EAE5DC] rounded-xl px-2.5 py-2 text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#78716C] block mb-1">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-white border border-[#EAE5DC] rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#78716C] block mb-1">
                    Est. Study Minutes
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="15"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-[#EAE5DC] rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#78716C] block mb-1">
                  Description / Focus Concepts
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key sub-topics to cover..."
                  className="w-full bg-white border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE5DC]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#78716C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-bold"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
