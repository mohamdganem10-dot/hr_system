
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, CornerDownLeft, Sparkles } from 'lucide-react';
import { askGemini } from '../services/geminiService';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (isOpen) {
        setMessages([{ sender: 'ai', text: 'أهلاً بك! أنا مساعدك الذكي. كيف يمكنني خدمتك اليوم؟' }]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await askGemini(input);
      const aiMessage: Message = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'ai', text: 'عذراً، حدث خطأ أثناء معالجة طلبك.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 z-50"
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X size={32} /> : <Sparkles size={32} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-[32rem] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden border border-gray-200 dark:border-gray-700">
          <header className="bg-blue-600 text-white p-4 flex items-center">
            <Bot size={24} className="ml-3" />
            <h3 className="font-bold text-lg">المساعد الذكي</h3>
          </header>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white"><Bot size={20}/></div>}
                <div className={`px-4 py-2 rounded-2xl max-w-xs ${msg.sender === 'user' ? 'bg-gray-200 dark:bg-gray-700 rounded-br-none' : 'bg-blue-100 dark:bg-blue-900/50 rounded-bl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3 flex-row">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white"><Bot size={20}/></div>
                    <div className="px-4 py-3 rounded-2xl bg-blue-100 dark:bg-blue-900/50 rounded-bl-none">
                        <div className="flex items-center space-x-1 space-x-reverse">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></span>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل أي شيء..."
                className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-full py-3 pr-4 pl-12 focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">
                <Send size={20} />
              </button>
            </div>
            <div className="text-center mt-2">
                <p className="text-xs text-gray-400">
                    مدعوم بواسطة Gemini
                </p>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
