import React, { useMemo, useState } from 'react';

export default function PromptAnalysis({ source, result, onClose, onApplyAll }) {
    // 활성화된 태그들을 관리
    const [enabledTags, setEnabledTags] = useState(() => result.tags || []);

    const toggleTag = (tag) => {
        setEnabledTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // 활성화된 태그에 따라 수정된 텍스트를 계산
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

    return (
        <div className="click-analysis-panel">
            <div className="panel-header">
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
            <div className="panel-body">
                <div className="text-container original">
                    <p>{source}</p>
                </div>
                <div className="text-container suggestion">
                    <p>{patchedText}</p>
                </div>
            </div>
        </div>
    );
}