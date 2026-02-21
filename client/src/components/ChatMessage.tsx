interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-none'
            : 'bg-gray-800 text-gray-100 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
};

export default ChatMessage
