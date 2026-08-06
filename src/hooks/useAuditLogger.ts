import { useAuth } from '../contexts/AuthContext';

export function useAuditLogger() {
  const { token } = useAuth();

  const logAction = async (action: string, details?: string) => {
    if (!token) return;
    try {
      await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, details })
      });
    } catch (error) {
      console.error('Failed to log action', error);
    }
  };

  return { logAction };
}
