import { useEffect, useRef, useState } from "react";

export const useCountdown = (seconds: number) => {
  const [remaining, setRemaining] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setRemaining(seconds);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    []
  );

  return { remaining, start, isActive: remaining > 0 };
};
