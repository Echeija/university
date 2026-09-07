import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { subscribeStudentGradeNotifications } from '../services/gradeNotificationService';

export default function GradeNotifier() {
  const { user } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    if (!user || !user.id) return;

    // Real-time Firestore onSnapshot listener for grade updates
    const unsubscribe = subscribeStudentGradeNotifications(
      user.id,
      (_notifications, newlyAdded) => {
        if (newlyAdded) {
          const isUpdate = newlyAdded.actionType === 'UPDATE_GRADE';
          notify({
            title: isUpdate ? 'Grade Updated!' : 'New Grade Posted!',
            message: newlyAdded.message || `Grade for ${newlyAdded.courseCode}: ${newlyAdded.grade} (${newlyAdded.score}%)`,
            type: 'success',
            duration: 9000,
          });

          // Dispatch window event so gradebook & academic result pages update live
          window.dispatchEvent(new CustomEvent('grade-updated', { detail: newlyAdded }));
        }
      },
      (error) => {
        console.warn("Realtime grade listener offline or error:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  return null;
}
