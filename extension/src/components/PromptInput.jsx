import React, { useState, useEffect } from 'react';
import PromptAnalysis from './PromptAnalysis';

export default function PromptInput() {
    const [isPanelVisible, setPanelVisible] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [textarea, setTextarea] = useState(null);
    const [liveText, setLiveText] = useState('');

    // textarea를 찾고, 패널이 열려 있으면 실시간 값 반영
    useEffect(() => {
        const interval = setInterval(() => {
            const ta = document.querySelector('#prompt-textarea');
            if (ta) {
                setTextarea(ta);
                if (isPanelVisible) setLiveText(ta.value || ta.textContent || '');
                clearInterval(interval);
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // 패널이 열려 있으면 입력값을 실시간 반영
    useEffect(() => {
        if (!isPanelVisible || !textarea) return;
        const handler = () => setLiveText(textarea.value || textarea.textContent || '');
        textarea.addEventListener('input', handler);
        handler(); // 최초 1회
        return () => textarea.removeEventListener('input', handler);
    }, [isPanelVisible, textarea]);

    // 분석하기 버튼 클릭 시
    const handleAnalyze = async () => {
        if (!textarea || !(textarea.value || textarea.textContent || '').trim()) return;
        setLoading(true);
        try {
            // 실제 백엔드 연동 시 아래 주석 해제
            // const response = await chrome.runtime.sendMessage({
            //     type: 'ANALYZE_PROMPT',
            //     prompt: textarea.value
            // });
            // if (response.error) throw new Error(response.error);
            // 임시: 입력값 그대로 결과로 사용
            const response = { tags: [], patches: {}, full_suggestion: textarea.value || textarea.textContent || '' };
            setAnalysis({ source: textarea.value || textarea.textContent || '', result: response });
        } catch (err) {
            console.error('분석 실패:', err);
            alert('분석에 실패했습니다. 백엔드 서버를 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyAll = (text) => {
        if (textarea) {
            textarea.value = text;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setPanelVisible(false);
    };

    return (
        <div className="click-prompt-tools-container">
            {/* 분석 패널 열기/닫기 버튼 (⌘) */}
            <button
                className="click-analyze-button"
                title="프롬프트 분석"
                onClick={() => setPanelVisible(v => !v)}
                style={{ marginRight: 8 }}
            >
                ⌘
            </button>
            {/* 분석 패널 */}
            {isPanelVisible && (
                <div style={{ position: 'relative', zIndex: 100 }}>
                    <PromptAnalysis
                        source={liveText}
                        result={analysis ? analysis.result : { tags: [], patches: {}, full_suggestion: liveText }}
                        onClose={() => setPanelVisible(false)}
                        onApplyAll={handleApplyAll}
                    />
                    <button
                        className="click-analyze-panel-btn"
                        style={{ position: 'absolute', top: 12, right: 60, zIndex: 101 }}
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading ? '분석중...' : '분석하기'}
                    </button>
                </div>
            )}
        </div>
    );
}