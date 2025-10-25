import React from 'react';

export default function Sidebar() {
    const customPrompts = [
        { id: 1, title: '백종원 나락 분석', content: '백종원의 최근 발언에 대한 여론 분석을 긍정, 부정, 중립으로 나누어 정리해줘.' },
        { id: 2, title: '데이터 구조 복습 프롬프트', content: '스택과 큐의 차이점을 초등학생도 이해할 수 있도록 비유를 들어 설명해줘.' },
    ];
    const applyPrompt = (content) => {
        const textarea = document.querySelector('#prompt-textarea');
        if (textarea) {
            textarea.value = content;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
        }
        isPanelVisible = true;
    };
    return (
        <aside className="click-sidebar-container">
            <h3>추천 프롬프트</h3>
            <ul>
                {customPrompts.map(p => (
                    <li key={p.id} onClick={() => applyPrompt(p.content)}>
                        {p.title}
                    </li>
                ))}
            </ul>
        </aside>
    );
}