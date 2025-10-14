import React, { useState } from 'react';
// axios는 이제 background에서만 사용하므로 여기서 import할 필요가 없습니다.
import PromptAnalysis from './PromptAnalysis';

export default function PromptInput({ onSend, onOverwriteInput }) {
  const [value, setValue] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!value.trim()) return;
    setLoading(true);

    try {
      // background.js에 메시지를 보내고 응답을 기다립니다.
      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_PROMPT',
        prompt: value
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      setAnalysis({ source: value, result: response });

    } catch (err) {
      console.error('분석 실패:', err);
      alert('분석에 실패했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prompt-input-area">
      <form className="prompt-form" onSubmit={(e) => { e.preventDefault(); onSend(value); setValue(''); }}>
        <textarea rows={3} value={value} onChange={e => setValue(e.target.value)} placeholder="프롬프트를 입력하세요" />
        <div className="prompt-buttons">
          <button type="button" className="analyze-button" onClick={handleAnalyze}>
            분석하기
          </button>
          <button type="submit">보내기</button>
        </div>
      </form>

      {analysis && (
        <PromptAnalysis
          source={analysis.source}
          result={analysis.result}
          onClose={() => setAnalysis(null)}
          onApplyAll={(txt) => { onOverwriteInput(txt); setAnalysis(null); }}
        />
      )}
    </div>
  );
}