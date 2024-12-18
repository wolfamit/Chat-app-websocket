import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<string[]>([]); // Store chat messages
  const [inputMessage, setInputMessage] = useState<string>(""); // Input message state
  const ws = useRef<WebSocket | null>(null); // WebSocket reference

  useEffect(() => {
    // Establish WebSocket connection
    ws.current = new WebSocket("ws://localhost:8080");

    // Send "join" message after the connection is established
    ws.current.onopen = () => {
      ws.current?.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: "red",
          },
        })
      );
    };

    // Handle incoming messages
    ws.current.onmessage = (event) => {
      try {
        
        const newMessage = event.data;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } catch (error) {
        console.error("Error parsing incoming message:", error);
      }
    };

    // Handle WebSocket connection errors
    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Clean up WebSocket connection on component unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "chat",
          payload: {
            message: inputMessage,
          },
        })
      );
      setInputMessage(""); // Clear input field after sending
    } else {
      console.error("WebSocket is not open");
    }
  };

  return (
    <div className="h-[100vh]  bg-black flex flex-col justify-between">
      {/* Header */}
      <h1 className="text-center text-3xl text-white py-4 border-b border-gray-700">
        Chat App
      </h1>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m, index) => (
          <div
            key={index}
            className="rounded-lg max-w-[75%] p-4 my-2 bg-slate-50 shadow-md"
          >
            <span className="text-black font-sans text-lg">{m}</span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center bg-gray-800 p-4 border-t border-gray-700">
        <input
          className="flex-1 p-3 rounded-lg text-lg bg-gray-900 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-400 outline-none"
          type="text"
          placeholder="Write your message"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)} // Update input state
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputMessage.trim() !== "") {
              sendMessage();
            }
          }}
        />
        <button
          className="ml-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
