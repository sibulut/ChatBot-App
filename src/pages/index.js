// src\pages\index.js

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  // Maximum allowed conversation turns
  const MAX_CONVERSATION_LIMIT = 11;

  // Function to simulate the bot typing one word at a time
  const typeResponse = (response) => {
    let words = response.split(" ");
    let index = 0;

    // Create a new message for the bot response
    const newMessage = { role: "assistant", content: "" };

    // Gradually update the bot's response one word at a time
    const interval = setInterval(() => {
      newMessage.content = words.slice(0, index + 1).join(" ");

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1] = newMessage;  // Update the last message
        return newMessages;
      });

      index++;
      if (index === words.length) {
        clearInterval(interval); // Stop typing when all words are shown
      }
    }, 100); // Adjust typing speed by changing the interval
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    // Check if the conversation limit has been reached (consider only user prompts)
    const userMessagesCount = messages.filter((msg) => msg.role === "user").length;

    if (userMessagesCount >= MAX_CONVERSATION_LIMIT) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content:
            "\n**I am sorry but you have reached the max allowed conversation limit. My coder Sadik has imposed a conversation limit. Please refresh the page and start a new conversation**.",
        },
      ]);
      return; // Stop the function from continuing after the limit is reached
    }

    // Display user's message
    setMessages((prevMessages) => [
      ...prevMessages.filter((msg) => msg.role !== "assistant" || !msg.content.includes("Typing...")),
      { role: "user", content: userInput },
    ]);

    try {
      // Create the conversation history with the system, user, and bot messages
      const conversationHistory = [
        { role: "system", content: "You are a helpful and knowledgeable assistant." },
        ...messages,  // Include previous conversation history
        { role: "user", content: userInput }
      ];

      // OpenAI Chat Completion API call
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_query: conversationHistory }),
      });

      const data = await response.json();
      if (data.response) {
        // Start typing out the bot's response
        setMessages((prevMessages) => [
          ...prevMessages, // Keep previous messages
          { role: "assistant", content: "Typing..." }, // Show "Typing..." message temporarily
        ]);
        typeResponse(data.response); // Type out the bot response
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
    }

    setUserInput(""); // Clear input
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", display: "flex", justifyContent: "center" }}>
      <div
        id="chat-container"
        style={{
          width: "40%", // Set width to 40% of the page
          padding: "20px",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "5px",
          height: "70vh", // Optional, set height if you want a fixed height
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <h2>Chat with the AI Bot</h2>
        <div
          id="messages"
          style={{
            height: "90%",
            overflowY: "auto",
            padding: "10px",
            background: "#f9f9f9",
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.role}`}
              style={{
                textAlign: msg.role === "user" ? "right" : "left",
                color: msg.role === "user" ? "blue" : "green",
              }}
            >
              <strong>{msg.role === "user" ? "You:" : "AI:"}</strong> {msg.content}
            </div>
          ))}
        </div>
        <div id="input-area" style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message here..."
            style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            style={{ padding: "10px 20px", backgroundColor: "blue", color: "white", border: "none", borderRadius: "5px" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}