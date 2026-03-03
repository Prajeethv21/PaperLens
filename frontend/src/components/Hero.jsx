import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useState } from 'react';
import NeuralNetwork from '../three/NeuralNetwork';
import FloatingOrbs from '../three/FloatingOrbs';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1
    });
  };

  return (
    <div
      className="relative h-screen w-full bg-deep-black overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 15]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <NeuralNetwork mousePosition={mousePosition} />
          <FloatingOrbs count={20} mousePosition={mousePosition} />
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center"
        >
          <motion.h1
            className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              backgroundSize: '200% 200%'
            }}
          >
            AI Research
            <br />
            <span className="inline-block animate-glitch">Reviewer</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Next-Generation AI-Powered Research Paper Analysis
            <br />
            <span className="text-neon-blue">RAG + LLM + Bias Detection</span>
          </motion.p>

          <motion.a
            href="#analyze"
            className="inline-block px-12 py-5 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-lg rounded-full shadow-neon hover:shadow-neon-purple transition-all duration-300 transform hover:scale-110"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            Start Analysis
            <span className="ml-2 inline-block animate-bounce">→</span>
          </motion.a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-neon-blue" />
        </motion.div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-black/50 to-deep-black pointer-events-none" />
    </div>
  );
}
