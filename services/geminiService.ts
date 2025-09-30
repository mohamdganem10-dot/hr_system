
// This is a mock service to simulate calls to the Gemini API.
// In a real application, you would use `@google/genai` here.

export const askGemini = async (prompt: string): Promise<string> => {
  console.log("Simulating Gemini API call with prompt:", prompt);
  
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

  const lowerCasePrompt = prompt.toLowerCase();

  if (lowerCasePrompt.includes("عدد الموظفين")) {
    return "لدينا حاليًا 5 موظفين في النظام. هل تود معرفة تفاصيل إضافية عنهم؟";
  }
  if (lowerCasePrompt.includes("حالة مشروع")) {
    return "مشروع 'تطوير نظام الأرشفة الإلكتروني' في مرحلة التنفيذ بنسبة إنجاز 45%. هل أبحث لك عن مشروع آخر؟";
  }
   if (lowerCasePrompt.includes("مرحباً") || lowerCasePrompt.includes("مرحبا")) {
    return "أهلاً بك! أنا مساعدك الذكي. كيف يمكنني خدمتك اليوم؟ يمكنك أن تسألني عن الموظفين، المشاريع، أو المستندات.";
  }

  return "شكرًا لسؤالك. أنا حاليًا في وضع المحاكاة. في تطبيق حقيقي، سأقوم بالاتصال بواجهة Gemini API للحصول على إجابة دقيقة بناءً على بيانات المؤسسة.";
};
