import React from 'react';

export default function ChatWindow({ messages }) {
  return (
    <div className="chat-window" style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
      {messages.map((msg, idx) => (
        <div key={idx} style={{ marginBottom: '10px' }}>
          <strong>{msg.sender === 'gpt' ? 'GPT' : '나'}:</strong> {msg.text}
        </div>
      ))}
    </div>
  );
}

