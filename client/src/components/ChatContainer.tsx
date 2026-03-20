import { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { Message, StreamMessage } from "../main.types";

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   type: "ai" | "user" | "toolCall:start" | "tool"
// }

interface CardConfig {
  emoji: string;
  title: string;
  description: string;
}

const CARD_CONFIGS: CardConfig[] = [
  {
    emoji: "🚀",
    title: "Get started",
    description: "Try asking a question",
  },
  {
    emoji: "📚",
    title: "Learn more",
    description: "Explore my capabilities",
  },
  {
    emoji: "💡",
    title: "Tips & tricks",
    description: "Make the most of this chat",
  },
  {
    emoji: "✨",
    title: "Examples",
    description: "See what I can do",
  },
];

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: new Date().getTime().toString(),
      type: "user",
      payload: { text: content },
    };

    setMessages((prev) => [...prev, userMessage]);
    // setIsLoading(true);

    const userInput = content.trim();
    const submitQuery = async (input: string) => {
      await fetchEventSource("http://localhost:5001/chat", {
        method: "POSt",
        body: JSON.stringify({ query: input }),
        headers: {
          "Content-Type": "application/json",
        },
        onmessage(ev) {
          // console.log(ev.data);
          const response = JSON.parse(ev.data) as StreamMessage;
          console.log("Response::::", response);
          if (response.type === "ai") {
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.type === "ai") {
                const clonedMessages = [...prev];
                clonedMessages[clonedMessages.length - 1] = {
                  ...lastMessage,
                  payload: {
                    text: lastMessage.payload.text + response.payload.text,
                  },
                };
                return clonedMessages;
              } else {
                return [
                  ...prev,
                  {
                    id: new Date().getTime().toString(),
                    type: "ai",
                    payload: response.payload,
                  },
                ];
              }
            });
          }
        },
      });
    };
    submitQuery(userInput);
  };

  // useEffect(()=>{
  //   const submitQuery = async () => {
  //     await fetchEventSource('http://localhost:5001/chat', {
  //       method: "POSt",
  //       body: JSON.stringify({ query: "Helloo"}),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       onmessage(ev) {
  //           console.log(ev.data);
  //       }
  //     });
  //   }
  //   submitQuery();
  //   // const eventSrc = new EventSource("http://localhost:5001/chat");
  //   // eventSrc.addEventListener("open", () => {
  //   //   console.log("Event Opened");
  //   // });

  //   // // eventSrc.addEventListener("message", (data) => {
  //   // //   console.log("[message event]: Recieved message", data)
  //   // // })

  //   // eventSrc.addEventListener("ping", (message) => {
  //   //   console.log("[Custom ping event]: Recieved message", message)
  //   //   // setMessages((prev) => ([...prev, { id: String(new Date().getTime()), content: message.data, role: "assistant" }]))
  //   // })
  // }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-gray-900 border-b border-gray-800">
        <div className="text-lg font-semibold text-white">
          💬 AI Expense Tracker
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-[90%] sm:w-[80%] md:w-[70%] lg:w-[65%] mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-4xl text-white hidden sm:block">
                💬 AI Expense Tracker
              </div>
              <h1 className="text-2xl font-semibold text-white">
                How can I help you today?
              </h1>
              <p className="text-gray-400 text-center max-w-sm">
                Ask me anything, and I'll do my best to assist you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full max-w-lg">
                {CARD_CONFIGS.map((card) => (
                  <div
                    key={card.title}
                    className="p-4 bg-gray-900 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800 transition"
                  >
                    <p className="font-medium text-white text-sm">
                      {card.emoji} {card.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Chat Input Area */}
      <div>
        <div className="w-[90%] sm:w-[80%] md:w-[70%] lg:w-[65%] mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>

    </div>
  );
};

export default ChatContainer;
