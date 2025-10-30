import React, { useState } from 'react';

export default function Sidebar() {

    const [customPrompts, setCustomPrompts] = useState([]);  // 필요한 경우 여기에 기본값 추가 가능
    // 추천 프롬프트 목록
    const [recommendedPrompts] = useState([
        { 
            id: 1, 
            title: 'A/B 테스트 분석', 
            content: '제품의 A/B 테스트 결과를 분석하여 다음 세 가지 관점에서 인사이트를 도출해줘: 1) 사용자 행동 변화 2) 전환율 영향 3) 통계적 유의성',
            tag: '구조/길이 중복'
        },
        { 
            id: 2, 
            title: '코드 리팩토링 제안', 
            content: '이 코드의 가독성과 유지보수성을 높이기 위한 리팩토링 방안을 SOLID 원칙에 따라 제시해줘. 각 제안에는 변경 이유와 기대 효과를 포함해줘.',
            tag: '모호/지시 불명확'
        }
    ]);

    // customPrompts와 recommendedPrompts를 합침
    const allPrompts = [...customPrompts, ...recommendedPrompts];

    // prompt를 textarea에 적용하는 함수
    const applyPrompt = (content) => {
        const textarea = document.querySelector('#prompt-textarea');
        if (textarea) {
            textarea.innerText = content;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
        }
    };

    // 기존 JSX 반환 부분에서 map 함수만 수정
    return (
        <>
            <div tabindex="0" data-fill class="group __menu-item hoverable" aria-expanded="true" aria-label="섹션 접기" data-no-hover-bg="true" data-no-contents-gap="true">
                <div class="text-token-text-tertiary flex w-full items-center justify-start gap-0.5">
                    <h2 class="__menu-label" data-no-spacing="true"> prompt </h2>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="hidden h-3 w-3 group-hover/sidebar-expando-section:block">
                        <path d="M12.1338 5.94433C12.3919 5.77382 12.7434 5.80202 12.9707 6.02929C13.1979 6.25656 13.2261 6.60807 13.0556 6.8662L12.9707 6.9707L8.47067 11.4707C8.21097 11.7304 7.78896 11.7304 7.52926 11.4707L3.02926 6.9707L2.9443 6.8662C2.77379 6.60807 2.80199 6.25656 3.02926 6.02929C3.25653 5.80202 3.60804 5.77382 3.86617 5.94433L3.97067 6.02929L7.99996 10.0586L12.0293 6.02929L12.1338 5.94433Z"></path>
                    </svg>
                </div>
            </div>

            {allPrompts.map(p => (
                <a tabindex="0" data-fill class="group __menu-item hoverable" draggable="true" data-discover="true" key={p.id} onClick={() => applyPrompt(p.content)}>
                    <div class="flex min-w-0 grow items-center gap-2.5 group-data-no-contents-gap:gap-0">
                        <div class="truncate">
                            <span class dir="auto">
                                {p.title}
                            </span>
                        </div>
                    </div>

                    <div class="trailing-pair">
                        <div class="trailing highlight text-token-text-tertiary">
                            <button tabindex="0" data-trailing-button class="__menu-item-trailing-btn" data-testid="history-item-0-options" aria-label="대화 옵션 열기" type="button" id="radix-_r_g3_" aria-haspopup="menu" aria-expanded="false" data-state="closed" title="Unpin">
                                <div>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon" aria-hidden="true">
                                        <path d="M15.498 8.50159C16.3254 8.50159 16.9959 9.17228 16.9961 9.99963C16.9961 10.8271 16.3256 11.4987 15.498 11.4987C14.6705 11.4987 14 10.8271 14 9.99963C14.0002 9.17228 14.6706 8.50159 15.498 8.50159Z"></path>
                                        <path d="M4.49805 8.50159C5.32544 8.50159 5.99689 9.17228 5.99707 9.99963C5.99707 10.8271 5.32555 11.4987 4.49805 11.4987C3.67069 11.4985 3 10.827 3 9.99963C3.00018 9.17239 3.6708 8.50176 4.49805 8.50159Z"></path>
                                        <path d="M10.0003 8.50159C10.8276 8.50176 11.4982 9.17239 11.4984 9.99963C11.4984 10.827 10.8277 11.4985 10.0003 11.4987C9.17283 11.4987 8.50131 10.8271 8.50131 9.99963C8.50149 9.17228 9.17294 8.50159 10.0003 8.50159Z"></path>
                                    </svg>
                                </div>
                            </button>
                        </div>
                        <div class="trailing text-token-text-tertiary" tabindex="-1"></div>
                    </div>
                </a>
            ))}
        </>
    );
}