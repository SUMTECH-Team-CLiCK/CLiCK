import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import PromptInput from './components/PromptInput';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState([{ sender: 'gpt', text: '안녕하세요! 무엇을 도와드릴까요?' }]);
  const [chats, setChats] = useState([
    { id: 1, title: '카보닐기 정의 설명', isFavorited: true },
    { id: 2, title: '리액트 state 관리 방법', isFavorited: false },
  ]);

  const handleSend = (msg) => setMessages([...messages, { sender: 'user', text: msg }]);
  const handleOverwriteInput = (txt) => {
    const area = document.querySelector('textarea');
    if (area) {
      area.value = txt;
      area.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };
  const handleApplyPrompt = (p) => handleOverwriteInput(p);
  const handleToggleFavorite = (id) =>
    setChats(chats.map(c => c.id === id ? { ...c, isFavorited: !c.isFavorited } : c));

  return (
    <div className="app-container">
      <Sidebar chats={chats} onToggleFavorite={handleToggleFavorite} onApplyPrompt={handleApplyPrompt} />
      <main className="chat-area">
        <ChatWindow messages={messages} />
        <PromptInput onSend={handleSend} onOverwriteInput={handleOverwriteInput} />
      </main>
    </div>
  );
}
