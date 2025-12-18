"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import OpenAI from "openai"; // Standard OpenAI client for direct calls

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { getRandomInterviewCover } from "@/lib/utils";

// Standard OpenAI client for robust JSON generation
const openaiDirect = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI SDK wrapper (if needed for other parts, but we'll use direct client for generation)
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateInterview(params: {
  bookName: string;
  questionType: string;
  userid: string;
}) {
  const { bookName, questionType, userid } = params;

  try {
    // Using direct OpenAI client to force JSON object mode
    const response = await openaiDirect.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Siz kitoblar bo'yicha savollar tuzadigan yordamchisiz."
        },
        {
          role: "user",
          content: `Kitob bo'yicha suhbat uchun savollar tayyorlang.
            Kitob nomi: ${bookName}.
            Savol turi: ${questionType} (short/facts = qisqa faktlar, mid/process = jarayon haqida o'rtacha, long/opinion = shaxsiy fikr va tahlil).
            
            Iltimos, ushbu kitob haqida internetdan ma'lumot qidiring va eng mos, qiziqarli va to'g'ri savollarni tuzing.
            
            Natijani faqat JSON formatida qaytaring, unda "questions" kaliti bo'lsin va u stringlar massivi bo'lsin.
            Misol: { "questions": ["Savol 1", "Savol 2"] }
            
            Savollar ovozli yordamchi tomonidan o'qiladi, shuning uchun "/" yoki "*" kabi belgilarni ishlatmang. Savollar o'zbek tilida bo'lsin.
          `
        }
      ],
      response_format: { type: "json_object" }, // FORCE JSON
    });

    const text = response.choices[0].message.content || "{}";
    let parsedQuestions: string[] = [];

    try {
      const parsed = JSON.parse(text);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        parsedQuestions = parsed.questions;
      } else {
        throw new Error("JSON structure invalid: missing 'questions' array");
      }
    } catch (e) {
      console.error("Failed to parse interview questions JSON:", text);
      throw new Error("Failed to parse interview questions: " + e);
    }

    const interview = {
      role: bookName, // Storing book name in 'role' field for compatibility or UI display
      type: questionType,
      level: "Any", // Default
      techstack: ["Book"], // Default
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(), // Ideally fetch book cover
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error generating interview:", error);
    return { success: false, error };
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId, answers } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Different prompt for admin interviews (with answer comparison)
    let systemPrompt = "Siz kitobxon bilan bo'lgan suhbatni tahlil qiluvchi ekspertisiz. Suhbatni baholang.";
    let userPrompt = "";

    if (answers && answers.length > 0) {
      // Admin interview: compare with provided answers
      const formattedAnswers = answers.map((a, i) => `${i + 1}. ${a}`).join("\n");
      systemPrompt = "Siz suhbatni tahlil qiluvchi ekspertisiz. Foydalanuvchi javoblarini to'g'ri javoblar bilan solishtiring va baholang.";
      userPrompt = `
            Suhbat transkripti:
            ${formattedTranscript}

            To'g'ri javoblar:
            ${formattedAnswers}

            Iltimos, foydalanuvchi javoblarini to'g'ri javoblar bilan solishtirib, quyidagi mezonlar bo'yicha 0 dan 100 gacha baholang. 
            Javoblar kitoblar haqida bo'lgani uchun, kitob mazmunini tushunish va bilim darajasini baholang.
            
            Natijani faqat quyidagi JSON formatida qaytaring:
            {
              "totalScore": number,
              "categoryScores": [
                {
                  "name": "Kitob mazmunini tushunish",
                  "score": number,
                  "comment": "Bahoga izoh (O'zbek tilida)"
                },
                {
                  "name": "Muallif uslubi va g'oyasini tushunish",
                  "score": number,
                  "comment": "Bahoga izoh"
                },
                {
                  "name": "Qahramonlar tahlili",
                  "score": number,
                  "comment": "Bahoga izoh"
                },
                {
                  "name": "Tanqidiy fikrlash va shaxsiy munosabat",
                  "score": number,
                  "comment": "Bahoga izoh"
                },
                {
                  "name": "Nutq ravonligi va so'z boyligi",
                  "score": number,
                  "comment": "Bahoga izoh"
                }
              ],
              "strengths": string[], // Kuchli tomonlari (O'zbek tilida)
              "areasForImprovement": string[], // Rivojlantirish kerak bo'lgan tomonlar (O'zbek tilida)
              "finalAssessment": string // Yakuniy xulosa (O'zbek tilida)
            }
            `;
    } else {
      // Regular interview
      userPrompt = `
            Suhbat transkripti:
            ${formattedTranscript}

            Iltimos, nomzodni (kitobxonni) quyidagi mezonlar bo'yicha 0 dan 100 gacha baholang. 
            
            Natijani faqat quyidagi JSON formatida qaytaring:
            {
              "totalScore": number,
              "categoryScores": [
                {
                  "name": "Kitob mazmunini tushunish",
                  "score": number,
                  "comment": "Bahoga izoh (O'zbek tilida)"
                },
                {
                  "name": "Muallif uslubi va g'oyasini tushunish",
                  "score": number,
                  "comment": "Bahoga izoh"
                },
                {
                  "name": "Qahramonlar tahlili",
                  "score": number,
                  "comment": "Bahoga izoh"
                },
                {
                  "name": "Tanqidiy fikrlash va shaxsiy munosabat",
                  "score": number,
                  "comment": "Bahoga izoh"
                },
                {
                  "name": "Nutq ravonligi va so'z boyligi",
                  "score": number,
                  "comment": "Bahoga izoh"
                }
              ],
              "strengths": string[], // Kuchli tomonlari (O'zbek tilida)
              "areasForImprovement": string[], // Rivojlantirish kerak bo'lgan tomonlar (O'zbek tilida)
              "finalAssessment": string // Yakuniy xulosa (O'zbek tilida)
            }
            `;
    }

    // Using direct OpenAI client for feedback generation too
    const response = await openaiDirect.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      response_format: { type: "json_object" }, // FORCE JSON
    });

    const text = response.choices[0].message.content || "{}";
    let object: any;

    try {
      object = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse feedback JSON:", text);
      throw new Error("Failed to parse feedback JSON");
    }

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  let query = db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true);

  // Only add userId filter if userId is defined
  if (userId) {
    query = query.where("userId", "!=", userId);
  }

  const interviews = await query.limit(limit).get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string | undefined
): Promise<Interview[] | null> {
  // Return empty array if userId is undefined
  if (!userId) {
    return [];
  }

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getUserFeedbacks(userId: string): Promise<Feedback[]> {
  try {
    const feedbacks = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .get();

    return feedbacks.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Feedback[];
  } catch (error) {
    console.error("Error fetching user feedbacks:", error);
    return [];
  }
}

export async function getFeedbacksForInterview(interviewId: string): Promise<any[]> {
  try {
    const feedbacks = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    const results = await Promise.all(
      feedbacks.docs.map(async (doc) => {
        const data = doc.data();
        let studentName = "Noma'lum";
        
        if (data.userId) {
             const userDoc = await db.collection("users").doc(data.userId).get();
             if (userDoc.exists) {
                 const userData = userDoc.data();
                 studentName = userData?.name || studentName;
             }
        }
        return {
          id: doc.id,
          ...data,
          studentName
        };
      })
    );
    return results;
  } catch (error) {
    console.error("Error fetching feedbacks for interview:", error);
    return [];
  }
}
