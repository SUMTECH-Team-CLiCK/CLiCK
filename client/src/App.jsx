import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import PromptInput from './components/PromptInput';
import './App.css';

function App() {
  // 실제로는 채팅 목록과 메시지를 API로부터 받아와야 합니다.
  const [messages, setMessages] = useState([
    { sender: 'gpt', text: '안녕하세요! 무엇을 도와드릴까요?' }
  ]);
  const [chats, setChats] = useState([
      { id: 1, title: '카보닐기 정의 설명', isFavorited: true },
      { id: 2, title: '리액트 state 관리 방법', isFavorited: false },
  ]);

  const handleSendMessage = (newMessage) => {
    // 사용자가 보낸 메시지를 화면에 추가
    setMessages(prev => [...prev, { sender: 'user', text: newMessage }]);
    
    // TODO: 백엔드 API 호출하여 GPT 응답 받아오기
    // const gptResponse = await api.getChatResponse(newMessage);
    // setMessages(prev => [...prev, { sender: 'gpt', text: gptResponse }]);
  };
  
  const handleToggleFavorite = (id) => {
    setChats(chats.map(chat => 
      chat.id === id ? { ...chat, isFavorited: !chat.isFavorited } : chat
    ));
  };

  return (
    <div className="app-container">
      <Sidebar chats={chats} onToggleFavorite={handleToggleFavorite} />
      <main className="chat-area">
        <ChatWindow messages={messages} />
        <PromptInput onSendMessage={handleSendMessage} />
      </main>
    </div>
  );
}

export default App;