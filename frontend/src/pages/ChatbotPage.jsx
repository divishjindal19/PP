// src/pages/ChatbotPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotAPI } from '../api/client';
import { Send, Bot, User, Sparkles, MessageCircle } from 'lucide-react';

const QUICK_PROMPTS = [
  "Best electives for AI in 3rd year?",
  "Easy courses to boost my GPA?",
  "Roadmap to become ML Engineer?",
  "How to prepare for Google internship?",
  "Which courses have the best rating?",
  "Plan my semester for Data Science",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 max-w-xs">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
        <Bot size={14} className="text-white" />
      </div>
      <div className="chat-bot px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isUser ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #10b981, #059669)' }}>
        {isUser ? <User size={14} className="text-emerald-400" /> : <Bot size={14} className="text-white" />}
      </div>
      {/* Bubble */}
      <div className={`max-w-md px-4 py-3 text-sm ${isUser ? 'chat-user' : 'chat-bot'}`}>
        <div className="whitespace-pre-wrap leading-relaxed text-white"
          dangerouslySetInnerHTML={{
            __html: msg.content
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-300">$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
          }} />
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hello! I'm **UniAdvisor**, your AI academic assistant 🎓\n\nI can help you with course recommendations, career roadmaps, GPA strategies, and internship preparation. What would you like to explore today?`
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const query = text || input.trim();
    if (!query || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: query };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await chatbotAPI.query({
        student_id: profile?.id || 'demo',
        query,
        student_context: profile,
        history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(m => [...m, { role: 'assistant', content: res.data.response }]);
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please check if the backend is running at http://localhost:8000'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-dark)' }}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white flex items-center gap-1">
            UniAdvisor AI <Sparkles size={13} className="text-emerald-400" />
          </h1>
          <p className="text-xs text-gray-400">RAG-powered academic advisor • Always online</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => send(p)}
              className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
              style={{ background: 'rgba(16,185,129,0.08)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-3 items-end">
          <div className="flex-1 rounded-2xl p-3 flex items-end gap-2"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about courses, careers, internships..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 flex-shrink-0"
            style={{ background: input.trim() && !loading ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Send size={16} className={input.trim() && !loading ? 'text-white' : 'text-gray-500'} />
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Powered by Groq LLaMA • Add GROQ_API_KEY in backend .env for full RAG mode
        </p>
      </div>
    </div>
  );
}
