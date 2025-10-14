import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import PromptInput from './components/PromptInput';
import './App.css';

export default function App() {
  // 채팅 메시지들을 관리하는 상태
  const [messages, setMessages] = useState([
    { sender: 'gpt', text: '안녕하세요! 무엇을 도와드릴까요?' }
  ]);
  
  // 채팅 목록과 즐겨찾기 상태를 관리하는 상태
  const [chats, setChats] = useState([
    { id: 1, title: '카보닐기 정의 설명', isFavorited: true },
    { id: 2, title: '리액트 state 관리 방법', isFavorited: false },
  ]);

  // PromptInput에서 새 메시지를 보냈을 때 호출될 함수
  const handleSendMessage = (msg) => {
    setMessages([...messages, { sender: 'user', text: msg }]);
    // TODO: 실제 GPT API로 메시지를 보내고 응답을 받아 messages에 추가하는 로직
  };

  // Sidebar나 PromptAnalysis에서 프롬프트 내용을 덮어쓰려 할 때 호출될 함수
  const handleOverwriteInput = (text) => {
    // content script 환경에서는 document에 직접 접근하여 textarea의 값을 변경
    const textarea = document.querySelector('#prompt-textarea');
    if (textarea) {
      textarea.value = text;
      // React가 아닌 환경에서 값을 바꿀 땐, 수동으로 input 이벤트를 발생시켜야
      // 페이지가 값이 변경되었음을 인지합니다.
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  // Sidebar에서 즐겨찾기 버튼을 눌렀을 때 호출될 함수
  const handleToggleFavorite = (id) => {
    setChats(
      chats.map(c => (c.id === id ? { ...c, isFavorited: !c.isFavorited } : c))
    );
  };

  return (
    <div className="app-container">
      <Sidebar 
        chats={chats} 
        onToggleFavorite={handleToggleFavorite} 
        onApplyPrompt={handleOverwriteInput} // 추천 프롬프트를 누르면 덮어쓰기 함수 실행
      />
      <main className="chat-area">
        <ChatWindow messages={messages} />
        <PromptInput 
          onSend={handleSendMessage} 
          onOverwriteInput={handleOverwriteInput} 
        />
      </main>
    </div>
  );
}