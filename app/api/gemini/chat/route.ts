import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { generateInterview } from "@/lib/actions/general.action";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, userId, userName, type, questions, answers, bookName } = await req.json();
    
    console.log("🎯 OpenAI API called - type:", type, "userName:", userName);
    console.log("📨 Messages count:", messages?.length);

    // Check if tool has already been called in the history to prevent duplicates
    const hasToolCall = messages.some((m: any) => 
        m.role === 'assistant' && 
        m.tool_calls && 
        m.tool_calls.some((tc: any) => tc.function.name === 'generate_book_interview')
    );

    // Force disable tools if we've already generated an interview
    const shouldEnableTools = type === "generate" && !hasToolCall;

    let systemPrompt = "";

    if (type === "generate") {
      systemPrompt = `Siz kitobxonlar uchun yordamchisiz.
      
      Maqsad: Foydalanuvchidan kitob haqida ma'lumot yig'ish va intervyu generatsiya qilish.
      Foydalanuvchi ismi: ${userName}
      
      Kerakli ma'lumotlar:
      1. O'qigan kitobining nomi (Book Name)
      2. Savol turi (Question Type): 
         - Qisqa (short) - faktlarga asoslangan
         - O'rtacha (mid) - jarayon haqida
         - Uzun (long) - shaxsiy fikr va tahlil

      Yo'riqnoma:
      - Avval salomlashing va qaysi kitobni o'qiganini so'rang.
      - Keyin qanday turdagi savollarni xohlashini so'rang (qisqa, o'rtacha yoki uzun).
      - Har safar BITTA savol bering.
      - Javoblarni qisqa va aniq qiling.
      - Barcha ma'lumotlarni yig'ib bo'lgach, DARHOL 'generate_book_interview' funksiyasini chaqiring.
      - Funksiyani chaqirgandan so'ng, foydalanuvchiga rahmat aytib xayrlashing.
      `;
    } else if (type === "admin-interview") {
      // Admin-created interview: ask questions and compare with provided answers
      const formattedQuestions = questions ? questions.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n") : "";
      const questionsCount = questions ? questions.length : 0;
      
      systemPrompt = `Siz professional suhbatdoshsiz va baholovchisiz.
      
      Ism: ${userName}
      Kitob: ${bookName || "Tanlangan kitob"}
      Jami savollar soni: ${questionsCount}
      
      Vazifa: Quyidagi savollarni ketma-ket so'rang.
      
      Savollar ro'yxati:
      ${formattedQuestions}

      Qat'iy Yo'riqnoma:
      1. SUHBAT BOSHLANISHI:
         - "Assalamu alaykum, ${userName}. Men sizdan ${bookName || "kitob"} kitobi bo'yicha ${questionsCount} ta savol so'rayman. Tayyormisiz?" deb boshlang.
      
      2. TAYYORGARLIKNI TEKSHIRISH:
         - Agar javob "Ha" yoki "Tayyorman" bo'lsa -> Avval "Yaxshi, unda savollarni boshlaymiz" deb aytib, keyin 1-savolni bering.
         - Agar javob "Yo'q" bo'lsa -> "Agar hozir savol-javobni boshlamasangiz va savollarimga javob bermasangiz, siz 0% natija olasiz. Agar suhbatni boshlasangiz, baho olish uchun uni oxirigacha yetkazish majburiy." deb ogohlantiring.  "Agar xop boshlaymiz desa, Avval Yaxshi, unda savollarni boshlaymiz" deb aytib, keyin 1-savolni bering. .
         - Agar ogohlantirishdan keyin ham rad etsa -> Xayrlashing va suhbatni tugating.

      3. SAVOL BERISH TARTIBI:
         - Savollarni faqat BIRMA-BIR bering.
         - Har bir savoldan keyin javobni kuting.
         - Javobni olgach, HECH QANDAY BAHO BERMANG va izohlamang (masalan "To'g'ri" yoki "Yaxshi" demang). Shunchaki "Tushunarli" deb keyingi savolga o'ting yoki to'g'ridan-to'g'ri keyingi savolni bering.
         - Agar foydalanuvchi "Savolni qaytaring" desa -> Savolni qayta o'qing.
         - Agar savol uzun bo'lsa, oxirida "Savol tushunarlimi?" deb qo'shishingiz mumkin.
         
      4. SUHBATNI YAKUNLASH:
         - Agar foydalanuvchi "Davom etmayman" desa -> Xayrlashing.
         - Barcha savollar tugagach -> "Suhbat yakunlandi. Ishtirokingiz uchun rahmat. Endi natijangiz va fikr-mulohazalar bilan tanishishingiz mumkin. Xayr." deb aytib suhbatni tugating.

      Faqat suhbat olib boruvchi bo'ling. Baholashni suhbat tugaganidan keyin tizim amalga oshiradi.
      `;
    } else {
      const formattedQuestions = questions ? questions.join("\n") : "";
      systemPrompt = `Siz professional suhbatdoshsiz.
      
      Nomzod: ${userName}
      Vazifa: Quyidagi savollar asosida ovozli suhbat o'tkazing:
      ${formattedQuestions}

      Yo'riqnoma:
      - Ro'yxatdan BITTA savolni bering.
      - Javobni tinglang, qisqacha munosabat bildiring (masalan, "Tushunarli", "Yaxshi fikr") va keyingi savolga o'ting.
      - Javoblaringiz QISQA bo'lsin (maksimum 1-2 gap).
      - Suhbat oxirida rahmat aytib xayrlashing.
      `;
    }

    // Define tools for OpenAI SDK
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "generate_book_interview",
          description: "Ma'lumotlar yig'ilgach, kitob bo'yicha intervyu generatsiya qiladi.",
          parameters: {
            type: "object",
            properties: {
              bookName: { type: "string", description: "Kitob nomi" },
              questionType: { 
                type: "string", 
                enum: ["short", "mid", "long"],
                description: "Savol turi (short/mid/long)" 
              },
            },
            required: ["bookName", "questionType"],
          },
        },
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      stream: true,
      tools: shouldEnableTools ? tools : undefined,
    });

    console.log("✅ OpenAI chat completion created successfully");
    console.log("🔄 Returning OpenAIStream wrapped in StreamingTextResponse");

    const stream = OpenAIStream(response as any, {
      experimental_onToolCall: async (toolCallPayload: any, appendToolCallMessage: any) => {
        console.log("🛠️ Tool Call Payload:", JSON.stringify(toolCallPayload));

        if (toolCallPayload.tools) {
            for (const toolCall of toolCallPayload.tools) {
                const fn = toolCall.func || toolCall.function;
                if (!fn) continue;

                if (fn.name === 'generate_book_interview') {
                    let params;
                    try {
                        if (typeof fn.arguments === 'object' && fn.arguments !== null) {
                            params = fn.arguments;
                        } else {
                            params = JSON.parse(fn.arguments);
                        }
                        console.log("🛠️ Tool Call: generate_book_interview", params);
                    } catch (e) {
                        console.error("❌ JSON Parse Error in tool arguments:", e);
                         return "Error: Invalid tool arguments generated by AI.";
                    }
                    
                    const { bookName, questionType } = params;
                    const result = await generateInterview({ 
                        bookName, 
                        questionType, 
                        userid: userId 
                    });
                    
                    let output = "Xatolik yuz berdi.";
                    if (result.success) {
                        output = "Intervyu muvaffaqiyatli generatsiya qilindi. Bosh sahifada ko'rishingiz mumkin.";
                    }
                    
                    const newMessages = appendToolCallMessage({
                        tool_call_id: toolCall.id,
                        function_name: fn.name,
                        tool_call_result: output,
                    });
                    
                    const newResponse = await openai.chat.completions.create({
                        model: "gpt-4o",
                        stream: true,
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...messages,
                            ...newMessages,
                        ],
                        tools: undefined 
                    });

                    return newResponse as any;
                }
            }
        }
      },
    });

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("❌ OpenAI API Error:", error);
    console.error("Error details:", error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to process chat request",
        details: error.toString()
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
