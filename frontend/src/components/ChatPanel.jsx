import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ChatPanel({ paperId, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I can answer questions about this paper. Try asking about the methodology, novelty, biases, or improvements.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/chat`, {
        paper_id: paperId,
        message: text,
        conversation_id: conversationId,
      });
      setConversationId(data.conversation_id);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, sources: data.sources }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col bg-white border-l border-gray-200 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-yellow-700 to-orange-700 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-bold text-lg">Review Chat</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-yellow-700 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
                    Sources: {msg.sources.join(', ')}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-700" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about the paper..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:border-yellow-700 focus:ring-2 focus:ring-yellow-700/30 outline-none text-sm transition-all"
            />
            <motion.button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-yellow-700 text-white disabled:opacity-40 hover:bg-orange-700 transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
