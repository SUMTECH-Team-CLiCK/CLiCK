import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// --- 헬퍼 함수 및 마운트 관리 ---
function createAndMount(rootEl, reactElement, cleanupFn) {
    const root = createRoot(rootEl);
    root.render(reactElement);
    rootEl.__clickRoot = root;
    const mo = new MutationObserver(() => {
        if (!document.body.contains(rootEl)) {
            try { if (typeof cleanupFn === 'function') cleanupFn(); } catch (e) {}
            try { root.unmount(); } catch (e) {}
            mo.disconnect();
        }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    rootEl.__clickCleanupMO = mo;
}

function _safeQuerySelector(selectors) {
    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el;
    }
    return null;
}

let _promptToolsPositionHandler = null;
let _recommendedPositionHandler = null;

function _positionRelativeToTextarea(rootEl, textarea, parentEl, preferLeft) {
    if (!rootEl || !textarea) return;
    const ta = textarea.getBoundingClientRect();
    const parentRect = parentEl ? parentEl.getBoundingClientRect() : { left: 0, top: 0 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rootW = rootEl.offsetWidth || 300;
    const gap = 8;
    let left = ta.right - parentRect.left + gap;
    let top = ta.top - parentRect.top;
    if (ta.right + gap + rootW > vw) {
        left = ta.left - parentRect.left - rootW - gap;
    }
    if (preferLeft) {
        const spaceLeft = ta.left;
        if (spaceLeft > rootW + gap) {
            left = ta.left - parentRect.left - rootW - gap;
        }
    }
    const maxTop = (parentEl ? parentRect.height : vh) - 40;
    if (top < 8) top = 8;
    if (top > maxTop) top = Math.max(8, maxTop - 20);
    if (parentEl && getComputedStyle(parentEl).position !== 'static') {
        rootEl.style.position = 'absolute';
        rootEl.style.left = `${Math.round(left)}px`;
        rootEl.style.top = `${Math.round(top)}px`;
    } else {
        rootEl.style.position = 'fixed';
        let fixedLeft = ta.right + gap;
        if (fixedLeft + rootW > vw) fixedLeft = Math.max(gap, ta.left - rootW - gap);
        let fixedTop = ta.top;
        if (fixedTop + 40 > vh) fixedTop = Math.max(gap, vh - 200);
        rootEl.style.left = `${Math.round(fixedLeft)}px`;
        rootEl.style.top = `${Math.round(fixedTop)}px`;
    }
}

function positionRecommendedAndWatch(rootDiv, textarea, parentEl, preferLeft) {
    if (_recommendedPositionHandler) {
        window.removeEventListener('resize', _recommendedPositionHandler);
        window.removeEventListener('scroll', _recommendedPositionHandler, true);
    }
    const handler = () => _positionRelativeToTextarea(rootDiv, textarea, parentEl, preferLeft);
    _recommendedPositionHandler = handler;
    handler();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
}

function positionPromptAndWatch(rootEl, textarea, parentEl) {
    if (_promptToolsPositionHandler) {
        window.removeEventListener('resize', _promptToolsPositionHandler);
        window.removeEventListener('scroll', _promptToolsPositionHandler, true);
    }
    const handler = () => {
        if (!textarea) return;
        const ta = textarea.getBoundingClientRect();
        const parentRect = parentEl ? parentEl.getBoundingClientRect() : { left: 0, top: 0 };
        const rootW = rootEl.offsetWidth || 48;
        const gap = 8;
        if (parentEl && getComputedStyle(parentEl).position !== 'static') {
            rootEl.style.position = 'absolute';
            let left = ta.right - parentRect.left + gap;
            if (ta.right + gap + rootW > window.innerWidth) left = ta.left - parentRect.left - rootW - gap;
            let top = ta.top - parentRect.top + (ta.height - rootEl.offsetHeight) / 2;
            if (top < 4) top = 4;
            rootEl.style.left = `${Math.round(left)}px`;
            rootEl.style.top = `${Math.round(top)}px`;
        } else {
            rootEl.style.position = 'fixed';
            let left = ta.right + gap;
            if (left + rootW > window.innerWidth) left = Math.max(gap, ta.left - rootW - gap);
            let top = ta.top + (ta.height - rootEl.offsetHeight) / 2;
            if (top + rootEl.offsetHeight > window.innerHeight) top = Math.max(8, window.innerHeight - rootEl.offsetHeight - 8);
            rootEl.style.left = `${Math.round(left)}px`;
            rootEl.style.top = `${Math.round(top)}px`;
        }
    };
    _promptToolsPositionHandler = handler;
    handler();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
}

// --- UI 컴포넌트 ---
function RecommendedPrompts() {
    const prompts = [
        { id: 1, title: '백종원 나락 분석', content: '백종원의 최근 발언에 대한 여론 분석을 긍정, 부정, 중립으로 나누어 정리해줘.' },
        { id: 2, title: '데이터 구조 복습 프롬프트', content: '스택과 큐의 차이점을 초등학생도 이해할 수 있도록 비유를 들어 설명해줘.' },
    ];
    const handlePromptClick = (content) => {
        const textarea = document.querySelector('#prompt-textarea');
        if (textarea) {
            textarea.value = content;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
        }
    };
    return (
        <aside className="click-sidebar-container">
            <h3>추천 프롬프트</h3>
            <ul>
                {prompts.map((prompt) => (
                    <li key={prompt.id} onClick={() => handlePromptClick(prompt.content)}>
                        {prompt.title}
                    </li>
                ))}
            </ul>
        </aside>
    );
}

function AnalysisPanel({ source, result, onClose, onApplyAll }) {
    const [activeTags, setActiveTags] = useState(() => result.tags || []);
    const handleTagClick = (tag) => {
        setActiveTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    };
    const suggestion = useMemo(() => {
        let modifiedText = source;
        if (!result.patches) return source;
        (result.tags || []).forEach(tag => {
            if (activeTags.includes(tag)) {
                (result.patches[tag] || []).forEach((patch) => {
                    modifiedText = modifiedText.replace(patch.from, patch.to);
                });
            }
        });
        return modifiedText;
    }, [activeTags, source, result]);
    const renderOriginalWithHighlights = () => {
        if (!result.patches) return <p>{source}</p>;
        let parts = [{ text: source, tag: null }];
        (result.tags || []).forEach(tag => {
            const tagPatches = result.patches[tag] || [];
            let newParts = [];
            parts.forEach(part => {
                if (part.tag) { newParts.push(part); return; }
                let currentText = part.text;
                let lastIndex = 0;
                tagPatches.forEach(patch => {
                    const fromIndex = currentText.indexOf(patch.from, lastIndex);
                    if (fromIndex !== -1) {
                        if (fromIndex > lastIndex) newParts.push({ text: currentText.substring(lastIndex, fromIndex), tag: null });
                        newParts.push({ text: patch.from, tag: tag });
                        lastIndex = fromIndex + patch.from.length;
                    }
                });
                if (lastIndex < currentText.length) newParts.push({ text: currentText.substring(lastIndex), tag: null });
            });
            parts = newParts;
        });
        return (
            <p>
                {parts.map((part, index) => (
                    <span key={index} className={part.tag ? `highlight ${part.tag.replace(/[\s/]/g, '-')}` : ''}>{part.text}</span>
                ))}
            </p>
        );
    };
    return (
        <div className="click-analysis-panel">
            <div className="panel-header">
                <h3>GPT Prompt Analysis</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="panel-body">{renderOriginalWithHighlights()}</div>
            <div className="panel-footer">
                <div className="tag-bar">
                    {(result.tags || []).map((tag) => (
                        <button key={tag} className={`tag ${activeTags.includes(tag) ? 'active' : ''} ${tag.replace(/[\s/]/g, '-')}`} onClick={() => handleTagClick(tag)}>{tag}</button>
                    ))}
                </div>
                <button className="apply-all-btn" onClick={() => onApplyAll(suggestion)}>전체 수정</button>
            </div>
        </div>
    );
}

function PromptAnalysis() {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleAnalyze = async () => {
        const textarea = document.querySelector('#prompt-textarea');
        if (!textarea || !textarea.value.trim()) return;
        setIsLoading(true);
        try {
            // 백엔드 연동 시 아래 주석 해제
            // const response = await chrome.runtime.sendMessage({ type: 'ANALYZE_PROMPT', prompt: textarea.value });
            // if (response.error) throw new Error(response.error);
            // 현재는 입력 텍스트만 결과로 사용
            const response = { tags: [], patches: {}, full_suggestion: textarea.value };
            setAnalysisResult({ source: textarea.value, result: response });
            setIsPanelOpen(true);
        } catch (error) {
            console.error('분석 실패:', error);
            alert('분석에 실패했습니다. 백엔드 서버를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };
    const handleApplySuggestion = (suggestion) => {
        const textarea = document.querySelector('#prompt-textarea');
        if (textarea) {
            textarea.value = suggestion;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setIsPanelOpen(false);
    };
    return (
        <div className="click-prompt-tools-container">
            {isPanelOpen && analysisResult && (
                <AnalysisPanel source={analysisResult.source} result={analysisResult.result} onClose={() => setIsPanelOpen(false)} onApplyAll={handleApplySuggestion} />
            )}
            <button className="click-analyze-button" title="프롬프트 분석" onClick={handleAnalyze} disabled={isLoading}>
                {isLoading ? '분석중...' : '⌘'}
            </button>
        </div>
    );
}

// --- DOM 삽입 및 위치 관리 ---
function injectRecommendedPrompts() {
    const sidebarSelectors = ['nav', '[role="navigation"]', '#sidebar', '.sidebar', '.left-rail', '.side-rail', '.column-left', '[data-sidebar]'];
    const sidebar = _safeQuerySelector(sidebarSelectors);
    if (document.querySelector('#click-recommended-prompts-root')) return false;
    const rootDiv = document.createElement('div');
    rootDiv.id = 'click-recommended-prompts-root';
    rootDiv.style.pointerEvents = 'auto';
    rootDiv.style.maxHeight = '60vh';
    rootDiv.style.overflow = 'auto';
    rootDiv.style.background = 'var(--bg, rgba(30,30,30,0.95))';
    rootDiv.style.color = 'var(--fg, #fff)';
    rootDiv.style.padding = '8px';
    rootDiv.style.borderRadius = '8px';
    if (sidebar) {
        const sectionHeaders = Array.from(sidebar.querySelectorAll('h3, h4, h2'));
        const gptSection = sectionHeaders.find(el => typeof el.textContent === 'string' && el.textContent.trim().toLowerCase().includes('gpt'));
        const chatSection = sectionHeaders.find(el => typeof el.textContent === 'string' && el.textContent.trim().includes('채팅'));
        if (chatSection && chatSection.parentElement) {
            const insertTarget = chatSection.parentElement;
            insertTarget.parentElement && insertTarget.parentElement.insertBefore(rootDiv, insertTarget);
        } else if (gptSection && gptSection.parentElement) {
            const parentEl = gptSection.parentElement;
            if (parentEl.parentElement) {
                const next = parentEl.nextSibling;
                if (next) parentEl.parentElement.insertBefore(rootDiv, next);
                else parentEl.parentElement.appendChild(rootDiv);
            } else {
                sidebar.appendChild(rootDiv);
            }
        } else {
            sidebar.appendChild(rootDiv);
        }
        createAndMount(rootDiv, <React.StrictMode><RecommendedPrompts /></React.StrictMode>);
    } else {
        const form = document.querySelector('form');
        const textarea = document.querySelector('#prompt-textarea');
        let attachedToParent = false;
        if (form && form.parentElement) {
            const parent = form.parentElement;
            if (getComputedStyle(parent).position !== 'static') {
                parent.appendChild(rootDiv);
                rootDiv.style.width = '300px';
                rootDiv.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
                positionRecommendedAndWatch(rootDiv, textarea, parent, true);
                attachedToParent = true;
            }
        }
        if (!attachedToParent) {
            document.body.appendChild(rootDiv);
            rootDiv.style.width = '300px';
            rootDiv.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
            positionRecommendedAndWatch(rootDiv, document.querySelector('#prompt-textarea'), document.body, true);
        }
        createAndMount(rootDiv, <React.StrictMode><RecommendedPrompts /></React.StrictMode>);
    }
    return true;
}

function injectPromptTools() {
    const sidebarSelectors = ['nav', '[role="navigation"]', '#sidebar', '.sidebar', '.left-rail', '.side-rail', '.column-left', '[data-sidebar]'];
    const sidebar = _safeQuerySelector(sidebarSelectors);
    if (document.querySelector('#click-prompt-tools-root')) return false;
    const form = document.querySelector('form');
    const textarea = document.querySelector('#prompt-textarea');
    const root = document.createElement('div');
    root.id = 'click-prompt-tools-root';
    root.style.pointerEvents = 'auto';
    root.style.width = '48px';
    root.style.height = '48px';
    root.style.borderRadius = '24px';
    root.style.display = 'flex';
    root.style.alignItems = 'center';
    root.style.justifyContent = 'center';
    root.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
    root.style.background = 'var(--bg, rgba(20,20,20,0.9))';
    root.style.color = 'var(--fg, #fff)';
    if (sidebar && form && form.parentElement) {
        const parent = form.parentElement;
        if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
        parent.appendChild(root);
        positionPromptAndWatch(root, textarea, parent);
    } else if (form && form.parentElement) {
        const parent = form.parentElement;
        if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
        parent.appendChild(root);
        positionPromptAndWatch(root, textarea, parent);
    } else if (textarea) {
        document.body.appendChild(root);
        positionPromptAndWatch(root, textarea, document.body);
    } else {
        root.style.position = 'fixed';
        root.style.right = '24px';
        root.style.bottom = '24px';
        document.body.appendChild(root);
    }
    createAndMount(root, <React.StrictMode><PromptAnalysis /></React.StrictMode>);
    return true;
}

// --- 메인 진입점 ---
const observer = new MutationObserver((mutations, obs) => {
    const promptsInjected = injectRecommendedPrompts();
    const promptToolsInjected = injectPromptTools();
    if (promptsInjected && promptToolsInjected) {
        obs.disconnect();
        console.log('CLICK: All UI components injected successfully.');
    }
});
observer.observe(document.body, { childList: true, subtree: true });