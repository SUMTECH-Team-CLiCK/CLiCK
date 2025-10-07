import React from 'react';

const PromptAnalysis = ({ result, onApply, onClose }) => {
  if (!result) return null;

  return (
    <div className="prompt-analysis-container">
      <div className="analysis-header">
        <h4>프롬프트 수정 제안</h4>
        <div className="analysis-tags">
            {result.analysis?.map((item, i) => <span key={i} className="tag">{item.tag}</span>)}
        </div>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="analysis-body">
        <div className="analysis-box suggested">
          <h5>✅ 수정 제안</h5>
          <p>{result.suggested_prompt}</p>
        </div>
        <div className="analysis-box original">
          <h5>📝 원본</h5>
          <p>{result.original_prompt}</p>
        </div>
      </div>
      <div className="analysis-footer">
        <button onClick={() => onApply(result.suggested_prompt)} className="apply-button">
          전체 수정 적용하기
        </button>
      </div>
    </div>
  );
};

export default PromptAnalysis;
