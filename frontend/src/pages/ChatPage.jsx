import { useState } from "react";
import { useAuth } from "@clerk/react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I’m UniPath Assistant. Ask me about universities, GPA, deadlines, or application guidance.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
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
          content: "Sorry, something went wrong while contacting the assistant.",
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
        <h1 className="text-3xl font-bold mb-2">UniPath Assistant</h1>
        <p className="text-slate-300 mb-6">
          Ask questions about universities, GPA requirements, deadlines, and application guidance.
        </p>

        <div className="bg-slate-900 rounded-2xl shadow-lg p-4 h-[500px] overflow-y-auto mb-4 border border-slate-800">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-line ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-100"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-slate-800 text-slate-300">
                Thinking...
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}