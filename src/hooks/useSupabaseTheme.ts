import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function useSupabaseTheme() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!user?.id) return;
    
    if (user.themePreference && (user.themePreference === 'light' || user.themePreference === 'dark')) {
       setTheme(user.themePreference);
    }
  }, [user?.id, user?.themePreference, setTheme]);

  const updateThemeInSupabase = async (newTheme: 'light' | 'dark') => {
    if (!user?.id) return;
    try {
      const res = await fetch('/api/users/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ theme: newTheme })
      });
      if (!res.ok) {
        console.error('Error updating theme API');
      }
    } catch (err) {
      console.error('Failed to update theme', err);
    }
  };

  return { updateThemeInSupabase };
}
