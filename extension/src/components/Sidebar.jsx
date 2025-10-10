import React from 'react';

export default function Sidebar({ chats, onToggleFavorite, onApplyPrompt }) {
  const favorited = chats.filter(c => c.isFavorited);
  const normal = chats.filter(c => !c.isFavorited);

  const customPrompts = [
    { id: 1, title: '백종원 나락 분석', content: '백종원의 최근 발언에 대한 여론 분석을 해줘.' },
    { id: 2, title: '데이터 구조 복습 프롬프트', content: '스택과 큐의 차이점을 학생에게 설명하듯 정리해줘.' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>추천 프롬프트</h3>
        <ul>
          {customPrompts.map(p => (
            <li key={p.id} onClick={() => onApplyPrompt(p.content)} style={{ cursor: 'pointer' }}>
              {p.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h3>⭐ 즐겨찾기</h3>
        <ul>
          {favorited.map(c => (
            <li key={c.id}>
              {c.title} <button onClick={() => onToggleFavorite(c.id)}>⭐</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h3>전체 채팅</h3>
        <ul>
          {normal.map(c => (
            <li key={c.id}>
              {c.title} <button onClick={() => onToggleFavorite(c.id)}>☆</button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

