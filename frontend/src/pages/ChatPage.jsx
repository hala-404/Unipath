import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { useLocation } from "react-router-dom";
import {
  Bot,
  MessageCircle,
  Sparkles,
  Lightbulb,
  SendHorizonal,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your UniPath AI advisor. I can help you discover universities, understand your fit scores, compare options, and track your applications. What would you like to explore today?",
      time: formatTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starterSuggestions, setStarterSuggestions] = useState([]);

  useEffect(() => {
    if (location.state?.starterMessage) {
      setInput(location.state.starterMessage);
    }
  }, [location.state]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    async function loadSuggestions() {
      if (!isLoaded || !isSignedIn) return;

      const fallbackSuggestions = [
        "Recommend universities for my profile",
        "Compare my tracked universities",
        "What should I do next for my applications?",
        "Which university fits me best?",
      ];

      try {
        const token = await getToken();

        const response = await fetch(`${API_URL}/chat/suggestions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && Array.isArray(data.suggestions)) {
          setStarterSuggestions(data.suggestions);
        } else {
          setStarterSuggestions(fallbackSuggestions);
        }
      } catch (error) {
        setStarterSuggestions(fallbackSuggestions);
      }
    }

    loadSuggestions();
  }, [getToken, isLoaded, isSignedIn]);

  const messageCount = useMemo(() => messages.length, [messages.length]);

  const sendMessage = async (textOverride) => {
    const textToSend = typeof textOverride === "string" ? textOverride : input;

    if (!textToSend.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: textToSend,
      time: formatTime(),
    };

    const historyForRequest = messages.slice(-6);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      if (!isLoaded || !isSignedIn) {
        throw new Error("You must be signed in to use chat.");
      }

      const token = await getToken();

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          message: textToSend,
          history: historyForRequest,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to get chatbot response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          time: formatTime(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong while contacting the assistant.",
          time: formatTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    await sendMessage();
  };

  const handleSuggestionClick = async (suggestion) => {
    await sendMessage(suggestion);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-5 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <Bot className="h-7 w-7" />
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  AI Advisor
                </h1>
                <div className="mt-1 flex items-center gap-2 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="text-sm md:text-base">
                    Online - Ready to help
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm md:text-base">
                {messageCount} message{messageCount > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto flex h-full max-w-5xl flex-col">
            <div className="mb-5 rounded-[26px] border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-6 w-6 text-emerald-600" />
                <div className="w-full">
                  <h2 className="text-2xl font-bold text-slate-900">
                    How can I help you today?
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-slate-600">
                    I can help you discover universities, explain recommendations,
                    compare options, and guide your application journey.
                  </p>
                </div>
              </div>
            </div>

            {starterSuggestions.length > 0 && messages.length <= 1 && (
              <div className="mb-6 grid gap-3 md:grid-cols-2">
                {starterSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-base font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    <Lightbulb className="h-5 w-5 shrink-0 text-emerald-600" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 space-y-5 overflow-y-auto pb-36">
              {messages.map((msg, index) => {
                const isAssistant = msg.role === "assistant";

                return (
                  <div
                    key={`${msg.role}-${index}`}
                    className={`flex gap-3 ${
                      isAssistant ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isAssistant && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-[24px] px-5 py-4 shadow-sm ${
                        isAssistant
                          ? "bg-slate-100 text-slate-800"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      <p className="whitespace-pre-line text-base leading-relaxed">
                        {msg.content}
                      </p>
                      <p
                        className={`mt-3 text-xs ${
                          isAssistant ? "text-slate-500" : "text-emerald-50"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>

                  <div className="max-w-[85%] rounded-[24px] bg-slate-100 px-5 py-4 text-slate-600 shadow-sm">
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>
        </main>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-5 backdrop-blur md:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ask me anything about universities..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                />

                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SendHorizonal className="h-5 w-5" />
                  Send
                </button>
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-slate-500">
              AI responses are generated based on your profile and university data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}