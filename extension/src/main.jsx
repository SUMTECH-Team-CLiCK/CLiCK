import React from 'react';
import ReactDOM from 'react-dom/client';

import Sidebar from './components/Sidebar';
import PromptInput from './components/PromptInput';
import './App.css'; 

// ★★★
// 이 파일은 빌드 후 content.js가 되어 ChatGPT 페이지에 직접 주입됩니다.
// 따라서 이 파일 자체가 콘텐츠 스크립트의 역할을 수행합니다.
// ★★★

function injectSidebar() {
    const targetNav = document.querySelector('nav');
    if (targetNav && !document.querySelector('#click-sidebar-root')) {
        const sidebarRoot = document.createElement('div');
        sidebarRoot.id = 'click-sidebar-root';
        targetNav.prepend(sidebarRoot);

        const root = ReactDOM.createRoot(sidebarRoot);
        root.render(
            <React.StrictMode>
                <Sidebar />
            </React.StrictMode>
        );
        return true;
    }
    return false;
}

function injectPromptTools() {
    const targetForm = document.querySelector('form');
    if (targetForm && !document.querySelector('#click-prompt-tools-root')) {
        const promptToolsRoot = document.createElement('div');
        promptToolsRoot.id = 'click-prompt-tools-root';
        // 폼의 부모요소에, 폼 바로 앞에 삽입하여 입력창 위에 위치시킴
        targetForm.parentNode.insertBefore(promptToolsRoot, targetForm);

        const root = ReactDOM.createRoot(promptToolsRoot);
        root.render(
            <React.StrictMode>
                <PromptInput />
            </React.StrictMode>
        );
        return true;
    }
    return false;
}

// 폼/버튼이 사라졌을 때 자동 복구를 위한 폴백 인터벌
let clickUiInterval = null;
function ensureUiInjected() {
    injectSidebar();
    injectPromptTools();
}

// MutationObserver를 사용하여 ChatGPT의 동적 UI 로딩에 대응
const observer = new MutationObserver((mutations, obs) => {
    injectSidebar();
    injectPromptTools();
    // 폼/버튼이 모두 있으면 폴백 인터벌 시작(계속 감시)
    if (!clickUiInterval) {
        clickUiInterval = setInterval(ensureUiInjected, 300);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});