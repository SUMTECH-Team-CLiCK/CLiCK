import React, { useState } from 'react';
import axios from 'axios';
import PromptAnalysis from './PromptAnalysis';

const API = 'http://localhost:3001/api';

export default function PromptInput({ onSend, onOverwriteInput }) {
  const [value, setValue] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!value.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/analyze-prompt`, { prompt: value });
      setAnalysis({ source: value, result: res.data });
    } catch {
      alert('분석 실패');
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
