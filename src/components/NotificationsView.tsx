import React from 'react';
import {
  ChevronLeft,
  Clock,
  Award,
  BarChart2,
  Bell,
  CheckCheck,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useStudent, AppView } from '../context/StudentContext';
import { NotificationItem } from '../types';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    setActiveView,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useStudent();

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.title.includes('DBMS') || item.message.includes('DBMS')) {
      setActiveView('practice');
    } else if (item.type === 'achievement' || item.type === 'progress') {
      setActiveView('analytics');
    } else if (item.title.includes('Deadline') || item.title.includes('Roadmap')) {
      setActiveView('roadmap');
    }
  };

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'achievement':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#595747] text-white flex items-center justify-center shadow-xs shrink-0">
            <Award className="w-6 h-6" />
          </div>
        );
      case 'progress':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#ECE7DF] text-[#44403C] flex items-center justify-center shadow-2xs shrink-0">
            <BarChart2 className="w-6 h-6" />
          </div>
        );
      case 'study_reminder':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#ECE7DF] text-[#44403C] flex items-center justify-center shadow-2xs shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292524] py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setActiveView('dashboard')}
            className="w-10 h-10 rounded-2xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#44403C] hover:bg-[#F2ECE1] transition-colors cursor-pointer shadow-2xs"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold tracking-tight text-[#292524]">Notifications</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#EAE5DC] text-[#78716C] hover:text-[#292524] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          </div>
        </div>

        {/* Notification Cards Grid matching Image 3 */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EAE5DC] p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] text-[#78716C] flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#292524]">No Notifications</h4>
            <p className="text-xs text-[#78716C] mt-1">
              You are completely up to date with your learning milestones!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`bg-[#EDE7DE] rounded-3xl p-5 border border-[#DDD6CB] shadow-2xs relative transition-all duration-200 hover:shadow-md hover:bg-[#E7E0D6] cursor-pointer flex items-start gap-4 ${
                  !item.read ? 'ring-1 ring-[#3D342F]/20' : 'opacity-90'
                }`}
              >
                {/* Icon badge */}
                {renderIcon(item.type)}

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#292524] truncate">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#57534E] mt-1 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="text-[11px] font-medium text-[#78716C] mt-3">
                    {item.timeAgo}
                  </div>
                </div>

                {/* Dark unread indicator dot (top right) exactly as in Image 3 */}
                {!item.read && (
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-[#3D342F] absolute top-5 right-5 shadow-2xs"
                    title="Unread"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
