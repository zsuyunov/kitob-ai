"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, BookOpen, User } from "lucide-react";
import { Button } from "./ui/button";
import type { Interview } from "@/Admin/interview.action";

interface TeacherInterviewCardProps {
  interview: Interview;
  userId?: string;
  isCompleted?: boolean;
}

export default function TeacherInterviewCard({ interview, userId, isCompleted }: TeacherInterviewCardProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "yanvar", "fevral", "mart", "aprel", "may", "iyun",
      "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}-${month}, ${year} ${hours}:${minutes}`;
  };

  const isAvailable = () => {
    const now = new Date();
    const from = new Date(interview.availableFrom);
    const until = new Date(interview.availableUntil);
    return now >= from && now <= until;
  };

  const getTimeStatus = () => {
    const now = new Date();
    const from = new Date(interview.availableFrom);
    const until = new Date(interview.availableUntil);
    
    if (now < from) {
      return { text: "Tez orada boshlanadi", color: "text-yellow-400" };
    } else if (now > until) {
      return { text: "Yakunlangan", color: "text-red-400" };
    } else {
      return { text: "Mavjud", color: "text-success-100" };
    }
  };

  const timeStatus = getTimeStatus();

  return (
    <div className="card-interview">
      {/* Book Cover Image */}
      {interview.bookCoverImage && (
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
          <Image
            src={interview.bookCoverImage}
            alt={interview.bookName || "Kitob muqovasi"}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Interview Info */}
      <div className="flex-1 space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className={`badge-text px-3 py-1 rounded-full bg-dark-200 ${timeStatus.color}`}>
            {timeStatus.text}
          </span>
          <span className="text-xs text-light-200">
            {interview.questions.length} savol
          </span>
        </div>

        {/* Book Name */}
        {interview.bookName && (
          <div className="flex items-start gap-2">
            <BookOpen className="size-5 text-primary-200 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-light-200">Kitob nomi</p>
              <h3 className="text-xl font-bold text-white">{interview.bookName}</h3>
            </div>
          </div>
        )}

        {/* Class and Teacher Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-light-200 text-sm">
            <User className="size-4 text-primary-200" />
            <span>Sinf: {interview.className}</span>
          </div>
          <div className="flex items-center gap-2 text-light-200 text-sm">
            <User className="size-4 text-primary-200" />
            <span>O'qituvchi: {interview.teacherName}</span>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2 pt-2 border-t border-dark-200">
          <div className="flex items-center gap-2 text-light-200 text-sm">
            <Calendar className="size-4 text-primary-200" />
            <span suppressHydrationWarning>Boshlanish: {formatDateTime(interview.availableFrom)}</span>
          </div>
          <div className="flex items-center gap-2 text-light-200 text-sm">
            <Clock className="size-4 text-primary-200" />
            <span suppressHydrationWarning>Tugash: {formatDateTime(interview.availableUntil)}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {isCompleted ? (
            <Link href={`/interview/teacher/${interview.id}`} className="block">
              <Button className="btn-primary w-full bg-success-100 hover:bg-success-100/90 text-white">
                Natijani ko'rish
              </Button>
            </Link>
          ) : isAvailable() ? (
            <Link href={`/interview/teacher/${interview.id}`} className="block">
              <Button className="btn-primary w-full">
                Interview boshlash
              </Button>
            </Link>
          ) : (
            <Button disabled className="w-full opacity-50 cursor-not-allowed">
              {timeStatus.text === "Tez orada boshlanadi" ? "Hali vaqti kelmagan" : "Muddati o'tgan"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
