import React, { useMemo, useState, useRef, useEffect } from 'react';

const TAG_COLORS = {
  '모호/지시 불명확': '#FFF1CB',  // 빨간색 계열
  '구조/길이 중복': '#B7A3E3',  // 노란색 계열
  '문체/스타일 개선': '#C2E2FA', // 파란색 계열
  '오타/맞춤법': '#FF8F8F',     // 초록색 계열
};

export default function PromptAnalysis({ source, result, onClose, onApplyAll, panelStyle, onAnalyze, loading }) {
    const [enabledTags, setEnabledTags] = useState([]);
    const [appliedPatches, setAppliedPatches] = useState({});
    const bodyRef = useRef(null);
    const headerRef = useRef(null);
    const [bodyHeight, setBodyHeight] = useState();

    // 결과가 변경될 때 초기 태그 설정
    useEffect(() => {
        if (result?.tags) {
            setEnabledTags(result.tags);
            setAppliedPatches({});
        }
    }, [result]);

    const toggleTag = (tag) => {
        if (enabledTags.includes(tag)) {
            // 태그가 활성화 상태면 패치 적용
            applyPatches(tag);
        }
        setEnabledTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const applyPatches = (tag) => {
        if (!result?.patches?.[tag]) return;
        
        setAppliedPatches(prev => ({
            ...prev,
            [tag]: result.patches[tag].map(p => p.from)
        }));
    };

    const getColoredText = useMemo(() => {
        if (!result?.original_text) return source;
        
        let text = result.original_text;
        const replacements = [];

        Object.entries(result.patches || {}).forEach(([tag, patches]) => {
            if (!Array.isArray(patches)) return;
            
            patches.forEach(patch => {
                if (patch.from && patch.to) {
                    const isEnabled = enabledTags.includes(tag);
                    const isApplied = appliedPatches[tag]?.includes(patch.from);
                    
                    if (isEnabled && !isApplied) {
                        replacements.push({
                            from: patch.from,
                            to: `<span style="color: ${TAG_COLORS[tag]};">${patch.from}</span>`,
                            index: text.indexOf(patch.from)
                        });
                    } else if (isApplied) {
                        replacements.push({
                            from: patch.from,
                            to: patch.to,
                            index: text.indexOf(patch.from)
                        });
                    }
                }
            });
        });

        replacements
            .sort((a, b) => b.index - a.index)
            .forEach(({ from, to }) => {
                if (text.includes(from)) {
                    text = text.replace(from, to);
                }
            });

        return text;
    }, [result, enabledTags, appliedPatches, source]);

    const handleApplyAll = () => {
        let finalText = result.original_text;
        
        Object.entries(appliedPatches).forEach(([tag, appliedFroms]) => {
            if (!enabledTags.includes(tag)) return;
            
            result.patches[tag].forEach(patch => {
                if (appliedFroms.includes(patch.from)) {
                    finalText = finalText.replace(patch.from, patch.to);
                }
            });
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
                                borderRadius: '20px',
                                cursor: 'pointer',
                                background: enabledTags.includes(tag) ? 
                                    appliedPatches[tag] ? '#666' : TAG_COLORS[tag] 
                                    : 'transparent',
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