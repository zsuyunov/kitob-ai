"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { createFeedback } from "@/lib/actions/general.action";
import { useChat } from "ai/react";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { Loader2 } from "lucide-react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface AgentProps {
  userName: string;
  userId: string;
  gender?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview" | "admin-interview";
  questions?: string[];
  answers?: string[];
  bookName?: string;
}

const Agent = ({
  userName,
  userId,
  gender,
  interviewId,
  feedbackId,
  type,
  questions,
  answers,
  bookName,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false); // AI speaking
  const [isUserSpeaking, setIsUserSpeaking] = useState(false); // User speaking detection
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenMessageRef = useRef<string>("");

  // Use useChat to manage conversation state and API calls
  const { messages, append, isLoading, error } = useChat({
    api: "/api/gemini/chat",
    body: { userId, userName, type, questions, answers, bookName },
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("❌ useChat error:", error);
      alert(`Chat xatosi: ${error.message || "Noma'lum xatolik"}`);
    }
  }, [error]);

  // Update lastMessage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.content) {
        setLastMessage(lastMsg.content);
      }
    }
  }, [messages]);

  // Play AI response using Muxlisa TTS via our API route
  const playTTS = useCallback(async (text: string) => {
    console.log("🔊 playTTS called with text:", text.substring(0, 100));
    
    if (!text || text.trim() === "") {
      return;
    }

    try {
      setIsSpeaking(true);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text,
          speaker: type === "generate" ? 0 : 1 // 0 = Female (Data Collection), 1 = Male (Interview/Admin Interview)
        }),
      });

      if (!res.ok) {
        console.error("❌ TTS request failed:", res.status);
        setIsSpeaking(false);
        // Resume recording if TTS fails so user can speak
        if (callStatus === CallStatus.ACTIVE) startRecording();
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        // Resume recording after AI finishes speaking
        if (callStatus === CallStatus.ACTIVE) {
            startRecording();
        }
      };

      audio.onerror = (e) => {
        console.error("❌ Audio playback error:", e);
        setIsSpeaking(false);
        if (callStatus === CallStatus.ACTIVE) startRecording();
      };

      await audio.play();
    } catch (error) {
      console.error("❌ Exception during TTS playback:", error);
      setIsSpeaking(false);
      if (callStatus === CallStatus.ACTIVE) startRecording();
    }
  }, [callStatus]); // Added callStatus dependency to check if we should resume recording

  // Trigger TTS when new assistant message arrives and loading completes
  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      
      if (last.role === 'assistant' && last.content) {
        setLastMessage(last.content);
        
        if (!isLoading && last.content !== lastSpokenMessageRef.current) {
          lastSpokenMessageRef.current = last.content;
          
          // Stop recording while AI speaks
          if (recorderRef.current) {
            recorderRef.current.stopRecording(() => {});
          }
          
          playTTS(last.content);
        }
      }
    }
  }, [messages, isLoading, playTTS]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      handleDisconnect();
    };
  }, []);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    console.log("📞 Starting call...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      setCallStatus(CallStatus.ACTIVE);
      
      // Setup Audio Context for silence detection
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Initial Greeting
      if (messages.length === 0) {
        append({ role: "user", content: "Salom" }); // Trigger initial greeting from AI
      } else {
        startRecording();
      }

    } catch (error) {
      console.error("❌ Error starting call:", error);
      setCallStatus(CallStatus.INACTIVE);
      alert("Mikrofonga ruxsat berilmadi.");
    }
  };

  const startRecording = () => {
    if (!streamRef.current || callStatus === CallStatus.FINISHED) return;
    
    console.log("🔴 Recording started / Listening...");
    
    // Create new recorder instance
    const recorder = new RecordRTC(streamRef.current, {
      type: "audio",
      mimeType: "audio/wav",
      recorderType: StereoAudioRecorder,
      numberOfAudioChannels: 1,
      desiredSampRate: 16000,
    });

    recorder.startRecording();
    recorderRef.current = recorder;

    detectSilence();
  };

  const detectSilence = () => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let silenceStart = performance.now();
    let isNoiseDetected = false;

    const loop = () => {
        if (callStatus === CallStatus.FINISHED || !recorderRef.current) return;
        if (isSpeaking) return; // Don't detect if AI is speaking

        analyserRef.current!.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for(let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Threshold for silence (adjustable)
        if (average > 10) { // User is speaking
            silenceStart = performance.now();
            isNoiseDetected = true;
            setIsUserSpeaking(true);
        } else {
            setIsUserSpeaking(false);
            // If silence for 2.5 seconds AND we heard something before
            if (isNoiseDetected && (performance.now() - silenceStart > 2500)) {
                console.log("🤐 Silence detected, stopping recording...");
                stopRecordingAndSend();
                return; // Stop loop
            }
        }

        requestAnimationFrame(loop);
    };
    loop();
  };

  const stopRecordingAndSend = () => {
    if (!recorderRef.current) return;

    recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current!.getBlob();
        console.log("📦 Audio blob size:", blob.size);
        
        if (blob.size > 1000) { // Avoid sending empty noise
            sendAudioToSTT(blob);
        } else {
             // Too short/quiet, restart recording
             startRecording();
        }
    });
  };

  const sendAudioToSTT = async (audioBlob: Blob) => {
    try {
        const formData = new FormData();
        // Send as 'audio' file
        formData.append("audio", audioBlob, "recording.wav");

        console.log("📤 Sending to Muxlisa STT...");
        const res = await fetch("/api/muxlisa/stt", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("STT Failed");

        const data = await res.json();
        console.log("✅ STT Result:", data);

        // Assuming data.result or data.text
        const text = data.result || data.text; 
        
        if (text && text.trim().length > 0) {
            console.log("📝 Transcript:", text);
            append({ role: "user", content: text });
        } else {
            console.log("⚠️ No text transcribed, restarting listening...");
            startRecording();
        }

    } catch (error) {
        console.error("❌ STT Error:", error);
        startRecording(); // Try again
    }
  };

  const handleDisconnect = () => {
    console.log("🔚 Disconnecting...");
    
    if (callStatus === CallStatus.ACTIVE || callStatus === CallStatus.CONNECTING) {
       if (type !== "generate" && messages.length > 0) {
         handleGenerateFeedback();
       } else if (type === "generate") {
          router.push("/");
       }
    }

    setCallStatus(CallStatus.FINISHED);
    setIsSpeaking(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {});
      recorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
  };

  const handleGenerateFeedback = async () => {
      setIsGeneratingFeedback(true);
      const conversation = messages.filter((m: any) => m.role !== 'system').map((m: any) => ({ role: m.role, content: m.content }));
      
      try {
        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: conversation as any,
          feedbackId,
          answers: type === "admin-interview" ? answers : undefined,
        });

        if (success && id) {
          if (type === "admin-interview") {
            // If we are on the student side (URL contains /interview/teacher/), go to the student feedback page
            if (window.location.pathname.includes("/interview/teacher/")) {
              router.push(`/interview/teacher/${interviewId}/feedback`);
            } else {
              // Otherwise, assume it's the teacher/admin view
              router.push(`/Teacher/interviews/${interviewId}/feedback`);
            }
          } else {
            router.push(`/interview/${interviewId}/feedback`);
          }
        } else {
          setIsGeneratingFeedback(false);
          if (type === "admin-interview") {
             if (window.location.pathname.includes("/interview/teacher/")) {
               router.push("/Student");
             } else {
               router.push("/Teacher/interviews");
             }
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
        setIsGeneratingFeedback(false);
      }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAvatar = () => {
    if (!gender) return "/user-avatar-boy.png";
    const g = gender.toLowerCase();
    if (g === "male" || g.includes("boy") || g.includes("o'g'il")) return "/user-avatar-boy.png";
    if (g === "female" || g.includes("girl") || g.includes("qiz")) return "/user-avatar-girl.png";
    return "/user-avatar-boy.png";
  };

  return (
    <>
      {isGeneratingFeedback && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-dark-200 border border-input shadow-2xl animate-in fade-in zoom-in duration-300">
            <Loader2 className="h-12 w-12 text-primary-200 animate-spin" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Natijalar tahlil qilinmoqda...</h3>
              <p className="text-light-200">Biroz kuting, sun'iy intellekt suhbatingizni baholamoqda</p>
            </div>
          </div>
        </div>
      )}

      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>Kitob yordamchisi</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src={getAvatar()}
              alt="Foydalanuvchi"
              width={539}
              height={539}
              className="rounded-full object-cover object-top size-[180px]"
            />
            <h3>{userName}</h3>
            {isUserSpeaking && callStatus === CallStatus.ACTIVE && (
              <span className="text-xs text-green-500 animate-pulse mt-2">
                Siz gapiryapsiz...
              </span>
            )}
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button
            className="relative btn-call"
            onClick={() => handleCall()}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Boshlash"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            Tugatish
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
