import React from 'react';
import EmotionAnalyzer from './components/EmotionAnalyzer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <EmotionAnalyzer />
    </div>
  );
}

export default App;
