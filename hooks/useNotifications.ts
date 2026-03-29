import { useState, useCallback, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'NEW_LISTENER' | 'TRACK_ADDED' | 'TRACK_APPROVED' | 'TRACK_REJECTED' | 'SESSION_ENDED' | 'SYSTEM';
  message: string;
  duration?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
}
