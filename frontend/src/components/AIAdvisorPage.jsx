import { Bot, Sparkles, SendHorizonal } from "lucide-react";
import AppLayout from "./AppLayout";
import { useState } from "react";

const prompts = [
  "Recommend universities for my profile",
  "Compare my tracked universities",
  "What should I do next for my applications?",
  "Which university fits me best?",
];

export default function AIAdvisorPage() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <AppLayout
      active="advisor"
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      <div className="space-y-6">
        <div
          className={
            darkMode
              ? "rounded-3xl border border-white/10 bg-[#0c1a31] p-6"
              : "rounded-3xl border border-black/10 bg-white p-6"
          }
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Bot size={26} />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight">AI Advisor</h1>
              <p
                className={
                  darkMode ? "text-slate-400 mt-1" : "text-slate-500 mt-1"
                }
              >
                Online · Ready to help
              </p>
            </div>
          </div>
        </div>

        <div
          className={
            darkMode
              ? "rounded-3xl border border-white/10 bg-[#0b1730] p-8"
              : "rounded-3xl border border-black/10 bg-white p-8"
          }
        >
          <div className="flex items-start gap-3 mb-6">
            <Sparkles className="text-emerald-500 mt-1" size={24} />
            <div>
              <h2 className="text-4xl font-bold">How can I help you today?</h2>
              <p
                className={
                  darkMode
                    ? "mt-3 text-xl text-slate-400"
                    : "mt-3 text-xl text-slate-600"
                }
              >
                I can help you discover universities, explain recommendations,
                compare options, and guide your application journey.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                className={
                  darkMode
                    ? "rounded-2xl border border-white/10 bg-[#0e1b35] px-5 py-5 text-left text-lg text-slate-200 hover:bg-[#13213e] transition"
                    : "rounded-2xl border border-black/10 bg-[#fafaf8] px-5 py-5 text-left text-lg text-slate-700 hover:bg-[#f1f2ee] transition"
                }
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-emerald-500" />
                  <span>{prompt}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <Bot size={22} />
              </div>

              <div
                className={
                  darkMode
                    ? "max-w-4xl rounded-3xl bg-[#12213d] px-6 py-5"
                    : "max-w-4xl rounded-3xl bg-[#f3f4f6] px-6 py-5"
                }
              >
                <p className="text-[17px] leading-8">
                  Hello! I'm your UniPath AI advisor. I can help you discover
                  universities, understand your fit scores, compare options, and
                  track your applications. What would you like to explore today?
                </p>

                <p
                  className={
                    darkMode
                      ? "mt-3 text-sm text-slate-400"
                      : "mt-3 text-sm text-slate-500"
                  }
                >
                  10:22 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={
            darkMode
              ? "sticky bottom-4 rounded-3xl border border-white/10 bg-[#0c1830] p-4"
              : "sticky bottom-4 rounded-3xl border border-black/10 bg-white p-4 shadow-sm"
          }
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask me anything about universities..."
              className={
                darkMode
                  ? "flex-1 rounded-2xl border border-white/10 bg-[#071122] px-5 py-4 text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
                  : "flex-1 rounded-2xl border border-black/10 bg-[#fafaf8] px-5 py-4 text-black placeholder:text-slate-400 outline-none focus:border-emerald-500"
              }
            />

            <button className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 font-semibold transition">
              <SendHorizonal size={18} />
              Send
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
