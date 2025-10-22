import React, { useMemo, useState, useRef, useEffect } from 'react';

export default function PromptAnalysis({ source, result, onClose, onApplyAll, panelStyle }) {
    const [enabledTags, setEnabledTags] = useState(() => result.tags || []);
    const bodyRef = useRef(null);
    const headerRef = useRef(null);
    const [bodyHeight, setBodyHeight] = useState();

    const toggleTag = (tag) => {
        setEnabledTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };
    const patchedText = useMemo(() => {
        if (!result.patches) return source;
        let output = source;
        enabledTags.forEach(tag => {
            (result.patches[tag] || []).forEach(p => {
                output = output.replace(p.from, p.to);
            });
        });
        return output;
    }, [enabledTags, source, result]);
    const fallbackStyle = {
        color: (panelStyle && panelStyle.color) || 'var(--token-text-primary, #222)',
        background: (panelStyle && panelStyle.background) || 'var(--token-main-surface-primary, #fff)',
        fontFamily: (panelStyle && panelStyle.fontFamily) || 'var(--font-sans, Inter, Noto Sans KR, Apple SD Gothic Neo, Arial, sans-serif)',
        fontSize: (panelStyle && panelStyle.fontSize) || 'var(--composer-font-size, 1rem)',
        width: panelStyle && panelStyle.width,
    };
    // 입력창 높이 + header 높이만큼 전체 패널 높이
    useEffect(() => {
    //     if (!panelStyle || !panelStyle.minHeight) return;
    //     if (!headerRef.current) return;
    //     const headerH = headerRef.current.offsetHeight || 0;
    //     setBodyHeight(`calc(${panelStyle.minHeight} + ${headerH}px)`);
    //     // setBodyHeight(panelStyle.minHeight);
    // }, [panelStyle, headerRef.current]);
    if (!panelStyle || !panelStyle.minHeight || !headerRef.current) {
            return;
        }
        // panelStyle이 변경될 때마다 header의 높이를 다시 측정
        const headerH = headerRef.current.offsetHeight || 0;
        // 본문 높이 = (입력창 높이 - 헤더 높이)
        setBodyHeight(`calc(${panelStyle.minHeight} + ${headerH}px)`);
    }, [panelStyle]); // 의존성 배열에서 headerRef.current 제거
    return (
        <div className="click-analysis-panel" style={{...panelStyle, ...fallbackStyle}}>
            <div className="panel-header" style={fallbackStyle} ref={headerRef}>
                <h3>GPT Prompt Analysis</h3>
                <div className="tag-bar">
                    {(result.tags || []).map(tag => (
                        <button 
                            key={tag} 
                            className={`tag ${enabledTags.includes(tag) ? 'active' : ''}`}
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
                <button className="apply-all-btn" onClick={() => onApplyAll(result.full_suggestion || patchedText)}>
                    전체 수정
                </button>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="panel-body" ref={bodyRef} style={{borderTop: '1px solid var(--token-border-light, #d9d9e3)', padding: 0, height: bodyHeight, overflow: 'auto', background: 'inherit'}}>
                <pre className="text-container" style={{...fallbackStyle, margin: 0, padding: '1rem', whiteSpace: 'pre-wrap', border: 'none', background: 'none', boxShadow: 'none'}}>{patchedText}</pre>
            </div>
        </div>
    );
}