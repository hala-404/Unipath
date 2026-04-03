import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function ChatPage() {
  const { t, lang } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  // Reset welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            role: "assistant",
            content: t("chat.welcome"),
          },
        ];
      }

      return prev;
    });
  }, [lang]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      console.log("token:", token);

      const res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to get chatbot response.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t("chat.error"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t("chat.title")}</h1>
        <p className="text-slate-300 mb-6">{t("chat.subtitle")}</p>

        <div className="bg-slate-900 rounded-2xl shadow-lg p-4 h-[500px] overflow-y-auto mb-4 border border-slate-800">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-line ${
                  msg.role === "user"
                    ? "ms-auto bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-100"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-slate-800 text-slate-400">
                ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex gap-2">
          <input
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
            {t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  );
}
