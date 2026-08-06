import { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GradeNotifier() {
  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate receiving a real-time notification via WebSocket after a delay
    const timer1 = setTimeout(() => {
      notify({
        title: 'New Grade Posted',
        message: 'Your final grade for CSC 301: Introduction to Artificial Intelligence has been posted.',
        type: 'success',
        duration: 8000,
      });
    }, 12000);

    const timer2 = setTimeout(() => {
      notify({
        title: 'New Grade Posted',
        message: 'Your mid-semester grade for ENG 204: Thermodynamics is now available.',
        type: 'info',
        duration: 8000,
      });
    }, 35000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [notify]);

  return null;
}
