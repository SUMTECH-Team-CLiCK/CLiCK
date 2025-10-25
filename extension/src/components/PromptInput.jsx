import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
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

    // 패널을 DOM의 별도 위치에 렌더링하기 위한 로직
    const renderPanel = () => {
        const panelRoot = document.getElementById('click-prompt-tools-container');
        if (!panelRoot) return null;

        return ReactDOM.createPortal(
            <div className="click-prompt-tools-container">
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
                    {/* <button
                        className="click-analyze-panel-btn"
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading ? '분석중...' : '분석하기'}
                    </button> */}
                </div>
                )}
            </div>,
            panelRoot
        );
    };

    // textarea를 찾고, 패널이 열려 있으면 실시간 값 반영
    useEffect(() => {
        const interval = setInterval(() => {
            const ta = document.querySelector('#prompt-textarea');
            if (ta) {
                setTextarea(ta);
                if (isPanelVisible) setLiveText(getTextareaValue(ta));
                setPanelSize({
                    width: '100%',
                    minHeight: ta.offsetHeight ? ta.offsetHeight + 'px' : undefined,
                });
                clearInterval(interval);
            }
        }, 100);
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
                width: '100%',
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
        <>
            {/* 분석 패널 열기 버튼 (이제 마이크 옆에 표시됨) */}
            <button
                type="button"
                className="click-analyze-button"
                title="프롬프트 분석"
                onClick={() => setPanelVisible(v => !v)}
            >
                <h3>
                    <svg xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 5300 5300"
                        fill="currentColor">
                    <g transform="translate(0,5300) scale(0.1,-0.1)">
                        <path d="M39665 52989 c-852 -63 -1591 -329 -2269 -813 -406 -291 -748 -595
                            -1511 -1343 -258 -253 -8359 -8351 -18001 -17995 -11256 -11257 -17549 -17558
                            -17581 -17603 -140 -193 -224 -382 -280 -627 -16 -68 -17 -530 -20 -6638 -3
                            -5869 -2 -6576 12 -6671 29 -201 85 -370 177 -532 218 -384 571 -641 1017
                            -740 l96 -21 6560 -3 c5882 -3 6571 -2 6667 12 266 39 473 123 701 284 75 54
                            35820 35795 36114 36111 636 684 958 1112 1203 1600 219 436 361 937 427 1505
                            24 212 24 749 0 960 -121 1034 -449 1753 -1202 2630 -379 441 -657 723 -4452
                            4516 -3354 3352 -3675 3669 -4008 3969 -872 784 -1515 1139 -2379 1315 -410
                            83 -873 114 -1271 84z m620 -3014 c252 -45 384 -104 618 -278 410 -305 546
                            -438 4762 -4658 3339 -3343 3531 -3537 3831 -3884 391 -452 498 -702 499
                            -1160 0 -189 -9 -261 -52 -430 -72 -283 -267 -553 -833 -1155 -106 -113 -2200
                            -2212 -4652 -4665 l-4458 -4460 -5355 5355 -5355 5355 4542 4541 c2499 2497
                            4613 4605 4698 4684 378 350 639 554 825 648 106 53 283 101 452 122 98 13
                            373 4 478 -15z m-14490 -34895 l-12080 -12080 -5357 0 -5358 0 0 5352 0 5353
                            12082 12082 12083 12083 5355 -5355 5355 -5355 -12080 -12080z"/>
                    </g>
                    </svg>
                </h3>
            </button>
            
            {/* isPanelVisible이 true일 때만 Portal을 통해 패널을 렌더링 */}
            {isPanelVisible && renderPanel()}
        </>
    );
}