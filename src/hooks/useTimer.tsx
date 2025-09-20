import { useEffect, useState } from "react";

function useTimer(initialSeconds: number = 0) {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => setSeconds(0);

  return { seconds, isRunning, start, stop, reset };
}

export default useTimer;
