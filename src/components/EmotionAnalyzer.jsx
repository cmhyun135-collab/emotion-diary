import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const EMOJI_MAP = {
  '기쁨': '😊',
  '슬픔': '😢',
  '분노': '😤',
  '불안': '😰',
  '피곤': '😴',
  '설렘': '🥰',
};

const getEmoji = (emotion) => EMOJI_MAP[emotion] || '🤔';

// For the typing animation
const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    
    const timer = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

const EmotionAnalyzer = () => {
  const [diaryEntry, setDiaryEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const analyzeEmotion = async () => {
    if (!diaryEntry.trim()) {
      setError('일기 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다.');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `페르소나: 10년 경력의 심리 상담사이자 감정 코칭 전문가야. 따뜻하고 공감적인 말투로 사용자의 감정을 있는 그대로 인정해줘. 판단하거나 평가하지 않아.
컨텍스트: 사용자는 하루를 마무리하며 오늘 있었던 일을 짧게 적은 일기를 보내는 거야. 지치고 복잡한 감정을 정리하고 싶어하는 사람에게 답변한다고 생각해.
출력 스키마: 다른 설명 없이 아래 JSON만 출력해. 마크다운 코드블록 사용 금지.
{"emotion": "기쁨/슬픔/분노/불안/피곤/설렘 중 하나", "intensity": 1~5 숫자, "message": "30자 이내 한국어 공감 메시지"}`
      });

      const generationConfig = {
        temperature: 0.7,
        responseMimeType: "application/json",
      };

      const prompt = `오늘의 일기: ${diaryEntry}`;
      const apiResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = await apiResult.response;
      const text = response.text();
      const parsed = JSON.parse(text);

      setResult(parsed);
    } catch (err) {
      console.error(err);
      setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40 p-8 transition-all duration-300 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 pointer-events-none"></div>

      <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center tracking-tight relative z-10">오늘 하루 어떠셨나요?</h2>

      <div className="relative z-10">
        <textarea
          className="w-full h-36 p-4 mb-5 rounded-2xl border border-indigo-100 bg-white/90 text-gray-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 resize-none placeholder-gray-400 transition-shadow shadow-inner text-sm md:text-base leading-relaxed"
          placeholder="오늘 있었던 일이나 지금의 감정을 자유롭게 적어보세요..."
          value={diaryEntry}
          onChange={(e) => setDiaryEntry(e.target.value)}
          disabled={isLoading}
        />

        <button
          onClick={analyzeEmotion}
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              마음 읽는 중...
            </>
          ) : (
            '감정 분석하기'
          )}
        </button>
      </div>

      {error && (
        <div className="mt-5 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 shadow-sm relative z-10 animate-in fade-in zoom-in duration-300">
          {error}
        </div>
      )}

      {result && !error && (
        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 animate-in fade-in slide-in-from-bottom-6 duration-500 shadow-inner relative z-10">
          <div className="flex flex-col items-center justify-center mb-5">
            <span className="text-6xl mb-3 filter drop-shadow-md transform hover:scale-110 transition-transform duration-300 cursor-default">{getEmoji(result.emotion)}</span>
            <span className="text-xl font-bold text-indigo-900 bg-indigo-100/50 px-4 py-1 rounded-full">{result.emotion}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 mb-6">
            <span className="text-xs text-gray-500 font-semibold tracking-wider">감정 강도</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={"w-3.5 h-3.5 rounded-full transition-all duration-700 ease-out " + (i <= result.intensity ? 'bg-indigo-500 scale-110 shadow-sm' : 'bg-gray-200')}
                />
              ))}
            </div>
          </div>

          <div className="bg-white/90 p-5 rounded-2xl border border-indigo-100 shadow-sm relative">
            <div className="absolute -top-2 -left-2 text-indigo-200 text-3xl">"</div>
            <div className="absolute -bottom-6 -right-2 text-indigo-200 text-3xl">"</div>
            <p className="text-gray-700 text-center font-medium leading-relaxed relative z-10">
              <TypewriterText text={result.message} />
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionAnalyzer;
