import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, X, Bot, User, Sparkles, ChefHat } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { useLanguage } from "./contexts/LanguageContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  isBottomBarVisible?: boolean;
}

export default function AIChatbot({ isOpen, onClose, isBottomBarVisible = true }: AIChatbotProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === "model" && messages[0].text.startsWith("Halo!"))) {
      setMessages([
        { role: "model", text: t("Halo! I'm Nusa Culinary AI. What's cooking today? I can help with traditional Indonesian recipes or ingredient tips!") }
      ]);
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages.map(m => ({ 
            role: m.role === "user" ? "user" : "model", 
            parts: [{ text: m.text }] 
          })).slice(-10) // Send last 10 messages for context
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: "model", text: data.text }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMsg = error?.message || "";
      let text = t("Maaf, I'm having a little trouble connecting right now. Can you try again?");
      if (errorMsg.includes("API key") || errorMsg.includes("API_KEY")) {
        text = t("Maaf, the Gemini API key is not configured on the server. Please add `GEMINI_API_KEY` to your `.env` or `.env.local` file to enable the AI Chatbot.");
      }
      setMessages(prev => [...prev, { role: "model", text: text }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-90 md:hidden"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${isBottomBarVisible ? "bottom-24" : "bottom-6"} md:bottom-8 right-6 w-[calc(100%-3rem)] md:w-[450px] h-[500px] md:h-[600px] max-h-[calc(100vh-${isBottomBarVisible ? "8.5rem" : "4.5rem"})] bg-surface-container-lowest rounded-[2.5rem] shadow-2xl z-100 border border-outline-variant/10 flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="p-6 bg-primary text-on-primary flex justify-between items-center bg-linear-to-br from-primary to-primary-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">{t("Culinary Assistant")}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{t("Active Assistant")}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-surface/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
                >
                  {msg.role === "model" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 sticky top-0">
                      <ChefHat className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div 
                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm font-medium shadow-sm leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-primary text-on-primary rounded-tr-none" 
                        : "bg-white text-on-surface rounded-tl-none border border-outline-variant/10"
                    }`}
                  >
                    <div className="markdown-content">
                      <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 border border-outline-variant/20 overflow-hidden">
                      {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-4 h-4 text-on-surface-variant" />
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 animate-pulse">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl flex gap-1 border border-outline-variant/10">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-outline-variant/10">
              <div className="relative flex items-center gap-2">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("Ask about Satay, Rendang, or Sambal...")}
                  className="flex-1 h-12 bg-surface-container rounded-full px-6 text-base md:text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant font-medium"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ring-offset-4 focus:ring-4 focus:ring-primary/20 shadow-md shadow-primary/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center mt-3 text-outline font-black uppercase tracking-widest opacity-40">{t("AI can make mistakes. Verify important info.")}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
