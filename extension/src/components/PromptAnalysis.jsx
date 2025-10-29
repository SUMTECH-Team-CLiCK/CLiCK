import React, { useMemo, useState, useRef, useEffect } from 'react';

export default function PromptAnalysis({ source, result, onClose, onApplyAll, panelStyle, onAnalyze, loading }) {
    const [enabledTags, setEnabledTags] = useState(() => result.tags || []);
    const bodyRef = useRef(null);
    const headerRef = useRef(null);
    const [bodyHeight, setBodyHeight] = useState();
    // const prinput = new

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
        if (!panelStyle || !panelStyle.minHeight || !headerRef.current) {
            return;
        }

        const maxHeight = 1200;

        setBodyHeight(`${panelStyle.minHeight}px`);
    }, [panelStyle, headerRef.current]);
    return (
        <div className="click-analysis-panel" style={{...panelStyle, ...fallbackStyle}}>
            <div className="panel-header" style={fallbackStyle} ref={headerRef}>
                <h3>GPT Prompt Analysis</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="panel-body" ref={bodyRef} style={{padding: 0, height: bodyHeight, overflow: 'auto', background: 'inherit'}}>
                <div className="text-container" style={{...fallbackStyle, margin: 0, whiteSpace: 'pre-wrap', border: 'none', background: 'none', boxShadow: 'none'}}>{patchedText}</div>
            </div>

            <div className='panel-footer' style={fallbackStyle}> 
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
                    <h3>apply</h3>
                </button>

                <button className="analysis-btn" onClick={onAnalyze} disabled={loading}>
                    <h3>
                        {loading ? 'analyzing...' : 'analyze'}
                    </h3>
                </button>
            </div>
        </div>
    );
}