import type { ChatMessage } from '../../stores/chatStore';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-slide-in`}>
      <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
        isUser
          ? 'bg-gold/15 border border-gold/25 text-parchment'
          : 'bg-midnight-blue/80 border border-gold/10 text-parchment'
      }`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">🧙</span>
            <span className="font-cinzel text-xs text-gold/80">Gandalf</span>
          </div>
        )}
        <div className="font-crimson text-base leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        <div className={`text-xs mt-2 ${isUser ? 'text-gold/40' : 'text-mithril/30'}`}>
          {new Date(message.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
