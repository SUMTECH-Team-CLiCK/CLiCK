import React, { useMemo, useState, useRef, useEffect } from 'react';

const TAG_COLORS = {
  '모호/지시 불명확': '#7BEB75',  
  '구조/길이 중복': '#B7A3E3',  
  '문체/스타일 개선': '#C2E2FA', 
  '오타/맞춤법': '#FF8F8F',     
};

export default function PromptAnalysis({ source, result, onClose, onApplyAll, panelStyle, onAnalyze, loading }) {
    const [enabledTags, setEnabledTags] = useState([]);
    const bodyRef = useRef(null);
    const headerRef = useRef(null);
    const [bodyHeight, setBodyHeight] = useState();

    // 결과가 변경될 때 태그 상태 초기화
    useEffect(() => {
        if (result?.tags) {
            // 모든 태그를 활성화 상태로 시작
            setEnabledTags(result.tags);
        }
    }, [result]);

    const toggleTag = (tag) => {
        setEnabledTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const getColoredText = useMemo(() => {
        if (!result?.full_suggestion) return source;
        
        let text = result.full_suggestion;
        const replacements = [];

        Object.entries(patchesByTag || {}).forEach(([tag, patches]) => {
            if (!Array.isArray(patches)) return;
            
            patches.forEach(patch => {
                // 활성화된 태그의 교정된 텍스트(to)에만 색상 적용
                if (enabledTags.includes(tag) && text.includes(patch.to)) {
                    replacements.push({
                        from: patch.to,
                        to: `<span style="color: ${TAG_COLORS[tag]};">${patch.to}</span>`,
                        index: text.indexOf(patch.to)
                    });
                }
            });
        });

        // 뒤에서부터 적용하여 인덱스 문제 방지
        replacements
            .sort((a, b) => b.index - a.index)
            .forEach(({ from, to }) => {
                if (text.includes(from)) {
                    text = text.replace(from, to);
                }
            });

        return text;
    }, [result, enabledTags, source]);

    // Apply 버튼 클릭 시 활성화된 태그의 교정사항만 적용
    const handleApplyAll = () => {
        if (!result?.full_suggestion) return;
        
        // 활성화된 태그의 교정사항만 적용
        let finalText = result.original_text;
        Object.entries(result.patches || {}).forEach(([tag, patches]) => {
            if (Array.isArray(patches) && enabledTags.includes(tag)) {
                patches.forEach(patch => {
                    finalText = finalText.replace(patch.from, patch.to);
                });
            }
        });

        onApplyAll(finalText);
    };

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
        const height = Math.min(parseInt(panelStyle.minHeight, 10), maxHeight);
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
                    {(tags || []).map(tag => (
                        <button 
                            key={tag} 
                            className={`tag ${enabledTags.includes(tag) ? 'active' : ''}`}
                            onClick={() => toggleTag(tag)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                background: enabledTags.includes(tag) ? 
                                    TAG_COLORS[tag] : 'transparent',
                                color: enabledTags.includes(tag) ? '#fff' : '#666',
                                transition: 'all 0.2s ease'
                            }}
                        >
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
                        </button>
                    ))}
                </div>

                <button className="apply-all-btn" 
                    onClick={handleApplyAll}>
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
