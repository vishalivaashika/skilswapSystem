import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  duration: number; // seconds
  isRunning: boolean;
  onTimeUp: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = React.memo(({ duration, isRunning, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Use setTimeout to avoid calling setState during render
          setTimeout(() => onTimeUpRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const display = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  const isWarning = timeLeft < 300;

  return (
    <div className={`card-elevated p-4 mb-6 flex items-center justify-center gap-3 ${isWarning ? 'border-destructive/50 bg-destructive/5' : ''}`}>
      <Timer className={`h-5 w-5 ${isWarning ? 'text-destructive' : 'text-primary'}`} />
      <span className={`text-3xl font-mono font-bold tracking-wider ${isWarning ? 'text-destructive' : 'text-foreground'}`}>
        {display}
      </span>
      <span className="text-sm text-muted-foreground ml-1">remaining</span>
    </div>
  );
});

CountdownTimer.displayName = 'CountdownTimer';

export default CountdownTimer;
