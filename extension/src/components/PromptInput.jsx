import React, { useState, useEffect, useRef } from 'react';
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
    const [btnPos, setBtnPos] = useState(null);
    const rafRef = useRef(null);

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

    // 버튼 위치 동기화 (textarea 기준)
    useEffect(() => {
        if (!textarea) return;
        function updatePos() {
            const r = textarea.getBoundingClientRect();
            const btnW = 36;
            const gap = 8;
            const left = Math.round(r.right - btnW - gap);
            const top = Math.round(r.top + (r.height - btnW) / 2);
            setBtnPos({ left, top, width: btnW, height: btnW });
        }
        updatePos();
        window.addEventListener('resize', updatePos);
        window.addEventListener('scroll', updatePos, true);
        // 문서 변경으로 위치가 바뀌는 경우 RAF로 계속 동기화(짧은 시간)
        let ticking = false;
        const tick = () => {
            if (!ticking) {
                ticking = true;
                rafRef.current = requestAnimationFrame(() => { updatePos(); ticking = false; });
            }
        };
        const mo = new MutationObserver(tick);
        mo.observe(document.body, { subtree: true, childList: true, attributes: true });
        return () => {
            window.removeEventListener('resize', updatePos);
            window.removeEventListener('scroll', updatePos, true);
            mo.disconnect();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [textarea]);

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
                left: taRect.left + 'px',
                topAbove: Math.max(8, taRect.top - 240) + 'px',
            });
        }
        syncPanelSize();
        window.addEventListener('resize', syncPanelSize);
        window.addEventListener('scroll', syncPanelSize, true);
        return () => window.removeEventListener('resize', syncPanelSize);
    }, [isPanelVisible, textarea]);

    // 분석하기 버튼 클릭 시 (패널 열림)
    const handleTogglePanel = () => {
        if (!textarea) return;
        const val = getTextareaValue(textarea);
        if (!val.trim()) return;
        setLiveText(val);
        setPanelVisible(v => !v);
    };

    // 실제 분석 호출(간이)
    const handleAnalyze = async () => {
        if (!textarea || !getTextareaValue(textarea).trim()) return;
        setLoading(true);
        try {
            const response = { tags: [], patches: {}, full_suggestion: getTextareaValue(textarea) };
            setAnalysis({ source: getTextareaValue(textarea), result: response });
            setPanelVisible(true);
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
        <>
            {/* 버튼은 textarea 위에 fixed로 오버레이 */}
            {btnPos && (
                <button
                    className="click-analyze-button"
                    title="프롬프트 분석"
                    onClick={handleTogglePanel}
                    style={{
                        position: 'fixed',
                        left: btnPos.left + 'px',
                        top: btnPos.top + 'px',
                        width: btnPos.width + 'px',
                        height: btnPos.height + 'px',
                        padding: 0,
                        borderRadius: '6px',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    ⌘
                </button>
            )}

            {/* 패널: 버튼 클릭 시 body에 overlay div처럼 렌더링 (id 있음) */}
            {isPanelVisible && (
                <div
                    id="click-prompt-tools-root"
                    style={{
                        position: 'fixed',
                        left: panelSize.left || (btnPos ? btnPos.left + 'px' : '8px'),
                        top: panelSize.topAbove || (btnPos ? (btnPos.top - 220) + 'px' : '8px'),
                        width: panelSize.width || (btnPos ? (btnPos.width * 10) + 'px' : '480px'),
                        minHeight: panelSize.minHeight || '120px',
                        zIndex: 9998,
                        background: 'var(--composer-input-bg, var(--token-main-surface-primary, #fff))',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                    }}
                >
                    <PromptAnalysis
                        source={analysis ? analysis.source : liveText}
                        result={analysis ? analysis.result : { tags: [], patches: {}, full_suggestion: liveText }}
                        onClose={() => setPanelVisible(false)}
                        onApplyAll={handleApplyAll}
                    />
                    <button
                        className="click-analyze-panel-btn"
                        style={{ position: 'absolute', top: 12, right: 12, zIndex: 10001 }}
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading ? '분석중...' : '분석하기'}
                    </button>
                </div>
            )}
        </>
    );
}