import { useEffect, useState, useRef } from "react";

export default function UptimeCounter({ startTime, isRunning }: { startTime: string | null, isRunning: boolean }) {
    const [uptime, setUptime] = useState("0h 0m 0.0s");
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!startTime || !isRunning) {
            setUptime("0h 0m 0.0s");
            return;
        }

        const start = new Date(startTime).getTime();

        const update = () => {
            const now = Date.now();
            const diff = now - start;

            if (diff < 0) {
                setUptime("0h 0m 0.0s");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            const milliseconds = Math.floor((diff % 1000) / 100); // 1 digit

            let str = "";
            if (days > 0) str += `${days}d `;
            if (hours > 0 || days > 0) str += `${hours}h `;
            str += `${minutes}m ${seconds}.${milliseconds}s`;

            setUptime(str);
            frameRef.current = requestAnimationFrame(update);
        };

        frameRef.current = requestAnimationFrame(update);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [startTime, isRunning]);

    return <span>{uptime}</span>;
}
