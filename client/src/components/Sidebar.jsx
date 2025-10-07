import React from 'react';

const Sidebar = ({ chats, onToggleFavorite }) => {
  const favoritedChats = chats.filter(c => c.isFavorited);
  const regularChats = chats.filter(c => !c.isFavorited);
  
  // 맞춤 프롬프트 (정적 데이터 예시)
  const customPrompts = ['백종원 나락 분석', '강의의 아동 눈높 분석', '화학/NMR 전공'];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>사용자 맞춤 추천 프롬프트</h3>
        <ul>
          {customPrompts.map(prompt => <li key={prompt} className="chat-item">{prompt}</li>)}
        </ul>
      </div>
      <div className="sidebar-section">
        <h3>⭐ 즐겨찾기</h3>
        <ul>
          {favoritedChats.map(chat => (
            <li key={chat.id} className="chat-item favorited">
              {chat.title}
              <button onClick={() => onToggleFavorite(chat.id)}>⭐</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="sidebar-section">
        <h3>채팅 목록</h3>
        <ul>
          {regularChats.map(chat => (
             <li key={chat.id} className="chat-item">
              {chat.title}
              <button onClick={() => onToggleFavorite(chat.id)}>☆</button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
