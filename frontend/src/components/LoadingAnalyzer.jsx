import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Squares from './Squares';

const analysisSteps = [
  { step: 1, text: 'Uploading paper...', icon: '📤', duration: 800 },
  { step: 2, text: 'Parsing PDF...', icon: '📄', duration: 1000 },
  { step: 3, text: 'Running AI analysis...', icon: '🤖', duration: 1200 },
  { step: 4, text: 'Comparing with research...', icon: '🔍', duration: 1000 },
  { step: 5, text: 'Generating scores...', icon: '📊', duration: 800 },
  { step: 6, text: 'Creating report...', icon: '✨', duration: 600 },
];

export default function LoadingAnalyzer({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (currentStep >= analysisSteps.length) {
      // All visual steps done, now we're waiting for real backend
      setWaiting(true);
      // Don't call onComplete - let the parent component navigate when ready
      return;
    }

    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, analysisSteps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const progress = waiting ? 95 : ((currentStep / analysisSteps.length) * 95).toFixed(0);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/95 backdrop-blur-sm flex items-center justify-center overflow-hidden">
      {/* Squares Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Squares
          speed={0.5}
          squareSize={35}
          direction="diagonal"
          borderColor="#A5B4FC"
          hoverFillColor="#E0E7FF"
        />
      </div>

      <div className="max-w-2xl w-full px-8 relative z-10">
        {/* Animated Bird Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ 
              y: [0, -15, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg className="w-32 h-32 mx-auto" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" fill="url(#analyzerGradient)" opacity="0.1"/>
              <ellipse cx="100" cy="120" rx="45" ry="50" fill="url(#analyzerGradient)"/>
              <circle cx="100" cy="75" r="30" fill="url(#analyzerGradient)"/>
              <path d="M 70 105 Q 45 95 50 125 Q 60 145 75 130 Z" fill="#FFFFFF" opacity="0.9"/>
              <path d="M 130 105 Q 155 95 150 125 Q 140 145 125 130 Z" fill="#FFFFFF" opacity="0.9"/>
              <path d="M 100 70 L 108 75 L 100 80 Z" fill="#F59E0B"/>
              <circle cx="92" cy="72" r="4" fill="#1E40AF"/>
              <circle cx="108" cy="72" r="4" fill="#1E40AF"/>
              <circle cx="93" cy="70" r="1.5" fill="#fff"/>
              <circle cx="109" cy="70" r="1.5" fill="#fff"/>
              <defs>
                <linearGradient id="analyzerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B8860B" />
                  <stop offset="100%" stopColor="#CD7F32" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white mt-6 mb-2"
          >
            Analyzing Your Research
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-400"
          >
            AI is processing your paper...
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-400">Progress</span>
            <span className="text-sm font-bold text-yellow-700">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-700 to-orange-700 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {analysisSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center space-x-4 p-4 rounded-xl
                ${completedSteps.includes(index)
                  ? 'bg-gray-800 border-2 border-yellow-800/60 shadow-sm'
                  : currentStep === index
                  ? 'bg-gray-800 border-2 border-yellow-700/60 shadow-md'
                  : 'bg-gray-900 border-2 border-gray-700'
                }
                transition-all duration-300
              `}
            >
              <motion.div
                className="text-3xl"
                animate={currentStep === index ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.6, repeat: currentStep === index ? Infinity : 0 }}
              >
                {completedSteps.includes(index) ? '✅' : step.icon}
              </motion.div>
              <div className="flex-1">
                <p className={`font-medium ${
                  completedSteps.includes(index) ? 'text-yellow-600' :
                  currentStep === index ? 'text-yellow-700' : 'text-gray-400'
                }`}>
                  {step.text}
                </p>
              </div>
              {currentStep === index && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-3 border-yellow-700 border-t-transparent rounded-full"
                />
              )}
            </motion.div>
          ))}

          {/* Final waiting step */}
          {waiting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4 p-4 rounded-xl bg-gray-800 border-2 border-yellow-800/60 shadow-lg"
            >
              <motion.div
                className="text-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 15, -15, 0]
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🔬
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-yellow-700">
                  AI is completing deep analysis...
                </p>
                <p className="text-sm text-yellow-800 mt-1">
                  This may take 1-2 minutes for comprehensive evaluation
                </p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-3 border-yellow-700 border-t-transparent rounded-full"
              />
            </motion.div>
          )}
        </div>

        {/* Fun Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 p-4 bg-gray-800/80 rounded-xl border border-yellow-800/40"
        >
          <p className="text-sm text-gray-300 text-center">
            <span className="text-xl mr-2">💡</span>
            <span className="font-medium">Tip:</span> Our AI runs comprehensive analysis including RAG comparison, LLM evaluation, and bias detection. This typically takes 1-2 minutes.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
