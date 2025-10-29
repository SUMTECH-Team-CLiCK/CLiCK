import React, { useMemo, useState, useRef, useEffect } from 'react';

const TAG_COLORS = {
  '모호/지시 불명확': '#FF6B6B',  // 빨간색 계열
  '구조/길이 중복': '#FFD93D',  // 노란색 계열
  '문체/스타일 개선': '#4DABF7', // 파란색 계열
  '오타/맞춤법': '#38D9A9',     // 초록색 계열
  '용어/표현': '#845EF7'      // 보라색 계열
};

export default function PromptAnalysis({ source, result, onClose, onApplyAll, panelStyle, onAnalyze, loading }) {
    // enabledTags 상태 초기화를 빈 배열로 변경
    const [enabledTags, setEnabledTags] = useState([]);
    const bodyRef = useRef(null);
    const headerRef = useRef(null);
    const [bodyHeight, setBodyHeight] = useState();

    // 태그 토글 함수
    const toggleTag = (tag) => {
        setEnabledTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // patches와 태그를 매핑하여 텍스트에 색상을 적용하는 함수
    const getColoredText = useMemo(() => {
        if (!result || !result.full_suggestion) return source;
        
        let coloredText = result.full_suggestion;
        let replacements = [];

        // patches 정보 수집
        Object.entries(result.patches || {}).forEach(([tag, patches]) => {
            if (Array.isArray(patches)) {
                patches.forEach(p => {
                    if (p.from && p.to) {
                        replacements.push({
                            tag,
                            from: p.from,
                            to: p.to,
                            color: TAG_COLORS[tag]
                        });
                    }
                });
            }
        });

        // HTML로 변환
        replacements.forEach(({ tag, from, to, color }) => {
            if (enabledTags.includes(tag)) {
                const span = `<span style="color: ${color};">${to}</span>`;
                coloredText = coloredText.replace(from, span);
            }
        });

        return coloredText;
    }, [result, enabledTags, source]);

    const fallbackStyle = {
        color: (panelStyle && panelStyle.color) || 'var(--token-text-primary, #222)',
        background: (panelStyle && panelStyle.background) || 'var(--token-main-surface-primary, #fff)',
        fontFamily: (panelStyle && panelStyle.fontFamily) || 'var(--font-sans, Inter, Noto Sans KR, Apple SD Gothic Neo, Arial, sans-serif)',
        fontSize: (panelStyle && panelStyle.fontSize) || 'var(--composer-font-size, 1rem)',
        width: panelStyle && panelStyle.width,
    };

    useEffect(() => {
    if (!panelStyle?.minHeight || !headerRef.current) return;
    const maxHeight = 600;
    const height = Math.min(panelStyle.minHeight, maxHeight);
    setBodyHeight(`${height}px`);
}, [panelStyle, headerRef]);


    return (
        <div className="click-analysis-panel" style={{...panelStyle, ...fallbackStyle}}>
            <div className="panel-header" style={fallbackStyle} ref={headerRef}>
                <h3>GPT Prompt Analysis</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="panel-body" ref={bodyRef} 
                style={{padding: 0, height: bodyHeight, overflow: 'auto', background: 'inherit'}}>
                <div className="text-container" 
                    style={{...fallbackStyle, margin: 0, whiteSpace: 'pre-wrap', border: 'none', background: 'none', boxShadow: 'none'}}
                    dangerouslySetInnerHTML={{ __html: getColoredText }}>
                </div>
            </div>

            <div className='panel-footer' style={fallbackStyle}> 
                <div className="tag-bar">
                    {(result.tags || []).map(tag => (
                        <button 
                            key={tag} 
                            className={`tag ${enabledTags.includes(tag) ? 'active' : ''}`}
                            onClick={() => toggleTag(tag)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                background: enabledTags.includes(tag) ? TAG_COLORS[tag] : 'transparent',
                                color: enabledTags.includes(tag) ? '#fff' : '#666',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {/* 태그 색상 도트 */}
                            <span 
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: TAG_COLORS[tag],
                                    display: 'inline-block'
                                }}
                            />
                            {tag}
                            {/* X 버튼 */}
                            <span 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTag(tag);
                                }}
                                style={{
                                    marginLeft: '4px',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                ×
                            </span>
                        </button>
                    ))}
                </div>

                <button className="apply-all-btn" 
                    onClick={() => onApplyAll(result.full_suggestion || getColoredText)}>
                    <h3>apply</h3>
                </button>

                <button className="analysis-btn" 
                    onClick={onAnalyze} 
                    disabled={loading}>
                    <h3>
                        {loading ? 'analyzing...' : 'analyze'}
                    </h3>
                </button>
            </div>
        </div>
    );
}