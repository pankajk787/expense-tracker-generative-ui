import type { Message } from "../main.types";


const ChatMessage = ({ message }: { message: Message}) => {
  const isUser = message.type === 'user';

  console.log("Message inside: CahtMessage:::", message)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-none w-[80%] ml-auto'
            : 'bg-gray-800 text-gray-100 rounded-bl-none w-full'
        }`}
      >
        {message.payload.text && <p className="text-sm">{message.payload.text}</p>}
        {/* <p className="text-sm">{message.payload.}</p> */}
      </div>
    </div>
  );
};

export default ChatMessage
