// src/main.jsx (개선된 버전)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import css from './App.css?inline'; // Vite에서 CSS를 텍스트로 가져오는 문법

// 1. UI를 삽입할 최상위 host 요소를 생성합니다.
const host = document.createElement('div');
host.id = "click-react-root";
document.body.appendChild(host);

// 2. Shadow DOM을 생성하여 외부 CSS로부터 앱을 격리합니다.
const shadowRoot = host.attachShadow({ mode: 'open' });

// 3. Shadow DOM 내부에 React 앱을 렌더링할 컨테이너를 만듭니다.
const appContainer = document.createElement('div');
shadowRoot.appendChild(appContainer);

// 4. Shadow DOM 내부에 스타일을 직접 주입합니다.
const styleEl = document.createElement('style');
styleEl.textContent = css;
shadowRoot.appendChild(styleEl);

// 5. 격리된 컨테이너에 React 앱을 렌더링합니다.
const root = ReactDOM.createRoot(appContainer);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);