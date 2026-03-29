import { useState, forwardRef, useImperativeHandle, useRef } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

interface ChatInputHandle {
  setInput: (text: string) => void;
  focus: () => void;
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  ({ onSendMessage, isLoading = false }, ref) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      setInput: (text: string) => {
        setInput(text);
      },
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        console.log('Submitted:', input);
        onSendMessage(input);
        setInput('');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (input.trim() && !isLoading) {
          console.log('Submitted:', input);
          onSendMessage(input);
          setInput('');
        }
      }
    };

    return (
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex bg-slate-800 border border-slate-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isLoading}
            rows={2}
            className="flex-1 px-4 py-2 bg-slate-800 text-white border-0 focus:outline-none disabled:opacity-50 resize-none placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput
