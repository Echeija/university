import { useState, useEffect, useRef } from 'react';

export function useCountdownTimer(
  initialSeconds: number,
  onExpire: () => void,
  isActive: boolean = true
) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!isActive) return;
    
    // Check if immediately expired
    if (timeLeft <= 0) {
      onExpireRef.current();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          // Defer expiration call to allow state update to settle
          setTimeout(() => {
            onExpireRef.current();
          }, 0);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isActive]); // Only re-run if isActive changes

  return timeLeft;
}
