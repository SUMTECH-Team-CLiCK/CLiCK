import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import '../App.css';

// React 앱을 삽입할 최상위 host 요소를 페이지에 만듭니다.
const host = document.createElement('div');
host.id = 'click-react-root';
document.body.appendChild(host);

// Shadow DOM을 생성하여 ChatGPT의 원래 스타일과 우리 앱의 스타일이 충돌하는 것을 방지합니다.
const shadowRoot = host.attachShadow({ mode: 'open' });

// Shadow DOM 내부에 React 앱을 렌더링할 컨테이너를 만듭니다.
const appContainer = document.createElement('div');
shadowRoot.appendChild(appContainer);

// ❗️ App.css 스타일을 Shadow DOM 안에 직접 주입합니다.
//    이 과정을 생략하면 앱에 스타일이 적용되지 않습니다.
const styleEl = document.createElement('style');
const styleSheet = new CSSStyleSheet();

// Vite가 App.css 내용을 가져올 수 있도록 동적으로 import 합니다.
import('../App.css?inline').then(cssModule => {
  styleEl.textContent = cssModule.default;
  shadowRoot.appendChild(styleEl);
});


// 격리된 컨테이너에 React 앱을 렌더링합니다.
const root = ReactDOM.createRoot(appContainer);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);