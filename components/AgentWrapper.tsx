"use client";

import dynamic from 'next/dynamic';

const Agent = dynamic(() => import('@/components/Agent'), {
  ssr: false
});

interface AgentWrapperProps {
  userName: string;
  userId?: string;
  gender?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview" | "admin-interview";
  questions?: string[];
  answers?: string[];
  bookName?: string;
}

export default function AgentWrapper(props: AgentWrapperProps) {
  return <Agent {...props} userId={props.userId || ""} />;
}

