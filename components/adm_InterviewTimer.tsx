"use client";

import { useState, useEffect } from "react";

interface InterviewTimerProps {
  availableFrom: string;
  availableUntil: string;
}

export default function InterviewTimer({ availableFrom, availableUntil }: InterviewTimerProps) {
  const [now, setNow] = useState(new Date());
  const [status, setStatus] = useState<"upcoming" | "active" | "expired">("upcoming");
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      const current = new Date();
      setNow(current);

      const from = new Date(availableFrom);
      const until = new Date(availableUntil);

      if (current < from) {
        setStatus("upcoming");
        const diff = from.getTime() - current.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days} kun ${hours} soat ${minutes} daqiqa`);
      } else if (current >= from && current <= until) {
        setStatus("active");
        const diff = until.getTime() - current.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days} kun ${hours} soat ${minutes} daqiqa`);
      } else {
        setStatus("expired");
        setTimeLeft("");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [availableFrom, availableUntil]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "upcoming") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl font-bold text-primary-200">Interview ochiladi</div>
        <div className="text-xl text-light-200">{timeLeft}</div>
        <div className="text-sm text-light-300">
          {formatDate(availableFrom)} da boshlanadi
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl font-bold text-red-400">Interview yopildi</div>
        <div className="text-sm text-light-300">
          {formatDate(availableUntil)} da yopildi
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-2xl font-bold text-green-400">Interview faol</div>
      <div className="text-xl text-light-200">Qolgan vaqt: {timeLeft}</div>
      <div className="text-sm text-light-300">
        {formatDate(availableUntil)} da yopiladi
      </div>
    </div>
  );
}

