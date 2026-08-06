import { useEffect, useState } from 'react';

interface DeadlineItem {
  id: string | number;
  title: string;
  course?: string;
  dueDate: string | Date;
  type: 'Exam' | 'Assignment';
}

export function useDeadlineNotifications(items: DeadlineItem[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  useEffect(() => {
    if (permission !== 'granted') return;

    const checkDeadlines = () => {
      const now = new Date().getTime();
      const notified = JSON.parse(localStorage.getItem('notified_deadlines') || '{}');

      items.forEach(item => {
        const targetTime = new Date(item.dueDate).getTime();
        const timeDiff = targetTime - now;
        const hoursLeft = timeDiff / (1000 * 60 * 60);

        // If deadline is within 24 hours, in the future, and not yet notified
        if (hoursLeft > 0 && hoursLeft <= 24 && !notified[item.id]) {
          new Notification(`Upcoming ${item.type} Deadline!`, {
            body: `${item.title} ${item.course ? `for ${item.course} ` : ''}is due in less than 24 hours.`,
            icon: '/favicon.ico' // Or any suitable icon
          });
          
          notified[item.id] = true;
        }
      });

      localStorage.setItem('notified_deadlines', JSON.stringify(notified));
    };

    // Check immediately, then every minute
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60 * 1000);

    return () => clearInterval(interval);
  }, [items, permission]);

  return { permission };
}
