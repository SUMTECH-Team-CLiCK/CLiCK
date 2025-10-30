import React, { useMemo, useState, useRef, useEffect } from 'react';

const TAG_COLORS = {
  '모호/지시 불명확': '#7BEB75',  
  '구조/길이 중복': '#B7A3E3',  
  '문체/스타일 개선': '#C2E2FA', 
  '오타/맞춤법': '#FF8F8F',     
};

export default function PromptAnalysis({ source, result, onClose, onApplyAll, panelStyle, onAnalyze, loading }) {
    const [enabledTags, setEnabledTags] = useState([]);
    const [appliedPatches, setAppliedPatches] = useState({});
    const bodyRef = useRef(null);
    const headerRef = useRef(null);
    const [bodyHeight, setBodyHeight] = useState();
    const [currentText, setCurrentText] = useState('');

    // 결과가 변경될 때 초기화 (태그는 비활성 상태로)
    useEffect(() => {
        setCurrentText(result.full_suggestion); // 교정된 프롬프트로 시작
        if (result?.full_suggestion) {
            setEnabledTags([]); // 태그는 모두 비활성화 상태로
            setAppliedPatches({});
        }
    }, [result]);

    // 태그 상태에 따라 텍스트 업데이트
    const updateTextWithTags = (toggledTag, isEnabled) => {
        let updatedText = result.full_suggestion; // 교정된 상태에서 시작
        
        // 현재 활성화된 태그들에 대해
        const updatedEnabledTags = isEnabled ? 
            [...enabledTags, toggledTag] : 
            enabledTags.filter(t => t !== toggledTag);
            
        // 활성화된 태그의 패치들은 원래 텍스트로 되돌림
        Object.entries(result.patches || {}).forEach(([tag, patches]) => {
            if (Array.isArray(patches) && updatedEnabledTags.includes(tag)) {
                patches.forEach(patch => {
                    updatedText = updatedText.replace(patch.to, patch.from);
                });
            }
        });

        setCurrentText(updatedText);
    };

    const toggleTag = (tag) => {
        setEnabledTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
        
        // 태그 토글 시 텍스트 업데이트
        updateTextWithTags(tag, !enabledTags.includes(tag));
    };

    // const applyPatches = (tag) => {
    //     if (!result?.patches?.[tag]) return;
        
    //     setAppliedPatches(prev => ({
    //         ...prev,
    //         [tag]: result.patches[tag].map(p => p.from)
    //     }));
    // };

    const getColoredText = useMemo(() => {
        if (!currentText) return source;

        
        let text = currentText;
        const replacements = [];

        Object.entries(result.patches || {}).forEach(([tag, patches]) => {
            if (!Array.isArray(patches)) return;
            
            patches.forEach(patch => {
                const isEnabled = enabledTags.includes(tag);
                
                if (isEnabled && text.includes(patch.from)) {
                    replacements.push({
                        from: patch.from,
                        to: `<span style="color: ${TAG_COLORS[tag]};">${patch.from}</span>`,
                        index: text.indexOf(patch.from)
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
    }, [currentText, enabledTags, result]);

    // 최종 적용
    const handleApplyAll = () => {
        onApplyAll(currentText);
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