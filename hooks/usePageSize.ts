import { useState, useEffect } from "react";

export function usePageSize(mobile = 6, desktop = 12): number {
  const [size, setSize] = useState(mobile);
  useEffect(() => {
    const update = () => setSize(window.innerWidth >= 768 ? desktop : mobile);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [mobile, desktop]);
  return size;
}
