import { useEffect, useState } from "react";
import { formatSeconds } from "../lib/format";

export function useCountdown(targetUnixSeconds?: number) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const seconds = targetUnixSeconds ? Math.max(0, targetUnixSeconds - now) : 0;
  return { seconds, label: formatSeconds(seconds), ready: seconds === 0 };
}
