import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Brain, TrendingUp, BarChart3, FileCheck } from 'lucide-react';
import CustomButton from '../components/CustomButton';
import Squares from '../components/Squares';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced LLM technology evaluates your research with precision and depth"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "4-Metric Evaluation",
      description: "Novelty, Methodology, Clarity, and Citations - comprehensively assessed"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bias Detection",
      description: "Identifies 5 types of research bias to ensure objective evaluation"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "RAG Technology",
      description: "Retrieval-Augmented Generation compares your work against research databases"
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Detailed Reports",
      description: "Download comprehensive PDF reports with actionable feedback"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Instant Feedback",
      description: "Get scores and explanations within minutes, not weeks"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 overflow-x-hidden">
      {/* Squares Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Squares
          speed={0.3}
          squareSize={45}
          direction="diagonal"
          borderColor="#B8860B"
          hoverFillColor="#FFF8DC"
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-700 rounded-full filter blur-[120px] opacity-20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-700 rounded-full filter blur-[120px] opacity-20"></div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-tight text-white">
                <span className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-orange-600 bg-clip-text text-transparent">
                  PaperLens
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl font-light">
                Revolutionary AI-powered platform that evaluates research papers with
                <span className="text-yellow-600 font-medium"> cutting-edge RAG</span> and 
                <span className="text-orange-600 font-medium"> LLM technology</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-16">
                <CustomButton onClick={() => navigate('/analyze')}>
                  S T A R T
                </CustomButton>

                <a href="#features">
                  <CustomButton>
                    L E A R N  M O R E
                  </CustomButton>
                </a>
              </div>
            </motion.div>

            {/* Right: Logo Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                {/* Decorative Circle Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-700 to-orange-700 rounded-full opacity-10 blur-3xl"></div>
                
                {/* Flappy Bird SVG */}
                <svg className="w-full h-96 relative z-10" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Bird Body */}
                  <ellipse cx="150" cy="170" rx="70" ry="85" fill="url(#yellowGradient)" opacity="0.95"/>
                  
                  {/* Bird Head */}
                  <circle cx="150" cy="100" r="50" fill="url(#yellowGradient)" opacity="0.95"/>
                  
                  {/* Wing Left */}
                  <path 
                    d="M 90 150 Q 50 140 60 180 Q 75 210 95 190 Z" 
                    fill="#FFFFFF" 
                    opacity="0.9"
                  />
                  
                  {/* Wing Right */}
                  <path 
                    d="M 210 150 Q 250 140 240 180 Q 225 210 205 190 Z" 
                    fill="#FFFFFF" 
                    opacity="0.9"
                  />
                  
                  {/* Beak */}
                  <path d="M 150 95 L 165 103 L 150 111 Z" fill="#F59E0B"/>
                  
                  {/* Eyes */}
                  <circle cx="135" cy="95" r="8" fill="#1E40AF"/>
                  <circle cx="165" cy="95" r="8" fill="#1E40AF"/>
                  
                  {/* Eye highlights */}
                  <circle cx="137" cy="92" r="3" fill="#fff"/>
                  <circle cx="167" cy="92" r="3" fill="#fff"/>
                  
                  {/* Feet */}
                  <path d="M 125 245 L 118 260 M 125 245 L 125 260 M 125 245 L 132 260" stroke="#CD7F32" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M 175 245 L 168 260 M 175 245 L 175 260 M 175 245 L 182 260" stroke="#CD7F32" strokeWidth="4" strokeLinecap="round"/>
                  
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#B8860B" />
                      <stop offset="100%" stopColor="#CD7F32" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-1 h-16 bg-gradient-to-b from-yellow-700 to-transparent"></div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6 md:px-12 bg-gray-950 border-y border-yellow-800/40">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              ADVANCED <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">CAPABILITIES</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powered by state-of-the-art AI technology for comprehensive research evaluation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative p-8 bg-gray-900 border border-gray-700 rounded-2xl hover:border-yellow-700/60 hover:shadow-xl hover:shadow-yellow-900/20 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 to-orange-700 rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                
                <div className="text-yellow-600 mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-white">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-32 px-6 md:px-12 bg-gradient-to-br from-gray-950 to-black border-y border-yellow-800/40">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              HOW IT <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">WORKS</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "UPLOAD", desc: "Submit your research paper PDF" },
              { step: "02", title: "ANALYZE", desc: "AI processes and evaluates content" },
              { step: "03", title: "REVIEW", desc: "Get detailed scores and feedback" },
              { step: "04", title: "IMPROVE", desc: "Download report and enhance your work" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -15, scale: 1.05 }}
                className="text-center p-6 bg-gray-900 rounded-2xl border border-yellow-700/60 hover:border-orange-600 hover:shadow-xl hover:shadow-yellow-900/20 transition-all cursor-pointer"
              >
                <div className="text-6xl font-bold bg-gradient-to-br from-yellow-700 to-orange-700 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6 md:px-12 bg-gradient-to-br from-black via-gray-900 to-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white">
            READY TO ELEVATE YOUR <span className="text-yellow-600">RESEARCH?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join researchers worldwide who trust AI-powered analysis
          </p>
          <div className="flex justify-center">
            <CustomButton onClick={() => navigate('/analyze')}>
              G E T  S T A R T E D
            </CustomButton>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
