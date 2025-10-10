import React, { useState } from 'react';
import axios from 'axios';
import PromptAnalysis from './PromptAnalysis';

const PromptInput = ({ onSendMessage }) => {
  const [prompt, setPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const response = await axios.post('http://localhost:3001/api/analyze-prompt', { prompt });
      setAnalysisResult({ original_prompt: prompt, ...response.data });
    } catch (error) {
      console.error('Failed to analyze prompt:', error);
      alert('프롬프트 분석에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestedPrompt) => {
    setPrompt(suggestedPrompt);
    setAnalysisResult(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt) return;
    onSendMessage(prompt);
    setPrompt('');
  };

  return (
    <div className="prompt-input-area">
      {isLoading && <div className="loading-overlay">분석 중...</div>}
      {analysisResult && (
        <PromptAnalysis 
          result={analysisResult}
          onApply={handleApplySuggestion}
          onClose={() => setAnalysisResult(null)}
        />
      )}
      <form onSubmit={handleSubmit} className="prompt-form">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="메시지를 입력하세요..."
          rows="3"
        />
        <div className="prompt-buttons">
            <button type="button" className="analyze-button" onClick={handleAnalyze}>
                프롬프트 분석
            </button>
            <button type="submit">전송</button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;
