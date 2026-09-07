import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification, NotificationType } from '../contexts/NotificationContext';

export default function RealtimeNotifications() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const seenIds = useRef<Set<number>>(new Set());
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!token || !user) return;

    let intervalId: NodeJS.Timeout;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        
        if (Array.isArray(data)) {
          if (!initialFetchDone.current) {
            // On first fetch, just populate the seen set with existing unread notifications so we don't spam toasts
            data.forEach((n: any) => {
              seenIds.current.add(n.id);
            });
            initialFetchDone.current = true;
          } else {
            // On subsequent fetches, notify for any new unread notifications
            // Sort by id ascending so they appear in chronological order
            const newNotifications = data
              .filter((n: any) => !seenIds.current.has(n.id))
              .sort((a: any, b: any) => a.id - b.id);

            newNotifications.forEach((n: any) => {
              seenIds.current.add(n.id);
              // Check if it's unread before notifying, though normally new ones are unread
              if (n.isRead === 'false') {
                notify({
                  title: n.title,
                  message: n.message,
                  type: (n.type as NotificationType) || 'info',
                  duration: 6000
                });
              }
            });
          }
        }
      } catch (error) {
        // Silently ignore polling errors as they are expected during server restarts
      }
    };

    fetchNotifications(); // Initial fetch
    intervalId = setInterval(fetchNotifications, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [token, user?.id]);

  return null; // This is a logic-only component
}
