chrome.runtime.onInstalled.addListener(() => {
    console.log("CLICK extension installed.");
});

// 콘텐츠 스크립트로부터 메시지를 받기 위한 리스너 추가
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 메시지 타입이 'ANALYZE_PROMPT'일 때만 작동
    if (message.type === "ANALYZE_PROMPT") {
        // 비동기 응답을 위해 true를 반환해야 합니다.
        (async () => {
            try {
                const response = await fetch(
                    "http://localhost:3001/api/analyze-prompt",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ prompt: message.prompt }),
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Server responded with status: ${response.status}`
                    );
                }

                const data = await response.json();
                sendResponse(data); // 성공 시 분석 결과를 응답으로 보냄
            } catch (error) {
                console.error("API 요청 실패:", error);
                sendResponse({ error: error.message }); // 실패 시 에러 메시지를 응답으로 보냄
            }
        })();

        return true; // 비동기 sendResponse를 사용하려면 반드시 true를 반환
    }
});
