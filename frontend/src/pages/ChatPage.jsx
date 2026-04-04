import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";

// University Card Component
function UniversityCard({ uni, onAddToTracker }) {
  const deadlineDate = new Date(uni.deadline);
  const daysLeft = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 14;

  return (
    <div className="rounded-xl bg-slate-800 p-4 border border-slate-700 hover:border-blue-500 transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{uni.name}</h3>
          <p className="text-sm text-slate-400">
            {uni.city}, {uni.country}
          </p>
        </div>
        {uni.risk && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            uni.risk === "Safe" ? "bg-green-500/20 text-green-400" :
            uni.risk === "Match" ? "bg-amber-500/20 text-amber-400" :
            uni.risk === "Reach" ? "bg-red-500/20 text-red-400" :
            "bg-slate-600 text-slate-300"
          }`}>
            {uni.risk}
          </span>
        )}
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
          {uni.program}
        </span>
        <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
          {uni.language}
        </span>
        <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
          Min GPA: {uni.min_gpa}
        </span>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className={`text-sm ${isUrgent ? "text-red-400 font-medium" : "text-slate-400"}`}>
          {isUrgent ? `⚠️ ${daysLeft} days left` : `Deadline: ${deadlineDate.toLocaleDateString()}`}
        </span>
        <button
          onClick={() => onAddToTracker(uni.name)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition"
        >
          + Track
        </button>
      </div>

      {uni.reasons && uni.reasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-1">Why this matches:</p>
          <ul className="text-xs text-slate-400 space-y-1">
            {uni.reasons.map((reason, i) => (
              <li key={i}>✓ {reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Quick Action Buttons
function QuickActions({ onAction }) {
  const actions = [
    { label: "🎯 Get Recommendations", message: "Give me university recommendations based on my profile" },
    { label: "📅 Upcoming Deadlines", message: "Show me upcoming deadlines" },
    { label: "📋 My Tracker", message: "Show my application tracker" },
    { label: "🆚 Compare Schools", message: "Help me compare universities" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => onAction(action.message)}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

// Main Chat Page
export default function ChatPage() {
  const { t, lang } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: t("chat.welcome") || "Hi! I'm your UniPath advisor. I can help you find universities, check deadlines, track applications, and give you personalized recommendations. What would you like to know?",
        },
      ]);
    }
  }, [lang]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || loading) return;

    const userMessage = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setShowQuickActions(false);

    try {
      const res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to get response");
      }

      // Update recommendations if returned
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      } else if (data.meta?.type === "tracker" && data.data) {
        setRecommendations(data.data);
      } else {
        // Clear recommendations for non-search actions
        if (data.action === "chat" || data.action === "give_advice") {
          setRecommendations([]);
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, action: data.action },
      ]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddToTracker = (universityName) => {
    sendMessage(`Add ${universityName} to my tracker`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("chat.title") || "UniPath Advisor"}</h1>
          <p className="text-slate-400 mt-1">
            {t("chat.subtitle") || "Your AI-powered university application assistant"}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Chat Column */}
          <div className="flex-1">
            {/* Messages */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 h-[500px] overflow-y-auto mb-4">
              <div className="p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "ms-auto bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-100"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>
                    {msg.action && msg.role === "assistant" && (
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <span className="text-xs text-slate-500">
                          Action: {msg.action}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-slate-800">
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Actions */}
            {showQuickActions && (
              <QuickActions onAction={sendMessage} />
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("chat.placeholder") || "Ask about universities, deadlines, or get recommendations..."}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {t("chat.send") || "Send"}
              </button>
            </div>
          </div>

          {/* Results Column */}
          {recommendations.length > 0 && (
            <div className="w-96 shrink-0">
              <div className="sticky top-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                  <span>Results ({recommendations.length})</span>
                  <button
                    onClick={() => setRecommendations([])}
                    className="text-sm text-slate-500 hover:text-slate-300"
                  >
                    Clear
                  </button>
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {recommendations.map((uni, index) => (
                    <UniversityCard
                      key={uni.id || index}
                      uni={uni}
                      onAddToTracker={handleAddToTracker}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
