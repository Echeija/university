import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

let globalSetProgress: ((v: number | ((prev: number) => number)) => void) | null = null;
let globalSetVisible: ((v: boolean) => void) | null = null;
let activeRequests = 0;
let progressInterval: any = null;

export const startProgress = () => {
  activeRequests++;
  if (activeRequests === 1 && globalSetVisible && globalSetProgress) {
    globalSetVisible(true);
    globalSetProgress(10);
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (globalSetProgress) {
        globalSetProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + 5;
        });
      }
    }, 200);
  }
};

export const stopProgress = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0 && globalSetProgress && globalSetVisible) {
    clearInterval(progressInterval);
    globalSetProgress(100);
    setTimeout(() => {
      if (globalSetVisible) globalSetVisible(false);
      setTimeout(() => {
        if (globalSetProgress) globalSetProgress(0);
      }, 300);
    }, 400);
  }
};

export default function TopProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    globalSetProgress = setProgress;
    globalSetVisible = setVisible;
    return () => {
      globalSetProgress = null;
      globalSetVisible = null;
    };
  }, []);

  useEffect(() => {
    startProgress();
    const t = setTimeout(() => {
      stopProgress();
    }, 500); // Navigation fake delay
    return () => clearTimeout(t);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
      <div 
        className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_10px_#10b981]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
