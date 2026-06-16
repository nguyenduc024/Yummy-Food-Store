import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào! Tôi là trợ lý Yummy. Tôi có thể giúp gì cho bạn hôm nay?',
    },
  ]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    setMessages(current => [...current, newMessage]);
    setDraft('');

    window.setTimeout(() => {
      setMessages(current => [
        ...current,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'Cảm ơn bạn! Chúng tôi sẽ trả lời trong giây lát.',
        },
      ]);
    }, 400);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[340px] max-w-[90vw] rounded-[28px] border-2 border-foreground bg-background/95 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-foreground/20 px-4 py-3">
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                Yummy Chat
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                Hỗ trợ toàn trang
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
              aria-label="Đóng chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.sender === 'bot'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-foreground text-background'
                  }`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-foreground/20 px-4 py-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={event => setDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Gõ tin nhắn..."
                className="flex-1 rounded-2xl border border-border bg-secondary px-3 py-2 text-sm outline-none transition-colors focus:border-foreground focus:bg-background"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <button
                type="button"
                onClick={handleSend}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background transition-colors hover:bg-accent"
                aria-label="Gửi tin nhắn"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(open => !open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1"
        aria-label="Mở chat hỗ trợ"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
