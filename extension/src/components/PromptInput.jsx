import React, { useState, useEffect } from 'react';
import PromptAnalysis from './PromptAnalysis';
import Sidebar from './Sidebar';

function getTextareaValue(textarea) {
    if (!textarea) return '';
    return textarea.value || textarea.textContent || textarea.innerText || '';
}

export default function PromptInput() {
    const [isPanelVisible, setPanelVisible] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [textarea, setTextarea] = useState(null);
    const [liveText, setLiveText] = useState('');
    const [panelSize, setPanelSize] = useState({});

    // textarea를 찾고, 패널이 열려 있으면 실시간 값 반영
    useEffect(() => {
        const interval = setInterval(() => {
            const ta = document.querySelector('#prompt-textarea');
            if (ta) {
                setTextarea(ta);
                if (isPanelVisible) setLiveText(getTextareaValue(ta));
                setPanelSize({
                    width: ta.offsetWidth ? ta.offsetWidth + 'px' : undefined,
                    minHeight: ta.offsetHeight ? ta.offsetHeight + 'px' : undefined,
                });
                clearInterval(interval);
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // 패널이 열려 있으면 입력값을 실시간 반영 (이벤트+폴링)
    useEffect(() => {
        if (!isPanelVisible || !textarea) return;
        let prev = getTextareaValue(textarea);
        const handler = () => {
            const val = getTextareaValue(textarea);
            setLiveText(val);
            prev = val;
        };
        const events = ['input', 'change', 'keyup', 'paste', 'cut', 'compositionend', 'blur'];
        events.forEach(ev => textarea.addEventListener(ev, handler));
        handler();
        // 폴링 백업(100ms)
        const poll = setInterval(() => {
            const val = getTextareaValue(textarea);
            if (val !== prev) {
                setLiveText(val);
                prev = val;
            }
        }, 100);
        return () => {
            events.forEach(ev => textarea.removeEventListener(ev, handler));
            clearInterval(poll);
        };
    }, [isPanelVisible, textarea]);

    // 패널 크기/높이 입력창과 동기화
    useEffect(() => {
        if (!isPanelVisible || !textarea) return;
        function syncPanelSize() {
            const taRect = textarea.getBoundingClientRect();
            setPanelSize({
                width: taRect.width ? taRect.width + 'px' : undefined,
                minHeight: taRect.height ? taRect.height + 'px' : undefined,
            });
        }
        syncPanelSize();
        window.addEventListener('resize', syncPanelSize);
        return () => window.removeEventListener('resize', syncPanelSize);
    }, [isPanelVisible, textarea]);

    // 분석하기 버튼 클릭 시
    const handleAnalyze = async () => {
        if (!textarea || !getTextareaValue(textarea).trim()) return;
        setLoading(true);
        try {
            // 실제 백엔드 연동 시 아래 주석 해제
            // const response = await chrome.runtime.sendMessage({
            //     type: 'ANALYZE_PROMPT',
            //     prompt: getTextareaValue(textarea)
            // });
            // if (response.error) throw new Error(response.error);
            const response = { tags: [], patches: {}, full_suggestion: getTextareaValue(textarea) };
            setAnalysis({ source: getTextareaValue(textarea), result: response });
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
                <div style={{ position: 'relative', zIndex: 100, width: '100%' }}>
                    <PromptAnalysis
                        source={liveText}
                        result={analysis ? analysis.result : { tags: [], patches: {}, full_suggestion: liveText }}
                        onClose={() => setPanelVisible(false)}
                        onApplyAll={handleApplyAll}
                        panelStyle={panelSize}
                    />
                    <button
                        className="click-analyze-panel-btn"
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