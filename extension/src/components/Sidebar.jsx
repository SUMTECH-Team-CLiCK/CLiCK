import React from 'react';

export default function Sidebar() {
    const customPrompts = [
        { id: 1, title: '백종원 나락 분석', content: '백종원의 최근 발언에 대한 여론 분석을 긍정, 부정, 중립으로 나누어 정리해줘.' },
        { id: 2, title: '데이터 구조 복습 프롬프트', content: '스택과 큐의 차이점을 초등학생도 이해할 수 있도록 비유를 들어 설명해줘.' },
    ];
    const applyPrompt = (content) => {
        const textarea = document.querySelector('#prompt-textarea');
        if (textarea) {
            textarea.innerText = content;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
        }
        isPanelVisible = true;
    };
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

        {customPrompts.map(p => (
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