/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter as Router } from 'react-router-dom';
import TopProgressBar from './components/TopProgressBar';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { HelmetProvider } from 'react-helmet-async';
import FeedbackButton from './components/FeedbackButton';
import EmergencyBroadcastReceiver from './components/EmergencyBroadcastReceiver';
import AnimatedRoutes from './components/AnimatedRoutes';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <EmergencyBroadcastReceiver />
          <Router>
            <TopProgressBar />
            <AnimatedRoutes />
            <FeedbackButton />
            </Router>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
