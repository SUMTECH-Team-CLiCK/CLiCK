import React, { useMemo, useState } from 'react';

export default function PromptAnalysis({ source, result, onClose, onApplyAll }) {
  const [enabledTags, setEnabledTags] = useState([]);

  const patched = useMemo(() => {
    let out = source;
    enabledTags.forEach(tag => {
      (result.patches[tag] || []).forEach(p => {
        out = out.replace(p.from, p.to);
      });
    });
    return out;
  }, [enabledTags, source, result]);

  return (
    <div className="analysis-container">
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
        <h3 style={{ flex: 1 }}>프롬프트 분석</h3>
        <button onClick={onClose}>닫기</button>
      </div>
      <div style={{ display: 'flex', padding: '8px' }}>
        <textarea value={source} readOnly style={{ flex: 1, marginRight: '8px' }} />
        <textarea value={patched} readOnly style={{ flex: 1 }} />
      </div>
      <div style={{ padding: '8px' }}>
        {(result.tags || []).map(tag => (
          <button key={tag} onClick={() =>
            setEnabledTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
          }>
            {enabledTags.includes(tag) ? '✅ ' : ''}{tag}
          </button>
        ))}
        <button onClick={() => onApplyAll(result.full_suggestion || patched)}>전체 수정</button>
      </div>
    </div>
  );
}
