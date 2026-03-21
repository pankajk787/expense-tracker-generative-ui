import { useState } from "react";
import type { Message } from "../main.types";


const ChatMessage = ({ message }: { message: Message}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isUser = message.type === 'user';
  const isToolCall = message.type === 'toolCall:start';
  const isTool = message.type === 'tool';

  if (isToolCall) {
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-blue-900 text-blue-100 px-4 py-3 rounded-lg rounded-bl-none w-full">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium">Tool Call Started</p>
          </div>
          {message.payload && Object.keys(message.payload).length > 0 && (
            <p className="text-xs text-blue-200 mt-2">
              {JSON.stringify(message.payload, null, 2)}
            </p>
          )}
        </div>
      </div>
    );
  }

  
  if (isTool) {
    console.log("Message:", message)
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-start mb-4">
          <div className="bg-green-900 text-green-100 px-4 py-3 rounded-lg rounded-bl-none w-full">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full hover:opacity-80 transition"
            >
              <span className="text-sm font-medium">
                ✓ Tool Result: <span className="font-semibold">{message.payload.name}</span>
              </span>
              <span className="text-sm">{isOpen ? '▼' : '▶'}</span>
            </button>
            {isOpen && message.payload.result && (
              <div className="mt-3">
                <p className="text-xs text-green-200 bg-black/20 p-2 rounded overflow-x-auto">
                  <pre>{JSON.stringify(message.payload.result, null, 2)}</pre>
                </p>
              </div>
            )}
          </div>
        </div>
        {
          message.payload.name === "generate_expense_chart" && 
          <div>
            Generate Chart Result
          </div>
        }
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-none w-[80%] ml-auto'
            : 'bg-gray-800 text-gray-100 rounded-bl-none w-full'
        }`}
      >
        {
          message.payload.text && 
          <div>
            <p className="text-xs text-color-gray-500 mb-2">{isUser ? "You": "Assisstant"}</p>
            <p className="text-sm">{message.payload.text}</p>
          </div>
        }
        {/* {message.payload.text && <p className="text-sm">{message.payload.text}</p>} */}
        {/* <p className="text-sm">{message.payload.}</p> */}
      </div>
    </div>
  );
};

export default ChatMessage
