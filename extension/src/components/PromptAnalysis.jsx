import React, { useMemo, useState, useRef, useEffect } from 'react';

const TAG_COLORS = {
  '모호/지시 불명확': '#FF6B6B',  // 빨간색 계열
  '구조/길이 중복': '#FFD93D',  // 노란색 계열
  '문체/스타일 개선': '#4DABF7', // 파란색 계열
  '오타/맞춤법': '#38D9A9',     // 초록색 계열
  '용어/표현': '#845EF7'      // 보라색 계열
};

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
                            {/* 태그 색상을 나타내는 원형 도트 */}
                            <span 
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: TAG_COLORS[tag],
                                    display: 'inline-block',
                                    marginRight: '6px',
                                }}
                            />
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