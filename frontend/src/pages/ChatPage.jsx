import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";

// University Card Component
function UniversityCard({ uni, onAddToTracker }) {
  const deadlineDate = new Date(uni.deadline);
  const daysLeft = Math.ceil(
    (deadlineDate - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysLeft <= 14;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 transition hover:border-blue-500">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{uni.name}</h3>
          <p className="text-sm text-slate-400">
            {uni.city}, {uni.country}
          </p>
        </div>

        {uni.risk && (
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${
              uni.risk === "Safe"
                ? "bg-green-500/20 text-green-400"
                : uni.risk === "Match"
                ? "bg-amber-500/20 text-amber-400"
                : uni.risk === "Reach"
                ? "bg-red-500/20 text-red-400"
                : "bg-slate-600 text-slate-300"
            }`}
          >
            {uni.risk}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300">
          {uni.program}
        </span>
        <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300">
          {uni.language}
        </span>
        <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300">
          Min GPA: {uni.min_gpa}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`text-sm ${
            isUrgent ? "font-medium text-red-400" : "text-slate-400"
          }`}
        >
          {isUrgent
            ? `⚠️ ${daysLeft} days left`
            : `Deadline: ${deadlineDate.toLocaleDateString()}`}
        </span>

        <button
          onClick={() => onAddToTracker(uni.name)}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition hover:bg-blue-700"
        >
          + Track
        </button>
      </div>

      {uni.reasons && uni.reasons.length > 0 && (
        <div className="mt-3 border-t border-slate-700 pt-3">
          <p className="mb-1 text-xs text-slate-500">Why this matches:</p>
          <ul className="space-y-1 text-xs text-slate-400">
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
function QuickActions({ onAction, t }) {
  const actions = [
    {
      label: t("chat.quickRecommendations") || "🎯 Get Recommendations",
      message:
        t("chat.quickRecommendationsMessage") ||
        "Give me university recommendations based on my profile",
    },
    {
      label: t("chat.quickDeadlines") || "📅 Upcoming Deadlines",
      message: t("chat.quickDeadlinesMessage") || "Show me upcoming deadlines",
    },
    {
      label: t("chat.quickTracker") || "📋 My Tracker",
      message: t("chat.quickTrackerMessage") || "Show my application tracker",
    },
    {
      label: t("chat.quickCompare") || "🆚 Compare Schools",
      message: t("chat.quickCompareMessage") || "Help me compare universities",
    },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => onAction(action.message)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

// Main Chat Page
export default function ChatPage() {
  // FIX: Use lang directly from context — this is what triggers re-renders on language change
  const { t, lang } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  // FIX: Keep a ref to lang for use inside async sendMessage
  // This ensures the latest lang is always sent to the backend
  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  // FIX: Update welcome message whenever language changes
  // This replaces only the first assistant message (the welcome message)
  useEffect(() => {
    setMessages((prev) => {
      const welcomeMsg = { role: "assistant", content: t("chat.welcome") };
      if (prev.length === 0) {
        return [welcomeMsg];
      }
      // Replace the first message (welcome) with the translated version
      return [welcomeMsg, ...prev.slice(1)];
    });
  }, [lang]); // runs every time language changes

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || loading) return;

    const trimmed = messageText.trim();
    const userMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
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
          message: trimmed,
          history: nextMessages.slice(-6),
          // FIX: Use langRef.current so the async call always gets the latest language
          language: langRef.current,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to get response");
      }

      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      } else if (data.meta?.type === "tracker" && data.data) {
        setRecommendations(data.data);
      } else if (data.action === "chat" || data.action === "give_advice") {
        setRecommendations([]);
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
          // FIX: t() is reactive to lang so this will use the current language
          content: t("chat.error") || "Sorry, I encountered an error. Please try again.",
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
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {t("chat.title") || "UniPath Advisor"}
          </h1>
          <p className="mt-1 text-slate-400">
            {t("chat.subtitle") ||
              "Your AI-powered university application assistant"}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Chat Column */}
          <div className="flex-1">
            {/* Messages */}
            <div className="mb-4 h-[500px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900">
              <div className="space-y-4 p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "ms-auto bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-100"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {msg.action && msg.role === "assistant" && (
                      <div className="mt-2 border-t border-slate-700 pt-2">
                        <span className="text-xs text-slate-500">
                          Action: {msg.action}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="max-w-[85%] rounded-2xl bg-slate-800 px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Actions */}
            {showQuickActions && <QuickActions onAction={sendMessage} t={t} />}

            {/* Input */}
            <div className="flex gap-2">
              <input
                key={lang}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("chat.placeholder")}
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
                <h2 className="mb-4 flex items-center justify-between text-lg font-semibold">
                  <span>
                    {t("chat.results") || "Results"} ({recommendations.length})
                  </span>
                  <button
                    onClick={() => setRecommendations([])}
                    className="text-sm text-slate-500 hover:text-slate-300"
                  >
                    {t("chat.clear") || "Clear"}
                  </button>
                </h2>

                <div className="max-h-[600px] space-y-3 overflow-y-auto pr-2">
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
