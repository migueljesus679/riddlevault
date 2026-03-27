import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import MessageBubble from './MessageBubble';
import { Button, Textarea } from '../ui';
import { RuneLoader } from '../effects';

export default function ChatWindow() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isStreaming, error, sendMessage, newConversation } = useChatStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-cinzel text-2xl text-gold">Conselho de Gandalf</h1>
          <p className="font-crimson text-sm text-mithril/60">Fala, e seras ouvido.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={newConversation}>
          Nova Conversa
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-6xl mb-4">🧙</span>
            <p className="font-cinzel text-xl text-gold/80">Saudacoes, viajante</p>
            <p className="font-crimson text-mithril/50 mt-2 max-w-md">
              Estou aqui para te auxiliar. Escreve a tua questao e eu farei o meu melhor para te ajudar com sabedoria.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-center py-2">
            <RuneLoader size="sm" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mb-3 px-4 py-2 bg-red-900/30 border border-red-700/30 rounded-lg">
          <p className="font-crimson text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreve a tua mensagem..."
          className="flex-1 min-h-[52px] max-h-40"
          rows={1}
          disabled={isStreaming}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="h-[52px]"
        >
          Enviar
        </Button>
      </div>
    </div>
  );
}
