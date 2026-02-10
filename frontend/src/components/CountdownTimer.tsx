import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const getNextValentine = () => {
      const now = new Date();
      let year = now.getFullYear();
      let valentine = new Date(year, 1, 14); // Feb 14
      if (now > valentine) valentine = new Date(year + 1, 1, 14);
      return valentine;
    };

    const update = () => {
      const now = new Date();
      const diff = getNextValentine().getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-6 justify-center">
      {units.map((unit) => (
        <motion.div
          key={unit.label}
          className="glass-card rounded-xl px-4 py-3 sm:px-6 sm:py-4 text-center min-w-[70px] sm:min-w-[90px]"
          whileHover={{ scale: 1.05 }}
        >
          <div className="font-heading text-2xl sm:text-4xl font-bold text-primary">
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1">{unit.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default CountdownTimer;
