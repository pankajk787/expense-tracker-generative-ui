import { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
  suggestion: string;
  route?: string;
}

const CARD_CONFIGS: CardConfig[] = [
  {
    emoji: "🚀",
    title: "Get started",
    description: "Try asking a question",
    suggestion: "Give me my expenses breakdown till date",
  },
  {
    emoji: "📚",
    title: "Learn more",
    description: "Explore my capabilities",
    suggestion: "What expenses did I add this month?",
    route: "/learn-more",
  },
  {
    emoji: "💡",
    title: "Tips & tricks",
    description: "Make the most of this chat",
    suggestion: "Show me my spending by category",
    route: "/tips-tricks",
  },
  {
    emoji: "✨",
    title: "Examples",
    description: "See what I can do",
    suggestion: "Visualize my expenses for this year",
    route: "/examples",
  },
  {
    emoji: "💰",
    title: "Set a budget",
    description: "Create spending limits",
    suggestion: "Set a ₹500 budget for groceries",
  },
  {
    emoji: "📊",
    title: "Budget status",
    description: "Check your spending",
    suggestion: "Show me my budget status",
  },
  {
    emoji: "📈",
    title: "Spending insights",
    description: "Analyze patterns",
    suggestion: "Analyze my spending trends",
  },
];

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<{ setInput: (text: string) => void; focus: () => void }>(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCardClick = (card: CardConfig) => {
    if (card.route) {
      navigate(card.route);
    } else {
      if (chatInputRef.current) {
        chatInputRef.current.setInput(card.suggestion);
        chatInputRef.current.focus();
      }
    }
  };

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
      try {
        await fetchEventSource("http://localhost:5001/chat", {
          method: "POSt",
          body: JSON.stringify({ query: input }),
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          onopen: async (response) => {
            if (response.status === 401) {
              logout();
              navigate("/login");
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.type === "user") {
                  const clonedMessages = [...prev];
                  clonedMessages.pop(); // Remove the user message
                  return clonedMessages;
                }
                return prev;
              });
              throw new Error("Unauthorized - redirecting to login");
            }
          },
          onerror: (error) => {
            console.error("Chat error:", error);
            // Handle other errors
            const errorMessage = error instanceof Error ? error.message : "An error occurred";
            setMessages((prev) => [
              ...prev,
              {
                id: new Date().getTime().toString(),
                type: "ai",
                payload: { text: `Error: ${errorMessage}` },
              },
            ]);
          },
          onmessage(ev) {
            // console.log(ev.data);
            const response = JSON.parse(ev.data) as StreamMessage;
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
                  // setIsLoading(true);
                  return [
                    ...prev,
                    {
                      id: new Date().getTime().toString(),
                      type: "ai",
                      payload: response.payload,
                    },
                  ];
                  // setIsLoading(false);
                }
              });
            } else if( response.type === "toolCall:start") {
              console.log("TOOL CALL START")
              setIsLoading(true);
              setMessages((prev) => {
                return [
                  ...prev,
                  {
                    id: new Date().getTime().toString(),
                    type: "toolCall:start",
                    payload: response.payload
                  }
                ]
              });
              setIsLoading(false);
            } else if(response.type === "tool") {
              setMessages((prev) => {
                return [
                  ...prev,
                  {
                    id: new Date().getTime().toString(),
                    type: "tool",
                    payload: response.payload
                  }
                ]
              });
            }
          },
        });
      } catch (error) {
        console.error("Failed to submit query:", error);
        // Error already handled in onerror callback
      }
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
    <div className="flex flex-col h-[calc(100vh-72px)] bg-gray-950">
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
              <p className="text-slate-400 text-center max-w-sm">
                Ask me anything related to your expenses, and I'll do my best to assist you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full max-w-lg">
                {CARD_CONFIGS.map((card) => (
                  <div
                    key={card.title}
                    onClick={() => handleCardClick(card)}
                    className="p-4 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-700 hover:border-indigo-500 transition"
                  >
                    <p className="font-medium text-white text-sm">
                      {card.emoji} {card.title}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
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
                  <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
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

      {/* Chat Input Area - Fixed at bottom */}
      <div className="bg-gray-950">
        <div className="w-[90%] sm:w-[80%] md:w-[70%] lg:w-[65%] mx-auto">
          <ChatInput ref={chatInputRef} onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>

    </div>
  );
};

export default ChatContainer;
