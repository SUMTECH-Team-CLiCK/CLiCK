import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// public/index.html 파일의 <div id="root"></div>를 선택합니다.
const root = ReactDOM.createRoot(document.getElementById("root"));

// 선택된 곳에 App 컴포넌트를 렌더링(표시)합니다.
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
