import React, { useEffect } from 'react';
import { X, Bell, Music, CheckCircle, XCircle, Users, Info } from 'lucide-react';
import { Notification } from '../hooks/useNotifications';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<ToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, notification.duration || 3000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'TRACK_ADDED': return <Music size={18} className="text-brand-red" />;
      case 'TRACK_APPROVED': return <CheckCircle size={18} className="text-green-500" />;
      case 'TRACK_REJECTED': return <XCircle size={18} className="text-red-500" />;
      case 'NEW_LISTENER': return <Users size={18} className="text-blue-400" />;
      default: return <Info size={18} className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-zinc-800 border-l-4 border-brand-red rounded-r-lg shadow-lg p-4 flex items-start gap-3 w-80 mb-3 animate-fade-in pointer-events-auto">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{notification.message}</p>
      </div>
      <button onClick={() => onClose(notification.id)} className="text-gray-500 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

interface ContainerProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export const NotificationContainer: React.FC<ContainerProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none flex flex-col items-end max-h-screen overflow-hidden">
      {notifications.slice(0, 3).map((notif) => (
        <NotificationToast key={notif.id} notification={notif} onClose={removeNotification} />
      ))}
    </div>
  );
};
