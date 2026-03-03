import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import Squares from '../components/Squares';
import axios from 'axios';

// Configure axios to use backend URL directly
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Analyze() {
  const [analyzing, setAnalyzing] = useState(false);
  const [paperId, setPaperId] = useState(null);
  const [paperName, setPaperName] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Starting analysis...');
  const navigate = useNavigate();

  const handleUploadSuccess = async (uploadedPaperId, fileName) => {
    setPaperId(uploadedPaperId);
    setPaperName(fileName);
    setAnalyzing(true);
    setProgress(10);
    setStatusText('Running core analysis...');

    try {
      // Step 1: Core analysis
      await axios.post(`${API_URL}/api/analyze/${uploadedPaperId}`, {}, { timeout: 600000 });
      setProgress(50);
      setStatusText('Running advanced analysis...');

      // Step 2: Advanced analysis
      try {
        await axios.post(`${API_URL}/api/advanced/analyze/${uploadedPaperId}`, {}, { timeout: 600000 });
        setProgress(95);
        setStatusText('Complete!');
      } catch (advErr) {
        console.warn('Advanced analysis failed, continuing with core report:', advErr);
        setProgress(95);
      }

      setTimeout(() => {
        navigate('/report', { state: { paperId: uploadedPaperId, paperName: fileName } });
      }, 800);

    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed: ' + (error.response?.data?.detail || error.message) + '\n\nShowing demo report instead.');
      setTimeout(() => {
        navigate('/report', { state: { paperId: uploadedPaperId, paperName: fileName } });
      }, 800);
    }
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 border-4 border-yellow-700/30 border-t-yellow-700 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{statusText}</h2>
          <div className="w-80 bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-700 to-orange-700 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-400 mt-4">{progress}% Complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 pt-24 pb-16 relative overflow-x-hidden">
      {/* Squares Background */}
      <div className="absolute inset-0 z-0 opacity-25">
        <Squares
          speed={0.4}
          squareSize={40}
          direction="diagonal"
          borderColor="#93C5FD"
          hoverFillColor="#DBEAFE"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Upload Zone */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-white mb-4">
                Upload Your <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Research</span>
              </h1>
              <p className="text-xl text-gray-300">
                Let our AI analyze your paper with cutting-edge RAG and LLM technology
              </p>
            </div>

            <UploadZone onUploadSuccess={handleUploadSuccess} />

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 grid grid-cols-2 gap-4"
            >
              {[
                { icon: '🤖', text: 'AI-Powered' },
                { icon: '⚡', text: 'Fast Analysis' },
                { icon: '🎯', text: 'High Accuracy' },
                { icon: '🔒', text: 'Secure' }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 p-4 bg-gray-900 backdrop-blur-sm rounded-lg border border-yellow-700/60 hover:border-orange-600 transition-all shadow-sm"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-white font-medium">{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Bird Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[600px] rounded-3xl overflow-hidden bg-transparent flex items-center justify-center relative"
          >
            <motion.div 
              className="text-center p-12"
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Bird SVG */}
              <svg className="w-64 h-64 mx-auto mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bird Body */}
                <ellipse cx="100" cy="120" rx="50" ry="60" fill="#fff" opacity="0.95"/>
                
                {/* Bird Head */}
                <circle cx="100" cy="70" r="35" fill="#fff" opacity="0.95"/>
                
                {/* Wing */}
                <path d="M 60 110 Q 30 100 40 130 Q 50 150 65 135 Z" fill="#E0F2FE" opacity="0.9"/>
                <path d="M 140 110 Q 170 100 160 130 Q 150 150 135 135 Z" fill="#E0F2FE" opacity="0.9"/>
                
                {/* Beak */}
                <path d="M 100 65 L 110 70 L 100 75 Z" fill="#F59E0B"/>
                
                {/* Eyes */}
                <circle cx="90" cy="65" r="5" fill="#1E40AF"/>
                <circle cx="110" cy="65" r="5" fill="#1E40AF"/>
                
                {/* Eye highlights */}
                <circle cx="91" cy="63" r="2" fill="#fff"/>
                <circle cx="111" cy="63" r="2" fill="#fff"/>
                
                {/* Feet */}
                <path d="M 85 175 L 80 185 M 85 175 L 85 185 M 85 175 L 90 185" stroke="#CD7F32" strokeWidth="3" strokeLinecap="round"/>
                <path d="M 115 175 L 110 185 M 115 175 L 115 185 M 115 175 L 120 185" stroke="#CD7F32" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              
              <h3 className="text-3xl font-bold text-white mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-300 text-lg font-medium">Fast, accurate, and intelligent research review</p>
            </motion.div>

            {/* Overlay Text */}
            <div className="absolute bottom-8 left-8 right-8 text-center">
              <p className="text-white text-lg font-semibold bg-yellow-800/30 backdrop-blur-sm py-3 px-6 rounded-full inline-block border border-yellow-700">
                Advanced GenAI Analysis Pipeline
              </p>
            </div>
          </motion.div>
        </div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            {
              title: 'Novelty Score',
              desc: 'Compare with existing research using RAG',
              icon: '💡',
              color: 'blue'
            },
            {
              title: 'Methodology',
              desc: 'Evaluate research soundness and rigor',
              icon: '🔬',
              color: 'indigo'
            },
            {
              title: 'Clarity Rating',
              desc: 'Assess writing quality and structure',
              icon: '📝',
              color: 'blue'
            },
            {
              title: 'Citation Check',
              desc: 'Analyze reference quality and bias',
              icon: '📚',
              color: 'blue'
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="relative p-6 bg-gray-900 rounded-xl border border-yellow-700/60 overflow-hidden group hover:scale-105 hover:border-orange-600 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative z-10">
                <div className="text-4xl mb-3">{card.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
